use anyhow::Result;
use chrono::{DateTime, Utc};
use clap::{crate_version, AppSettings, Clap};
use peppi::game::Game;
use rayon::prelude::*;
use std::path::PathBuf;
use walkdir::{DirEntry, WalkDir};

mod sql;
mod stage;

/// Create sqlite database from Slippi replays.
#[derive(Clap)]
#[clap(
    version = crate_version!(),
    author = "Max \"DJSwerve\" Timkovich <max@timkovi.ch>"
)]
#[clap(setting = AppSettings::ColoredHelp)]
struct Opts {
    /// directories to search for .slp files in
    #[clap(required(true))]
    directories: Vec<PathBuf>,
    /// suppress error message
    #[clap(short, long)]
    quiet: bool,
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
}

impl GameEntry {
    pub fn new(game: &Game, filepath: &str) -> Option<Self> {
        let duration = game.metadata.duration.and_then(|t| Some(t as f32 / 3600.));
        let start_time = game.metadata.date;
        let stage = stage::name(game.start.stage);

        if duration.is_none() || start_time.is_none() || stage.is_none() {
            return None;
        }

        Some(GameEntry {
            filepath: filepath.to_string(),
            is_teams: game.start.is_teams,
            duration: duration.unwrap(),
            start_time: start_time.unwrap(),
            stage: stage.unwrap().to_string(),
        })
    }
}

fn parse_replay(path: String, quiet: bool) -> Option<GameEntry> {
    let game = match peppi::game(&PathBuf::from(&path)) {
        Ok(game) => game,
        Err(e) => {
            if !quiet {
                eprintln!("{}: {}", path, e);
            }
            return None;
        }
    };

    GameEntry::new(&game, &path)
}

fn main() -> Result<()> {
    let opts: Opts = Opts::parse();
    let files = get_slippis(&opts.directories)?;
    let mut db = sql::DB::new("slippi.db")?;
    let diff = db.compare_filepaths(&files)?;

    {
        let duplicates = files.len() - diff.len();
        if duplicates > 0 {
            println!("{} replays already in database, skipping.", duplicates);
        }
    }

    // Parse replays in parallel.
    let entries: Vec<GameEntry> = diff
        .into_par_iter()
        .filter_map(|e| parse_replay(e, opts.quiet))
        .collect();

    let inserts = db.insert_entries(&entries)?;
    println!("Added {} Slippi files.", inserts);

    Ok(())
}
