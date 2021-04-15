use peppi::frame::Post;
use peppi::game::{Game, TeamColor};
use peppi::ubjson::Object;
use std::collections::HashMap;
use std::path::Path;

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
    return game.ports.get(port)
                     .and_then(|p| p.as_ref())
                     .and_then(|p| p.leader.post.last())
}

fn tag_map(game: &Game, port: usize) -> Option<&HashMap<String, Object>> {
    let port = port.to_string();
    let players = game.metadata.json.get("players").unwrap();
    if let Object::Map(hm) = players {
        // TODO: Check if this port exists.
        if let Object::Map(n) = hm.get(&port).unwrap() {
            if let Object::Map(netplay) = n.get("names").unwrap() {
                return Some(netplay);
            }
        }
    }

    None
}

fn get_tag<'a>(key: &'a str, tags: &'a HashMap<String, Object>) -> Option<&'a String> {
    match tags.get(key).unwrap() {
        Object::Str(s) => Some(s),
        _ => None,
    }
}

fn team(game: &Game, port: usize) -> Option<TeamColor> {
    game.start
        .players[port]
        .as_ref()
        .and_then(|p| p.team.as_ref())
        .and_then(|t| Some(t.color))
}

/// Gets the state of all players on the last frame of the game.
fn player_states(game: &Game) -> Vec<Player> {
    let mut players = Vec::new();

    for port in 0..4 {
        if let Some(post) = last_frame(&game, port) {
            let tags = tag_map(&game, port).unwrap();

            players.push(Player{
                stocks: post.stocks,
                damage: post.damage,
                code: get_tag("code", tags).unwrap(),
                tag: get_tag("netplay", tags).unwrap(),
                team: team(&game, port),
            });
        }
    }

    players
}

/// Checks if the living players are all on the same team.
fn on_same_team(living: &Vec<&Player>) -> bool {
    let winning_team = living[0].team;
    living.iter().all(|player| {
        match (player.team, winning_team) {
            (Some(a), Some(b)) => a == b,
            _ => false
        }
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
fn determine_winners(players: &Vec<Player>) {
    let living: Vec<_> = players.iter().filter(|p| p.stocks > 0).collect();

    if living.len() == 1 {
        if let Some(team) = living[0].team {
            let info = players.iter()
                              .filter(|p|
                                  match p.team {
                                      Some(t) => t == team,
                                      _ => false,
                                  })
                              .collect::<Vec<_>>();
            println!("{:?}", info);
            // return info;
        } else {
            // return living;
        }
    } else if on_same_team(&living) {
        // return living;
    }
}

fn main() {
    let path = Path::new("game.slp");
    let game = peppi::game(path).expect("error reading .slp file");

    let players = player_states(&game);
    // println!("{:#?}", players);
    determine_winners(&players);
}
