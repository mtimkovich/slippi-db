# Slippi Stats

Calculates win rate over a set of replay files using [Peppi][peppi]. The primary goal of this project is to work with doubles games.

⚠️ Under construction. It doesn't work rn. But it will in the future?

## TODOS

- [x] Detect the winner(s).
- [ ] Loop over .slp files in a directory.
- [ ] Handle tiebreaks.
- [ ] Detect rage-quits and assign them losses.
- [ ] Correctly handle all these unsafe `unwrap`s.
- [ ] Run code through Rust formatter.
- [ ] Filter which replays to parse.

[peppi]: https://github.com/hohav/peppi
