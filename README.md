# Slippi Cumulative Stats

A script using [slippi-js](https://github.com/project-slippi/slippi-js) to calculate your overall or head to head play time and win rates from replays. Results are shown per character and nickname as well. No guarantees.

## Usage
Requires Node.js.

1. Place slippi-stats.js and package.json in a folder with replays. (It also checks subfolders)
2. Open a command line in the directory and run `npm install`
3. Run `node slippi-stats.js <nickname/code> [opponent nickname/code]`. (Connect codes may be more reliable)

Note: Replays are by default saved in `Documents/Slippi` but replays created before Jun 30, 2020 may be in your Dolphin folder.

## Example

``node slippi-stats.js zimp#721 bullets``

![Example results](https://i.imgur.com/ET0bsZ3.png)

## Win conditions
* You finished with more stocks than your opponent
* You finished with the same amount of stocks but a lower percent than your opponent **or**
* Your opponent LRA-Start quit the match.

Otherwise, it's considered a loss. Win conditions are ignored and a loss is counted if you LRA-Start quit the match. Matches shorter than 30 seconds or with no deaths are never counted.