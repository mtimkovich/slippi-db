var glob = require("glob")
const { default: SlippiGame } = require('@slippi/slippi-js')

// Characters ordered by ID
var characters = ['Captain Falcon', 'Donkey Kong', 'Fox', 'Mr. Game & Watch', 'Kirby', 'Bowser',
            'Link', 'Luigi', 'Mario', 'Marth', 'Mewtwo', 'Ness', 'Peach', 'Pikachu',
            'Ice Climbers', 'Jigglypuff', 'Samus', 'Yoshi', 'Zelda', 'Sheik', 'Falco',
            'Young Link', 'Dr. Mario', 'Roy', 'Pichu', 'Ganondorf']

// 2015 melee tier list using IDs
tier_list = [2, 20, 9, 19, 15, 12, 14, 0, 13, 16, 22, 17, 7, 25, 8, 21, 1, 6, 3, 23, 10, 18, 11, 24, 5, 4]
            

if (process.argv.length == 2) {
    console.log('| Provides cumulative stats from Slippi replays')
    console.log('| USAGE: node slippi-stats.js <nickname/code> [opponent nickname/code]')
    console.log("| Script checks current folder and subfolders. Include opponent's info if you want head to head stats")
    console.log('| Note: Replays with no player data (e.g. replays made before Slippi 2.1.0) are skipped (but counted in overall playtime')
    process.exit()
}

const user_player = process.argv[2].toLowerCase()
const opponent_arg = process.argv[3] || false
if (opponent_arg) {
    opponent_player = opponent_arg.toLowerCase()
}
const files = glob.sync("**/*.slp");

if (files.length == 0) {
    console.log('No replays found. Script should be ran in the same folder or a parent folder of the replays.')
    process.exit()
}

var total_games = 0
var total_wins = 0
var total_seconds = 0
var counted_seconds = 0
var character_totals = []
var character_wins = [] 
var nickname_totals = []
var nickname_wins = []

console.log(`${files.length} replays found.`)

for (i = 0; i < files.length; i++) {
    const game = new SlippiGame(files[i])
    const settings = game.getSettings()
    const metadata = game.getMetadata()
    try {
        game_seconds = Math.floor(metadata.lastFrame / 60)
        game_length = Math.floor(game_seconds / 60) + ":" + (game_seconds % 60 ? (game_seconds % 60).toString().padStart(2, '0') : '00')
        total_seconds += game_seconds
    }
    catch(err) {
        console.log(`${i}: Error reading replay data (${files[i]}). Ignoring results...`)
        continue
    }
    if (settings.players.length !== 2) {
        console.log(`${i}: More than 2 players (${files[i]}). Ignoring results...`)
        continue
      }
    if (JSON.stringify(metadata.players[0].names) === '{}' || JSON.stringify(metadata.players[1].names) === '{}') {
        console.log(`${i}: Replay ${files[i]} is outdated, offline, or against a CPU (missing names). Ignoring results...`)
        continue
    }

    player_num = 'none'
    opponent_num = 'none'
    opponent_found = false
    player_names = [metadata.players[0].names.netplay, metadata.players[1].names.netplay]
    player_codes = [metadata.players[0].names.code, metadata.players[1].names.code]
    player_characters = [settings.players[0].characterId, settings.players[1].characterId]


    for (j = 0; j < settings.players.length; j++) {
        if (opponent_arg) {
            if (player_names[j].toLowerCase() == opponent_player || player_codes[j].toLowerCase() == opponent_player) {
                opponent_found = true
            }
        }
        if (player_names[j].toLowerCase() == user_player || player_codes[j].toLowerCase() == user_player) {
            player_num = j
        }
        else {
            opponent_num = j
        }
    }
    if (player_num == 'none') {
        console.log(`${i}: User ${user_player} not found in replay. Skipping...`)
        continue
    }
    if (opponent_arg && !opponent_found) {
        console.log(`${i}: User ${opponent_player} not found in replay. Ignoring results...`)
        continue
    }
    const stats = game.getStats()

    player_character_num = player_characters[player_num]
    player_character = characters[player_character_num]
    player_name = player_names[player_num]

    opponent_character_num = player_characters[opponent_num]
    opponent_character = characters[opponent_character_num]
    opponent_name = player_names[opponent_num]

    player_kills = stats.overall[player_num].killCount
    opponent_kills = stats.overall[opponent_num].killCount

    // Tie conditions
    if (game_seconds < 30 || (player_kills == 0 && opponent_kills == 0)) {
        console.log(`${i}: Game lasted less than 30 seconds or no stocks were taken. Ignoring results...`)
        continue
    }

    player_final_percent = game.getLatestFrame().players[player_num].post.percent
    opponent_final_percent = game.getLatestFrame().players[opponent_num].post.percent
    end_more_kills = player_kills > opponent_kills
    end_lower_percent = (player_kills == opponent_kills) && player_final_percent < opponent_final_percent
    try {
        end_opponent_LRAS = (game.getGameEnd().lrasInitiatorIndex == opponent_num)
        end_player_LRAS = (game.getGameEnd.lrasInitiatorIndex == player_num)
    }
    catch {
        end_opponent_LRAS = false
        end_player_LRAS = false
    } 

    // Every death is considered the opponent's kill
    // If the player didn't quit out AND has more kills than the opponent, the same but with a lower percent, or the opponent quits out: it's a win, otherwise it's a loss. Ties handled above
    if (!end_player_LRAS && (end_more_kills || end_lower_percent || end_opponent_LRAS)) {
        console.log(`${i}: ${player_name || player_codes[player_num]} (${player_character}) beat ${opponent_name || player_codes[opponent_num]} (${opponent_character}) in ${game_length}!`)
        total_wins++
        total_games++
        character_totals[player_character_num] = (character_totals[player_character_num] + 1) || 1
        character_wins[player_character_num] = (character_wins[player_character_num] + 1) || 1
        nickname_totals[player_name] = (nickname_totals[player_name] + 1) || 1
        nickname_wins[player_name] = (nickname_wins[player_name] + 1) || 1
    } else {
        console.log(`${i}: ${player_name || player_codes[player_num]} (${player_character}) lost to ${opponent_name || player_codes[opponent_num]} (${opponent_character}) in ${game_length}.`)
        total_games++
        character_totals[player_character_num] = (character_totals[player_character_num] + 1) || 1
        nickname_totals[player_name] = (nickname_totals[player_name] + 1) || 1
    }

    // Try to find last used nickname and actual connect code to display at the end
    if (player_name.length > 0) {
        final_player_name = player_name
    }
    real_player_code = player_codes[player_num]
    if (opponent_arg && player_names[opponent_num]) {
        if (opponent_name.length > 0) {
            final_opponent_name = opponent_name
        }
        real_opponent_code = player_codes[opponent_num]
    }
    counted_seconds += game_seconds
}

if (!total_games) {
    opponent_arg ? console.log(`No matches found for ${user_player} vs ${opponent_arg}.`) : console.log(`No matches found for ${user_player}.`)
    process.exit()
}

win_rate = (total_wins / total_games * 100).toFixed(2)
character_results = {}
nickname_results = {}

function secondsToHMS(seconds) {
    var measuredTime = new Date(null)
    measuredTime.setSeconds(seconds)
    time_string = measuredTime.toISOString().substr(11, 8)
    return time_string
}

console.log('\n------- OVERALL RESULTS -------')
opponent_arg ? console.log(`| ${final_player_name} (${real_player_code}) vs ${final_opponent_name} (${real_opponent_code})`) : console.log(`| ${final_player_name} (${real_player_code})`)
console.log(`| ${total_wins} wins in ${total_games} games (${win_rate}% win rate)`)
console.log(`| ${secondsToHMS(counted_seconds)} in analyzed matches. ${secondsToHMS(total_seconds)} total time spent in matches (including skipped replays)`)
console.log('------ CHARACTER RESULTS ------')

// Calculate character win rates
for (i in character_totals) {
    wins = character_wins[i] || 0
    games = character_totals[i]
    winrate = ((wins / games) * 100).toFixed(2) || 0
    character_results[i] = `| ${characters[i]}: ${wins} wins in ${games} games (${winrate}% win rate)`
}

// Display character results in tier list order
for (i = 0; i < character_totals.length; i++) {
    if (character_results[tier_list[i]]) {
        console.log(character_results[tier_list[i]])
    }
}
console.log('------ NICKNAME RESULTS -------')

// Calculate and display nickname win rates
for (i in nickname_totals) {
    wins = nickname_wins[i] || 0
    games = nickname_totals[i]
    winrate = ((wins / games) * 100).toFixed(2) || 0
    console.log(`| ${i}: ${wins} wins in ${games} games (${winrate}% win rate)`)
}

console.log('-------------------------------')
