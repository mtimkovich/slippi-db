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
fn last_frame(game: &Game, port: usize) -> &Post {
    return &game.ports[port]
        .as_ref()
        .and_then(|p| p.leader.post.last())
        .unwrap();
}

fn netplay(game: &Game, port: usize) -> Option<&HashMap<String, Object>> {
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

fn main() {
    let path = Path::new("game.slp");
    let game = peppi::game(path).expect("error reading .slp file");

    let mut players = HashMap::new();

    for port in 0..4 {
        // TODO: Correctly handle all those Options.
        let post = last_frame(&game, port);
        let tags = netplay(&game, port).unwrap();

        players.insert(
            port,
            Player{
                stocks: post.stocks,
                damage: post.damage,
                code: get_tag("code", tags).unwrap(),
                tag: get_tag("netplay", tags).unwrap(),
                team: team(&game, port),
            });
    }

    println!("{:#?}", players);
}
