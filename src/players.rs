use crate::enums;
use anyhow::{anyhow, Result};
use peppi::frame::Post;
use peppi::game::Game;
use peppi::ubjson::Object;
use std::cell::Cell;
use std::collections::HashMap;

#[derive(Debug)]
pub struct Player {
    pub code: String,
    pub tag: String,
    pub port: u8,
    pub stocks: u8,
    pub character: Option<String>,
    pub team: Option<String>,
    pub damage: f32,
    pub winner: Cell<bool>,
}

/// Get the game state on the last frame.
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

fn team(game: &Game, port: usize) -> Option<String> {
    game.start.players.get(port).and_then(|p| {
        p.as_ref()
            .and_then(|p| p.team.as_ref())
            .and_then(|t| enums::team(t.color))
    })
}

fn character(game: &Game, port: usize) -> Option<String> {
    game.start
        .players
        .get(port)
        .and_then(|p| p.as_ref().and_then(|p| enums::character(p.character)))
}

/// Gets the state of all players on the last frame of the game.
pub fn player_states(game: &Game) -> Vec<Player> {
    let mut players = Vec::new();

    for port in 0..4 {
        if let Some(post) = last_frame(&game, port) {
            let tags = tag_map(&game, port);

            if tags.is_none() {
                continue;
            }

            let tags = tags.unwrap();
            let code = get_tag("code", tags);
            let tag = get_tag("netplay", tags);

            if code.is_none() || tag.is_none() {
                continue;
            }

            players.push(Player {
                port: (port + 1) as u8,
                stocks: post.stocks,
                damage: post.damage,
                code: code.unwrap().to_string(),
                tag: tag.unwrap().to_string(),
                team: team(&game, port),
                character: character(&game, port),
                winner: Cell::new(false),
            });
        }
    }

    players
}

// /// Checks if the living players are all on the same team.
// fn on_same_team(living: &Vec<Player>) -> bool {
//     let winner = living.get(0);
//     if let Some(winner) = winner {
//         let winning_team = winner.team;
//         living
//             .iter()
//             .all(|player| match (player.team, winning_team) {
//                 (Some(a), Some(b)) => a == b,
//                 _ => false,
//             })
//     } else {
//         false
//     }
// }

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
pub fn determine_winners(players: &Vec<Player>) -> Result<()> {
    let living: Vec<_> = players.iter().filter(|p| p.stocks > 0).collect();

    match living.len() {
        0 => Err(anyhow!("invalid player state")),
        1 => {
            living[0].winner.set(true);

            // Check for teammates.
            if let Some(team) = &living[0].team {
                players
                    .iter()
                    .filter(|p| match &p.team {
                        Some(t) => t == team,
                        _ => false,
                    })
                    .for_each(|t| t.winner.set(true));
            }

            Ok(())
        }
        _ => {
            // TODO: Handle rage-quits. Sorry, Future Max!
            Err(anyhow!("2+ players, not on the same team: {:?}", living))
        }
    }
}
