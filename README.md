# Slippi Cumulative Stats

A script using [slippi-js](https://github.com/project-slippi/slippi-js) to calculate your overall and head to head play times and win rates from replays. Results are shown per character, stage, and nickname as well. You can specify your opponent, your opponent's character, and even opponents to skip.

## Instructions
Tested on Windows.

1. Place the executable from the [Releases](https://github.com/BrodyVoth/slippi-cumulative-stats/releases/latest) page into a folder with replays. (It also checks subfolders)
2. Run slippi-cumulative-stats-win.exe
3. Enter your codes/nicknames as prompted. (Connect codes are more reliable)

Note: Replays are by default saved in `Documents/Slippi` but replays created before Jun 30, 2020 may be in your Dolphin folder.

## Example

![Example results](https://i.imgur.com/17QCGU7.png)

## Win conditions
* You finished with more stocks than your opponent
* You finished with the same amount of stocks but a lower percent than your opponent **or**
* Your opponent LRA-Start quit the match.*

Otherwise, it's considered a loss. Win conditions are ignored and a loss is counted if you LRA-Start quit the match.* Matches shorter than 30 seconds or with no deaths are never counted.

*LRA-Start detection is currently disabled due to inaccurate results. If someone quits, current stocks and percents are used. 

## Run from source
Requires Node.js and npm.

1. Place slippi-stats.js and package.json in a folder with replays
2. Open a command line in the directory and run `npm install`
3. Run `node slippi-stats.js`
