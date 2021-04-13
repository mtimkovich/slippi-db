use std::path::Path;
use peppi::game::{Port, Game};

/// Determine the winner of the game.
///
/// atm it's only based on who has stocks at the end of the game.
/// TODO: Declare rage-quiters the loser.
fn game_winner(game: &Game) -> Vec<usize> {
    let ports: Vec<&Port> = game.ports.iter()
                                      .filter_map(|p| p.as_ref())
                                      .collect();
    let state: Vec<_> = ports.iter()
                             .map(|p| p.leader.post.last().unwrap().stocks)
                             .enumerate()
                             .filter(|(_, stocks)| *stocks > 0)
                             .map(|(i, _)| i)
                             .collect();
    println!("winners: {:?}", state);
    state
}


fn main() {
    let path = Path::new("game.slp");
    let game = peppi::game(path).expect("error reading .slp file");

    // TODO: Parse through replay and create map from ports to team and connect code.
    // game_winner(&game);

    // println!("{:#?}", game);
    // println!("{:#?}", game.metadata.json.get("players").unwrap());
}
