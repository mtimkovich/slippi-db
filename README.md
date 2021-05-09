# 🐸 Slippi DB

Slippi DB ingests Slippi replays and sends the data to an SQLite database for easier parsing.

The primary goal of this project is to make it easier to perform analysis of Slippi files by putting them in a more structured format. My end goal is to create something similar to [Ballchasing's API][ballchasing] for Rocket League but for Melee.

Written in Rust and using [Peppi][peppi], slippi-db can parse a couple gigabytes of Slippi files in a couple seconds.

⚠️ Under construction.

## Usage

```shell
$ git clone https://github.com/mtimkovich/slippi-db
$ cd slippi-db
$ cargo install --path .
$ slippi-db SLIPPI_FOLDER
```

## Examples

There's some examples of what is possible in the `examples/` directory. This is good starting point if you're not particularly familiar with SQL. These can be run via:

```shell
$ sqlite3 slippi.db < examples/example.sql
```

## 🚧 Roadmap

- [x] Write data to SQLite DB.
- [ ] Check the filelist for new files.
- [ ] Save player data.
- [x] Detect the winner(s).
  - [ ] Discard short matches (<30s).
  - [ ] Handle tiebreaks.
  - [ ] Detect rage-quits and assign them losses.

## Bug/Feature Requests

* [File an issue!](https://github.com/mtimkovich/slippi-db/issues)
* Twitter: [@DJSwerveGG][twitter]

PRs welcome!

[peppi]: https://github.com/hohav/peppi
[ballchasing]: https://ballchasing.com/doc/api#replays-replays-get
[twitter]: https://twitter.com/DJSwerveGG
