# Slippi Cumulative Stats

A script using [slippi-js](https://github.com/project-slippi/slippi-js) to calculate your overall and head to head win rates and play times from replays. Results are shown per character, stage, and nickname as well. You can specify your character, your opponent, your opponent's character, and even opponents to skip.

## Instructions
1. Download the program from the [Releases](https://github.com/BrodyVoth/slippi-cumulative-stats/releases/latest) page.
2. Move the program into your replay folder. (Windows: Move `slippi-cumulative-stats-win.exe` into `Documents/Slippi`)
3. Run it and follow the prompts.

Note: On Windows, replays created before Jun 30, 2020 may be in your FM-Slippi folder. (These old replays only count toward total play time, anyway)

## Example

![Example results](https://i.imgur.com/KVytImn.png)

## Win conditions
* Your opponent lost more stocks than you **or**
* You finished with the same amount of stocks but a lower percent than your opponent

Otherwise, it's considered a loss. Matches shorter than 30 seconds or with no deaths are never counted.

Note: LRA-Start detection is currently disabled due to inaccurate data.

## Run from source
Requires Node.js.

1. Place slippi-stats.js and package.json in a folder with replays
2. Open a command line in the directory and run `npm install`
3. Run `node slippi-stats.js`
