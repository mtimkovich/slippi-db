use peppi::frame::Post;
use peppi::game::{Game, TeamColor};
use peppi::ubjson::Object;
use rayon::prelude::*;
use std::collections::HashMap;
use std::fs::{self};
use std::io;
use std::path::PathBuf;

#[derive(Debug)]
struct Player<'a> {
    code: &'a String,
    tag: &'a String,
    stocks: u8,
    team: Option<TeamColor>,
    damage: f32,
}

/// Get the game state in the last frame.
fn last_frame(game: &Game, port: usize) -> Option<&Post> {
    return game
        .ports
        .get(port)
        .and_then(|p| p.as_ref())
        .and_then(|p| p.leader.post.last());
}

fn tag_map(game: &Game, port: usize) -> Option<&HashMap<String, Object>> {
    let port = port.to_string();
    let players = game.metadata.json.get("players")?;
    if let Object::Map(hm) = players {
        // TODO: Check if this port exists.
        if let Object::Map(n) = hm.get(&port)? {
            if let Object::Map(netplay) = n.get("names")? {
                return Some(netplay);
            }
        }
    }

    None
}

fn get_tag<'a>(key: &'a str, tags: &'a HashMap<String, Object>) -> Option<&'a String> {
    match tags.get(key)? {
        Object::Str(s) => Some(s),
        _ => None,
    }
}

fn team(game: &Game, port: usize) -> Option<TeamColor> {
    game.start.players[port]
        .as_ref()
        .and_then(|p| p.team.as_ref())
        .and_then(|t| Some(t.color))
}

/// Gets the state of all players on the last frame of the game.
// TODO: Calculate how long the game lasted.
fn player_states(game: &Game) -> Option<Vec<Player>> {
    let mut players = Vec::new();

    for port in 0..4 {
        if let Some(post) = last_frame(&game, port) {
            let tags = tag_map(&game, port)?;

            players.push(Player {
                stocks: post.stocks,
                damage: post.damage,
                code: get_tag("code", tags)?,
                tag: get_tag("netplay", tags)?,
                team: team(&game, port),
            });
        }
    }

    Some(players)
}

/// Checks if the living players are all on the same team.
fn on_same_team(living: &Vec<&Player>) -> bool {
    let winning_team = living[0].team;
    living
        .iter()
        .all(|player| match (player.team, winning_team) {
            (Some(a), Some(b)) => a == b,
            _ => false,
        })
}

/** Steps for determining winners.
 *
 * 1. Remove players with 0 stocks.
 * 2. If 1 player:
 *    a. If team, find their teammate.
 *    b. else player is only winner.
 * 3. If 2 or more players:
 *    a. if same team (2 players), return both of them.
 *    b. else compare stocks and damage.
 */
fn determine_winners<'a>(players: &'a Vec<Player<'a>>) -> Option<Vec<&'a Player<'a>>> {
    let living: Vec<_> = players.iter().filter(|p| p.stocks > 0).collect();

    if living.len() == 1 {
        if let Some(team) = living[0].team {
            // Find teammate.
            let info = players
                .iter()
                .filter(|p| match p.team {
                    Some(t) => t == team,
                    _ => false,
                })
                .collect::<Vec<_>>();
            return Some(info);
        } else {
            return Some(living);
        }
    } else if on_same_team(&living) {
        return Some(living);
    }

    // TODO: Handle rage-quits. Sorry, Future Max!
    // println!("WARNING: 2+ players, not on the same team.");
    // println!("\t{:?}", living);
    None
}

fn is_winner(winners: &Vec<&Player>, tag: &str) -> bool {
    winners.iter().find(|p| p.tag == tag).is_some()
}

// TODO: Search recursively
fn get_slippis(dir: &str) -> io::Result<Vec<PathBuf>> {
    let mut entries: Vec<_> = fs::read_dir(dir)?
        .filter_map(|e| e.ok().and_then(|e| Some(e.path())))
        .filter(|path| match path.extension() {
            Some(ext) => ext == "slp",
            _ => false,
        })
        .collect();

    entries.sort();

    Ok(entries)
}

/// Parse all replays in parallel.
fn parse_replays(files: Vec<PathBuf>) -> Vec<Result<Game, peppi::ParseError>> {
    files.into_par_iter().map(|f| peppi::game(&f)).collect()
}

fn main() -> io::Result<()> {
    // TODO: This should come from a cli arg.
    let files = get_slippis("2021-04-10")?;

    let mut wins = 0.;
    let played = files.len() as f32;

    for game in parse_replays(files) {
        let game = match game {
            Ok(game) => game,
            Err(err) => {
                eprintln!("{}", err);
                continue;
            }
        };

        let players = match player_states(&game) {
            Some(p) => p,
            _ => continue,
        };

        let winners = determine_winners(&players);
        if let Some(winners) = winners {
            let tag = "DJSwerve";
            if is_winner(&winners, tag) {
                wins += 1.;
            }
        }
    }

    let average = wins / played * 100.;
    println!("win rate: {}%", average);

    Ok(())
}
