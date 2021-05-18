use anyhow::{anyhow, Result};
use chrono::{DateTime, Utc};
use clap::{crate_version, AppSettings, Clap};
use env_logger::Builder;
use log::LevelFilter;
use peppi::game::Game;
use rayon::prelude::*;
use std::path::PathBuf;
use std::time::Instant;
use walkdir::{DirEntry, WalkDir};

#[macro_use]
extern crate log;

mod players;
use players::{determine_winners, player_states, Player};
mod enums;
mod sql;

/// Create SQLite database from Slippi replays
#[derive(Clap)]
#[clap(
    version = crate_version!(),
    author = "Max \"DJSwerve\" Timkovich <max@timkovi.ch>"
)]
#[clap(setting = AppSettings::ColoredHelp)]
struct Opts {
    /// Directories to search for .slp files in
    #[clap(required(true))]
    directories: Vec<PathBuf>,
    /// Set output database file
    #[clap(short, long, default_value = "slippi.db")]
    output_db: String,
}

fn is_slp(entry: &DirEntry) -> Option<PathBuf> {
    if let Some(s) = entry.file_name().to_str() {
        if s.ends_with(".slp") {
            return Some(entry.path().to_path_buf());
        }
    }

    None
}

/// Get all slippi files in a directory recursively.
fn get_slippis(dirs: &Vec<PathBuf>) -> Result<Vec<PathBuf>> {
    let mut entries = Vec::new();
    for dir in dirs {
        entries.append(
            &mut WalkDir::new(dir)
                .into_iter()
                .filter_map(|e| e.ok().and_then(|e| is_slp(&e)))
                .collect(),
        );
    }

    Ok(entries)
}

#[derive(Debug)]
pub struct GameEntry {
    filepath: String,
    is_teams: bool,
    duration: f32,
    stage: String,
    start_time: DateTime<Utc>,
    players: Vec<Player>,
}

impl GameEntry {
    pub fn new(game: &Game, filepath: &str) -> Result<Self> {
        let mut duration = game.metadata.duration.ok_or(anyhow!("no duration"))? as f32;
        let start_time = game.metadata.date.ok_or(anyhow!("no start_time"))?;
        let stage = enums::stage(game.start.stage).ok_or(anyhow!("no stage"))?;
        let is_teams = game.start.is_teams;

        // frames to minutes
        duration /= 3600.;

        if duration < 0.5 {
            return Err(anyhow!("game < 30s"));
        }

        let players = player_states(game);
        if players.is_empty() {
            return Err(anyhow!("no player tags"));
        }

        determine_winners(&players);

        Ok(GameEntry {
            filepath: filepath.to_string(),
            is_teams,
            duration,
            players,
            start_time,
            stage,
        })
    }
}

fn parse_replay(path: String) -> Option<GameEntry> {
    let game = match peppi::game(&PathBuf::from(&path)) {
        Ok(game) => game,
        Err(e) => {
            warn!("{}: {}, skipping", path, e);
            return None;
        }
    };

    match GameEntry::new(&game, &path) {
        Ok(entry) => Some(entry),
        Err(e) => {
            warn!("{}: {}, skipping", path, e);
            return None;
        }
    }
}

fn main() -> Result<()> {
    let opts: Opts = Opts::parse();
    Builder::new().filter_level(LevelFilter::Info).init();

    let now = Instant::now();
    let files = get_slippis(&opts.directories)?;
    info!("Found {} Slippi files.", files.len());

    let mut db = sql::DB::new(&opts.output_db)?;
    let diff = db.compare_filepaths(&files)?;

    {
        let duplicates = files.len() - diff.len();
        if duplicates > 0 {
            info!("{} replays already in database, skipping.", duplicates);
        }
    }

    // Parse replays in parallel.
    let entries: Vec<GameEntry> = diff.into_par_iter().filter_map(parse_replay).collect();

    let inserts = db.insert_entries(&entries)?;
    info!(
        "Added {} Slippi files in {} secs.",
        inserts,
        now.elapsed().as_secs()
    );

    Ok(())
}
