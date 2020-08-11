var glob = require("glob")
const { default: SlippiGame } = require('@slippi/slippi-js')
var readlineSync = require('readline-sync');

// Characters ordered by ID
var characters = ['Captain Falcon', 'Donkey Kong', 'Fox', 'Mr. Game & Watch', 'Kirby', 'Bowser',
            'Link', 'Luigi', 'Mario', 'Marth', 'Mewtwo', 'Ness', 'Peach', 'Pikachu',
            'Ice Climbers', 'Jigglypuff', 'Samus', 'Yoshi', 'Zelda', 'Sheik', 'Falco',
            'Young Link', 'Dr. Mario', 'Roy', 'Pichu', 'Ganondorf']

var characters_lowercase = ['captain falcon', 'donkey kong', 'fox', 'mr. game & watch', 'kirby', 'bowser',
            'link', 'luigi', 'mario', 'marth', 'mewtwo', 'ness', 'peach', 'pikachu',
            'ice climbers', 'jigglypuff', 'samus', 'yoshi', 'zelda', 'sheik', 'falco',
            'young link', 'dr. mario', 'roy', 'pichu', 'ganondorf']            

console.log('| Slippi Cumulative Stats v1.7.0')
console.log('-------------------------------')
console.log('| Provides cumulative stats from Slippi replays')
console.log("| Script checks current folder and subfolders. Include opponent's info if you want more specific stats")
console.log('| Note: Replays with no player data (pre-July 2020) are skipped (but counted in overall playtime)')
console.log('| Note: Your answers are not case-sensitive')
console.log('-------------------------------')
    
const user_player = readlineSync.question('Enter your connect code (or nickname): ').toLowerCase()

// const user_player = process.argv[2].toLowerCase()
const opponent_arg = readlineSync.question("Enter your opponent's code or nickname (Optional. Leave blank for all opponents): ") || false
const character_arg = readlineSync.question("Enter your opponent's character (Optional. Leave blank for all matchups): ") || false

if (character_arg) {
    character_requested = character_arg.toLowerCase()
    if (!characters_lowercase.includes(character_requested)) {
        console.log(`${character_arg} is not a valid character. Valid characters:`)
        readlineSync.question(`${characters_lowercase.join(', ')}`)
        process.exit()
    }
}

const ignored_arg = readlineSync.question("Enter any opponent's codes/names to skip, separated by a comma (Optional): ")

if (opponent_arg) {
    opponent_player = opponent_arg.toLowerCase()
}

if (ignored_arg) {
    ignored_list = ignored_arg.toLowerCase().split(",")
}

const files = glob.sync("**/*.slp");

if (files.length == 0) {
    // Use question to prevent automatic close
    readlineSync.question("No replays found. Script should be ran in the same folder or a parent folder of the replays.")
    process.exit()
}

var total_games = 0
var total_wins = 0
var total_seconds = 0
var counted_seconds = 0
var character_totals = []
var character_wins = [] 
var character_playtime = []
var nickname_totals = []
var nickname_wins = []
var nickname_playtime = []
var opponent_totals = []
var opponent_wins = []
var opponent_playtime = []
var final_player_name = user_player

console.log(`${files.length} replays found.`)

for (i = 0; i < files.length; i++) {
    try {
        const game = new SlippiGame(files[i])
        const settings = game.getSettings()
        const metadata = game.getMetadata()
        try {
            game_seconds = Math.floor(metadata.lastFrame / 60)
            game_length = Math.floor(game_seconds / 60) + ":" + (game_seconds % 60 ? (game_seconds % 60).toString().padStart(2, '0') : '00')
            total_seconds += game_seconds
        }
        catch(err) {
            console.log(`${i}: Error reading replay metadata (${files[i]}). Ignoring results...`)
            continue
        }
        if (settings.players.length !== 2) {
            console.log(`${i}: More than 2 players (${files[i]}). Ignoring results...`)
            continue
        }
        try {
            if (JSON.stringify(metadata.players[0].names) === '{}' || JSON.stringify(metadata.players[1].names) === '{}') {
                console.log(`${i}: Replay ${files[i]} is old or offline. (Missing player info) Ignoring results...`)
                continue
            }
        }
        catch(err) {
            console.log(`${i}: Replay ${files[i]} is corrupted. (Missing player info) Ignoring results...`)
            continue
        }

        player_num = 'none'
        opponent_num = 'none'
        opponent_found = false
        ignored_opponent_found = false
        player_names = [metadata.players[0].names.netplay, metadata.players[1].names.netplay]
        player_codes = [metadata.players[0].names.code, metadata.players[1].names.code]
        player_characters = [settings.players[0].characterId, settings.players[1].characterId]


        for (j = 0; j < settings.players.length; j++) {
            if (opponent_arg) {
                if (player_names[j].toLowerCase() == opponent_player || player_codes[j].toLowerCase() == opponent_player) {
                    opponent_found = true
                }
            }
            if (ignored_arg) {
                for (k of ignored_list) {
                    skipped_opponent = k.trim().toLowerCase()
                    if (player_names[j].toLowerCase() == skipped_opponent || player_codes[j].toLowerCase() == skipped_opponent) {
                        ignored_opponent_found = true
                        found_ignored_opponent = `${player_names[j]} (${player_codes[j]})`
                    }
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
            console.log(`${i}: User ${user_player} not found in replay. Ignoring results...`)
            continue
        }
        if (opponent_arg && !opponent_found) {
            console.log(`${i}: User ${opponent_player} not found in replay. Ignoring results...`)
            continue
        }
        if (ignored_arg && ignored_opponent_found) {
            console.log(`${i}: User ${found_ignored_opponent} found in replay. Ignoring results...`)
            continue
        }

        player_character_num = player_characters[player_num]
        player_character = characters[player_character_num]
        player_name = player_names[player_num]

        opponent_character_num = player_characters[opponent_num]
        opponent_character = characters[opponent_character_num]
        opponent_name = player_names[opponent_num]
        opponent_code = player_codes[opponent_num]

        if (character_arg && opponent_character.toLowerCase() !== character_requested) {
            requested_character_num = characters_lowercase.indexOf(character_requested)
            console.log(`${i}: ${opponent_name} not playing ${characters[requested_character_num]}. (Found ${opponent_character}) Ignoring results...`)
            continue
        }


        const stats = game.getStats()

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
            end_player_LRAS = (game.getGameEnd().lrasInitiatorIndex == player_num)
        }
        catch {
            end_opponent_LRAS = false
            end_player_LRAS = false
        } 

        // Every death is considered the opponent's kill
        // If the player didn't quit out AND has more kills than the opponent, the same but with a lower percent, or the opponent quits out: it's a win, otherwise it's a loss. Ties handled above
        if (!end_player_LRAS && (end_more_kills || end_lower_percent || end_opponent_LRAS)) {
            console.log(`${i}: ${player_name || player_codes[player_num]} (${player_character}) beat ${opponent_name || opponent_code} (${opponent_character}) in ${game_length}!`)
            total_wins++
            total_games++
            character_totals[player_character_num] = (character_totals[player_character_num] + 1) || 1
            character_wins[player_character_num] = (character_wins[player_character_num] + 1) || 1
            nickname_totals[player_name] = (nickname_totals[player_name] + 1) || 1
            nickname_wins[player_name] = (nickname_wins[player_name] + 1) || 1
            opponent_totals[opponent_code] = (opponent_totals[opponent_code] + 1) || 1
            opponent_wins[opponent_code] = (opponent_wins[opponent_code] + 1) || 1

        } else {
            console.log(`${i}: ${player_name || player_codes[player_num]} (${player_character}) lost to ${opponent_name || opponent_code} (${opponent_character}) in ${game_length}.`)
            total_games++
            character_totals[player_character_num] = (character_totals[player_character_num] + 1) || 1
            nickname_totals[player_name] = (nickname_totals[player_name] + 1) || 1
            opponent_totals[opponent_code] = (opponent_totals[opponent_code] + 1) || 1
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
        character_playtime[player_character_num] = (character_playtime[player_character_num] + game_seconds) || game_seconds
        opponent_playtime[opponent_code] = (opponent_playtime[opponent_code] + game_seconds) || game_seconds
        nickname_playtime[player_name] = (nickname_playtime[player_name] + game_seconds) || game_seconds

    }
    catch(err) {
        console.log(`${i}: Error reading replay (${files[i]}). Ignoring results...`)
        continue
    }
}

if (!total_games) {
    // Use question to prevent automatic close
    console.log('\n| No games found matching requested parameters.')
    console.log('-------------------------------')
    opponent_arg ? console.log(`| Players: ${user_player} vs ${opponent_arg}`) : console.log(`| Player: ${user_player}`)
    if (character_arg) { console.log(`| Opponent character: ${characters[characters_lowercase.indexOf(character_requested)]}`) }
    if (ignored_arg) { console.log(`| Ignored opponents: ${ignored_arg}`) }
    console.log('-------------------------------')
    readlineSync.question(`| Try again with different parameters.`)
    process.exit()
}

win_rate = (total_wins / total_games * 100).toFixed(2)

function secondsToHMS(seconds) {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60  
    return [hours, minutes, seconds % 60].map(format).join(':')
}

console.log('\n------- OVERALL RESULTS -------')
opponent_arg ? console.log(`| ${final_player_name} (${real_player_code}) vs ${final_opponent_name} (${real_opponent_code})`) : console.log(`| ${final_player_name} (${real_player_code})`)
if (character_arg) { console.log(`| Opponent character: ${characters[characters_lowercase.indexOf(character_requested)]}`) }
if (ignored_arg) { console.log(`| Ignored opponents: ${ignored_arg}`) }
console.log(`| ${total_wins} wins in ${total_games} games (${win_rate}% win rate)`)
console.log(`| ${secondsToHMS(counted_seconds)} in analyzed matches. ${secondsToHMS(total_seconds)} total time spent in matches (including skipped replays)`)

console.log('------ CHARACTER RESULTS ------')
character_results = []
// Calculate character win rates
for (i in character_totals) {
    wins = character_wins[i] || 0
    games = character_totals[i]
    winrate = ((wins / games) * 100).toFixed(2) || 0
    character_results.push({character: characters[i], wins: wins || 0, games: games, playtime: character_playtime[i]})
}

// Sort character results list by games played in descending order
character_results.sort(function(a, b) {
    return b.games - a.games
})

// Display character results
for (i = 0; i < character_results.length; i++) {
    winrate = ((character_results[i].wins / character_results[i].games) * 100).toFixed(2) || 0
    playtime = secondsToHMS(character_results[i].playtime)
    console.log(`| ${character_results[i].character}: ${character_results[i].wins} wins in ${character_results[i].games} games (${winrate}%) - ${playtime}`)
}

console.log('------ NICKNAME RESULTS -------')
// Calculate and display nickname win rates
for (i in nickname_totals) {
    wins = nickname_wins[i] || 0
    games = nickname_totals[i]
    winrate = ((wins / games) * 100).toFixed(2) || 0
    playtime = secondsToHMS(nickname_playtime[i]) || '00:00:00'
    console.log(`| ${i}: ${wins} wins in ${games} games (${winrate}%) - ${playtime}`)
}

if (!opponent_arg) {
    console.log('-------- TOP OPPONENTS --------')
    opponent_results = []
    // Calculate opponent win rates
    for (i in opponent_totals) {
        wins = opponent_wins[i] || 0
        games = opponent_totals[i]
        winrate = ((wins / games) * 100).toFixed(2) || 0
        opponent_results.push({code: i, wins: wins || 0, games: games, playtime: opponent_playtime[i]})
    }

    // Sort opponents results list by games played in descending order
    opponent_results.sort(function(a, b) {
        return b.games - a.games
    })

    // Display opponent results (up to 10)
    top_10 = opponent_results.slice(0,10)
    for (i = 0; i < top_10.length; i++) {
        winrate = ((top_10[i].wins / top_10[i].games) * 100).toFixed(2) || 0
        playtime = secondsToHMS(top_10[i].playtime) || '00:00:00'
        console.log(`| ${top_10[i].code}: ${top_10[i].wins} wins in ${top_10[i].games} games (${winrate}%) - ${playtime}`)
    }
}

// Use question to prevent automatic close
readlineSync.question('-------------------------------')
