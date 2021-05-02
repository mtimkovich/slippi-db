# 🐸 Slippi Stats

Calculates win rate over a set of replay files using [Peppi][peppi]. The primary goal of this project is to work with doubles games.

⚠️ Under construction.

## 🚧 Roadmap

- [ ] Determine what data to extract from replays.
- [ ] Filter which replays to parse.
- [ ] Search directories recursively.
- [x] Parse Slippi files in parallel.
- [x] Detect the winner(s).
- [x] Loop over .slp files in a directory.
- [ ] Handle tiebreaks.
- [ ] Detect rage-quits and assign them losses.
- [x] Correctly handle all these unsafe `unwrap`s.
- [x] Run code through Rust formatter.

[peppi]: https://github.com/hohav/peppi
