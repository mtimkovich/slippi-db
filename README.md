# 🐸 Slippi DB

Slippi DB ingests [Slippi replays][slippi] and puts the data into a SQLite database for easier parsing.

The primary goal of this project is to make it easier to perform analysis of Slippi files by putting them in a more structured format. The end goal is to have something similar to [Ballchasing's API][ballchasing] but for Melee.

Written in [Rust][rust] using [Peppi][peppi], slippi-db can parse gigabytes worth of Slippi files in a couple seconds.

## ⌨️ Usage

```shell
$ git clone https://github.com/mtimkovich/slippi-db
$ cd slippi-db
$ cargo install --path .
$ slippi-db SLIPPI_FOLDER
```

## 🗒️ Examples

There's some examples of what is possible in the `examples/` directory. This is good starting point, especially if you're not familiar with SQL. These can be run via:

```shell
$ sqlite3 slippi.db < examples/example.sql
```

## 🚧 Roadmap

- [x] Write data to SQLite DB.
- [x] Check the filelist for new files.
- [ ] Save player data.
- [ ] Create more SQL examples.
- [x] Detect the winner(s).
  - [x] Discard short matches (<30s).
  - [ ] Handle tiebreaks.
  - [ ] Detect rage-quits and assign them losses.

## Bug/Feature Requests

* [File an issue!](https://github.com/mtimkovich/slippi-db/issues)
* Twitter: [@DJSwerveGG][twitter]

PRs welcome!

[slippi]: https://github.com/project-slippi/slippi-wiki/blob/master/SPEC.md
[peppi]: https://github.com/hohav/peppi
[rust]: https://www.rust-lang.org/
[ballchasing]: https://ballchasing.com/doc/api#replays-replays-get
[twitter]: https://twitter.com/DJSwerveGG
