# Slippi Cumulative Stats

A script using [slippi-js](https://github.com/project-slippi/slippi-js) to calculate your overall and head to head play times and win rates from replays. Results are shown per character and nickname as well. No guarantees.

## Usage
Instructions for Windows.

1. Place the executable from the [Releases](https://github.com/BrodyVoth/slippi-cumulative-stats/releases/latest) page into a folder with replays. (It also checks subfolders)
2. Open a command line in the directory. (Shift + Right-click in the folder and click Open Powershell window here)
3. Run `.\slippi-cumulative-stats-win.exe <nickname/code> [opponent nickname/code]`

Note: Replays are by default saved in `Documents/Slippi` but replays created before Jun 30, 2020 may be in your Dolphin folder.

## Example

``.\slippi-cumulative-stats-win.exe zimp#721 bullets``

![Example results](https://i.imgur.com/odEG9EM.png)

## Win conditions
* You finished with more stocks than your opponent
* You finished with the same amount of stocks but a lower percent than your opponent **or**
* Your opponent LRA-Start quit the match.

Otherwise, it's considered a loss. Win conditions are ignored and a loss is counted if you LRA-Start quit the match. Matches shorter than 30 seconds or with no deaths are never counted.

## Run from source
Requires Node.js and npm.

1. Place slippi-stats.js and package.json in a folder with replays
2. Open a command line in the directory and run `npm install`
3. Run `node slippi-stats.js <nickname/code> [opponent nickname/code]`
