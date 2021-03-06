use crate::enums;
use peppi::frame::Post;
use peppi::game::Game;
use peppi::ubjson::Object;
use std::cell::Cell;
use std::cmp::Ordering;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Player {
    pub code: String,
    pub tag: String,
    pub port: usize,
    pub stocks: u8,
    pub character: Option<String>,
    pub team: Option<String>,
    pub damage: f32,
    pub winner: Cell<bool>,
}

impl AsRef<Player> for Player {
    fn as_ref(&self) -> &Self {
        self
    }
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
                port,
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

#[derive(Debug)]
struct Tiebreak<'a> {
    stocks: u8,
    damage: f32,
    player: &'a Player,
    team: Option<String>,
}

impl<'a> Tiebreak<'a> {
    /// Return a winning player by comparing stocks and damage.
    fn run<P: AsRef<Player>>(living: &Vec<P>) -> &Player {
        let living: Vec<_> = living.iter().map(|p| p.as_ref()).collect();
        let mut teams: Vec<Tiebreak> = Vec::new();

        for player in living {
            let color = player.team.as_ref();
            let tb = teams.iter_mut().find(|t| match (t.team.as_ref(), color) {
                (Some(a), Some(b)) => a == b,
                _ => false,
            });
            match tb {
                Some(mut tb) => {
                    tb.stocks += player.stocks;
                    tb.damage += player.damage;
                }
                None => teams.push(Tiebreak {
                    stocks: player.stocks,
                    damage: player.damage,
                    team: color.map(|s| s.to_string()),
                    player,
                }),
            }
        }

        // Bring the winner to the front of the vector.
        teams.sort_by(|a, b| {
            if a.stocks > b.stocks {
                return Ordering::Less;
            } else if a.stocks < b.stocks {
                return Ordering::Greater;
            } else {
                if a.damage < b.damage {
                    return Ordering::Less;
                } else {
                    return Ordering::Greater;
                }
            }
        });

        return teams[0].player;
    }
}

/// Make everyone on `team_color` a winner.
fn set_team_winners(team_color: &str, players: &Vec<Player>) {
    players
        .iter()
        .filter(|p| match &p.team {
            Some(t) => t == team_color,
            _ => false,
        })
        .for_each(|t| t.winner.set(true));
}

pub fn determine_winners(players: &Vec<Player>) {
    let living: Vec<_> = players.iter().filter(|p| p.stocks > 0).collect();
    
    if living.is_empty() {
        return;
    }

    let winner = Tiebreak::run(&living);
    winner.winner.set(true);

    if let Some(team) = &winner.team {
        set_team_winners(team, players);
    }
}
