# 🐸 Slippi DB
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Slippi DB ingests [Slippi replays][slippi] and puts the data into a SQLite database for easier parsing.

The primary goal of this project is to make it easier to analyze large amounts of Slippi data. Its end goal is to create something similar to [Ballchasing.com][ballchasing] but for Melee.

Written in [Rust][rust] using [Peppi][peppi], Slippi DB can parse gigabytes worth of Slippi files in a couple seconds.

## Usage

```
USAGE:
    slippi-db [OPTIONS] <directories>...

ARGS:
    <directories>...    Directories to search for .slp files in

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -o, --output-db <output-db>    Set output database file [default: slippi.db]
```

## Installation

### Releases

The easiest way to install is to download the executable for your system from [releases](https://github.com/mtimkovich/slippi-db/releases).

### Compiling

```shell
$ git clone https://github.com/mtimkovich/slippi-db
$ cd slippi-db
$ cargo build --release
```

## 🗒️ Examples

There's some examples of what is possible in the `examples/` directory. This is good starting point, especially if you're not familiar with SQL. These can be run via:

```shell
$ sqlite3 slippi.db < examples/hours_played.sql
```

*If you come up with a cool query, make a PR and I'll add it to the examples!*

## 🚧 Roadmap

- [x] Write data to SQLite DB.
- [x] Check the filelist for new files.
- [x] Save player data.
- [x] Create more SQL examples.
- [x] Detect the winner(s).
  - [x] Discard short matches (<30s).
  - [x] Handle tiebreaks.
  - [ ] Detect rage-quits and assign them losses.
- [x] Create releases.
- [ ] Create *even more* SQL examples.

## Bug/Feature Requests

* [File an issue!](https://github.com/mtimkovich/slippi-db/issues)
* Twitter: [@DJSwerveGG][twitter]

PRs welcome!

## Author
Max "DJSwerve" Timkovich

[slippi]: https://github.com/project-slippi/slippi-wiki/blob/master/SPEC.md
[peppi]: https://github.com/hohav/peppi
[rust]: https://www.rust-lang.org/
[ballchasing]: https://ballchasing.com
[twitter]: https://twitter.com/DJSwerveGG

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://timkovi.ch"><img src="https://avatars.githubusercontent.com/u/651077?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Max Timkovich</b></sub></a><br /><a href="https://github.com/mtimkovich/slippi-db/commits?author=mtimkovich" title="Code">💻</a> <a href="https://github.com/mtimkovich/slippi-db/commits?author=mtimkovich" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!