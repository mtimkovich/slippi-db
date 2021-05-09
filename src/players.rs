// use std::collections::HashMap;
// use peppi::ubjson::Object;
// use peppi::frame::Post;
// use peppi::game::{Game, TeamColor};

#[allow(dead_code)]
#[derive(Debug)]
struct Player<'a> {
    code: &'a String,
    tag: &'a String,
    stocks: u8,
    team: Option<TeamColor>,
    damage: f32,
}

#[allow(dead_code)]
impl<'a> AsRef<Player<'a>> for Player<'a> {
    fn as_ref(&self) -> &Self {
        self
    }
}

/// Get the game state in the last frame.
#[allow(dead_code)]
fn last_frame(game: &Game, port: usize) -> Option<&Post> {
    return game
        .ports
        .get(port)
        .and_then(|p| p.as_ref())
        .and_then(|p| p.leader.post.last());
}

#[allow(dead_code)]
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

#[allow(dead_code)]
fn get_tag<'a>(key: &'a str, tags: &'a HashMap<String, Object>) -> Option<&'a String> {
    match tags.get(key)? {
        Object::Str(s) => Some(s),
        _ => None,
    }
}

#[allow(dead_code)]
fn team(game: &Game, port: usize) -> Option<TeamColor> {
    game.start.players.get(port).and_then(|p| {
        p.as_ref()
            .and_then(|p| p.team.as_ref())
            .and_then(|t| Some(t.color))
    })
}

/// Gets the state of all players on the last frame of the game.
// TODO: Calculate how long the game lasted.
#[allow(dead_code)]
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
#[allow(dead_code)]
fn on_same_team(living: &Vec<&Player>) -> bool {
    let winner = living.get(0);
    if let Some(winner) = winner {
        let winning_team = winner.team;
        living
            .iter()
            .all(|player| match (player.team, winning_team) {
                (Some(a), Some(b)) => a == b,
                _ => false,
            })
    } else {
        false
    }
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
#[allow(dead_code)]
fn determine_winners<'a>(players: &'a Vec<Player>) -> Option<Vec<&'a Player<'a>>> {
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

/// Checks if player's tag is in vector of players.
#[allow(dead_code)]
fn has_player<'a, P: AsRef<Player<'a>>>(players: &Vec<P>, tag: &str) -> bool {
    players
        .iter()
        .find(|p| p.as_ref().tag.to_lowercase() == tag.to_lowercase())
        .is_some()
}
