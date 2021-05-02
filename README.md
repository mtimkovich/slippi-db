# 🐸 Slippi Stats API

Calculates win rate over a set of replay files using [Peppi][peppi]. The primary goal of this project is to work with doubles games.

⚠️ Under construction.

## 🚧 Roadmap

- [x] Search directories recursively.
- [ ] [Determine what data to extract from replays.][stats]
- [ ] [Filter which replays to parse.][ballchasing]
- [x] Parse Slippi files in parallel.
- [x] Detect the winner(s).
  - [ ] Discard short matches (<30s).
  - [ ] Handle tiebreaks.
  - [ ] Detect rage-quits and assign them losses.
- [x] Loop over .slp files in a directory.
- [x] Correctly handle all these unsafe `unwrap`s.
- [x] Run code through Rust formatter.

[peppi]: https://github.com/hohav/peppi
[ballchasing]: https://ballchasing.com/doc/api#replays-replays-get
[stats]: https://github.com/mtimkovich/slippi-stats/blob/master/stats.md
