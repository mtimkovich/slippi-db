const  glob = require("glob")
const { default: SlippiGame } = require('@slippi/slippi-js')
const  readlineSync = require('readline-sync')
const fs = require('fs');
const pjson = require('./package.json')
const jsonLock = require('./package-lock.json')
const crypto = require('crypto')

const statsVersion = pjson.version
const slippiJsVersion = jsonLock.dependencies["@slippi/slippi-js"].version
const cacheFilePath = "./cacheFile.json"

// Characters ordered by ID
const  characters = ['Captain Falcon', 'Donkey Kong', 'Fox', 'Mr. Game & Watch', 'Kirby', 'Bowser',
            'Link', 'Luigi', 'Mario', 'Marth', 'Mewtwo', 'Ness', 'Peach', 'Pikachu',
            'Ice Climbers', 'Jigglypuff', 'Samus', 'Yoshi', 'Zelda', 'Sheik', 'Falco',
            'Young Link', 'Dr. Mario', 'Roy', 'Pichu', 'Ganondorf']

            const  characters_lowercase = ['captain falcon', 'donkey kong', 'fox', 'mr. game & watch', 'kirby', 'bowser',
            'link', 'luigi', 'mario', 'marth', 'mewtwo', 'ness', 'peach', 'pikachu',
            'ice climbers', 'jigglypuff', 'samus', 'yoshi', 'zelda', 'sheik', 'falco',
            'young link', 'dr. mario', 'roy', 'pichu', 'ganondorf']            

// Stages ordered by ID
const stages = [null, null, 'Fountain of Dreams', 'Pokémon Stadium', "Princess Peach's Castle", 'Kongo Jungle',
                'Brinstar', 'Corneria', "Yoshi's Story", 'Onett', 'Mute City', 'Rainbow Cruise', 'Jungle Japes',
                'Great Bay', 'Hyrule Temple', 'Brinstar Depths', "Yoshi's Island", 'Green Greens', 'Fourside', 
                'Mushroom Kingdom I', 'Mushroom Kingdom II', null, 'Venom', 'Poké Floats', 'Big Blue', 'Icicle Mountain',
                'Icetop', 'Flat Zone', 'Dream Land N64', "Yoshi's Island N64", 'Kongo Jungle N64', 'Battlefield', 'Final Destination']

console.log('| Slippi Cumulative Stats v' + statsVersion)
console.log('-------------------------------')
console.log('| Provides cumulative stats from Slippi replays')
console.log("| Script checks current folder and subfolders. Include opponent's info if you want more specific stats")
console.log('| Note: Replays with no player data (pre-July 2020) are skipped (but counted in overall playtime)')
console.log('| Note: Your answers are not case-sensitive')
console.log('-------------------------------')

const user_player = readlineSync.question('Enter your connect code (or nickname): ').toLowerCase()
const opponent_arg = readlineSync.question("Enter your opponent's code or nickname (Optional. Leave blank for all opponents): ") || false
const player_character_arg = readlineSync.question('NEW: Enter your character (Optional. Leave blank for all your characters): ') || false

if (player_character_arg) {
    player_character_requested = checkCharacter(player_character_arg)
}

const character_arg = readlineSync.question("Enter your opponent's character (Optional. Leave blank for all characters): ") || false

if (character_arg) {
    character_requested = checkCharacter(character_arg)
}

function loadCache() {
    try {
        const contents = fs.readFileSync(cacheFilePath, 'utf8')
        const data = JSON.parse(contents)
        if (!data) { return }
        if (data.statsVersion != statsVersion) { return }
        if (data.slippiJsVersion != slippiJsVersion) { return }
        return data.results
    } catch {
        return undefined
    }
}

function checkCharacter(character_param) {
    user_character = character_param.toLowerCase()
    if (!characters_lowercase.includes(user_character)) {
        console.log(`${user_character} is not a valid character.`)
        readlineSync.question(`Valid characters: ${characters_lowercase.sort().join(', ')}`)
        process.exit()
    }
    else {
        return user_character
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
var stage_totals = []
var stage_wins = []
var stage_playtime = []
var final_player_name = user_player

console.log(`${files.length} replays found.`)

const cache = loadCache()

let hashedResults = {}
files
    .map((file, i) => { return processGame(file, i) })
    .forEach((results) => {
        processResults(results)
        hashedResults[results.hash] = results
    })

fs.writeFileSync(cacheFilePath, JSON.stringify({
    statsVersion,
    slippiJsVersion,
    results: hashedResults
}))

printResults()

function processGame(file, i) {
    const hash = crypto.createHash('md5').update(file).digest("hex")
    if (!!cache && !!cache[hash]) {
        return cache[hash]
    }
    let data = { hash }
    try {
        const game = new SlippiGame(file)
        const settings = game.getSettings()
        const metadata = game.getMetadata()
        try {
            game_seconds = Math.floor(metadata.lastFrame / 60)
            game_length = Math.floor(game_seconds / 60) + ":" + (game_seconds % 60 ? (game_seconds % 60).toString().padStart(2, '0') : '00')
            data.total_seconds = game_seconds
        }
        catch(err) {
            console.log(`${i}: Error reading replay metadata. Ignoring results... (${file})`)
            return data
        }
        if (settings.players.length !== 2) {
            console.log(`${i}: More than 2 players. Ignoring results... (${file})`)
            return data
        }
        try {
            if (JSON.stringify(metadata.players[0].names) === '{}' || JSON.stringify(metadata.players[1].names) === '{}') {
                console.log(`${i}: Replay is old or offline. (Missing player info) Ignoring results... (${file})`)
                return data
            }
        }
        catch(err) {
            console.log(`${i}: Replay is corrupted. (Missing player info) Ignoring results... (${file})`)
            return data
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
            console.log(`${i}: User ${user_player} not found in replay. Ignoring results... (${file})`)
            return data
        }
        if (opponent_arg && !opponent_found) {
            console.log(`${i}: Opponent ${opponent_player} not found in replay. Ignoring results... (${file})`)
            return data
        }
        if (ignored_arg && ignored_opponent_found) {
            console.log(`${i}: Opponent ${found_ignored_opponent} found in replay. Ignoring results... (${file})`)
            return data
        }

        player_character_num = player_characters[player_num]
        player_character = characters[player_character_num]
        player_name = player_names[player_num]

        opponent_character_num = player_characters[opponent_num]
        opponent_character = characters[opponent_character_num]
        opponent_name = player_names[opponent_num]
        opponent_code = player_codes[opponent_num]

        stage_num = settings.stageId

        if (player_character_arg && player_character.toLowerCase() !== player_character_requested) {
            requested_player_character_num = characters_lowercase.indexOf(player_character_requested)
            console.log(`${i}: User ${player_name} not playing ${characters[requested_player_character_num]}. (Found ${player_character}) Ignoring results... (${file})`)
            return data
        }

        if (character_arg && opponent_character.toLowerCase() !== character_requested) {
            requested_character_num = characters_lowercase.indexOf(character_requested)
            console.log(`${i}: Opponent ${opponent_name} not playing ${characters[requested_character_num]}. (Found ${opponent_character}) Ignoring results... (${file})`)
            return data
        }

        const stats = game.getStats()

        player_kills = stats.overall[player_num].killCount
        opponent_kills = stats.overall[opponent_num].killCount

        // Tie conditions
        if (game_seconds < 30 || (player_kills == 0 && opponent_kills == 0)) {
            console.log(`${i}: Game lasted less than 30 seconds or no stocks were taken. Ignoring results... (${file})`)
            return data
        }

        player_final_percent = game.getLatestFrame().players[player_num].post.percent
        opponent_final_percent = game.getLatestFrame().players[opponent_num].post.percent
        end_more_kills = player_kills > opponent_kills
        end_lower_percent = (player_kills == opponent_kills) && player_final_percent < opponent_final_percent

        // disabled due to perceived inconsistencies
        // try {
        //     end_opponent_LRAS = (game.getGameEnd().lrasInitiatorIndex == opponent_num)
        //     end_player_LRAS = (game.getGameEnd().lrasInitiatorIndex == player_num)
        // }
        // catch {
        //     end_opponent_LRAS = false
        //     end_player_LRAS = false
        // } 

        // Every death is considered the opponent's kill
        // If the player didn't quit out AND has more kills than the opponent, the same but with a lower percent, or the opponent quits out: it's a win, otherwise it's a loss. Ties handled above
        // if (!end_player_LRAS && (end_more_kills || end_lower_percent || end_opponent_LRAS)) {
        if (end_more_kills || end_lower_percent) {
            console.log(`${i}: ${player_name || player_codes[player_num]} (${player_character}) beat ${opponent_name || opponent_code} (${opponent_character}) in ${game_length}! (${file})`)
            data.total_wins = 1
        } else {
            console.log(`${i}: ${player_name || player_codes[player_num]} (${player_character}) lost to ${opponent_name || opponent_code} (${opponent_character}) in ${game_length}. (${file})`)
        }

        data.total_games = 1
        data.player_character_num = player_character_num
        data.player_name = player_name
        data.opponent_code = opponent_code
        data.stage_num = settings.stageId

        // Try to find last used nickname and actual connect code to display at the end
        if (player_name.length > 0) {
            data.final_player_name = player_name
        }
        data.real_player_code = player_codes[player_num]
        if (opponent_arg && player_names[opponent_num]) {
            if (opponent_name.length > 0) {
                data.final_opponent_name = opponent_name
            }
            data.real_opponent_code = player_codes[opponent_num]
        }
        data.game_seconds = game_seconds
        return data
    }
    catch(err) {
        console.log(`${i}: Error reading replay. Ignoring results... (${file})`)
        return data
    }
}

function processResults(r) {
    total_games += r.total_games || 0
    total_wins += r.total_wins || 0
    total_seconds += r.total_seconds || 0
    counted_seconds += r.game_seconds || 0

    // TODO only do this for the last one?
    if (!!r.real_player_code) {
        real_player_code = r.real_player_code
    }
    if (!!r.final_player_name) {
        final_player_name = r.final_player_name
    }
    if (!!r.final_opponent_name) {
        final_opponent_name = r.final_opponent_name
    }
    if (!!r.real_opponent_code) {
        real_opponent_code = r.real_opponent_code
    }
    
    if (!!r.player_character_num || r.player_character_num == 0) {
        character_totals[r.player_character_num] = (character_totals[r.player_character_num] + 1) || 1
        character_playtime[r.player_character_num] = (character_playtime[r.player_character_num] + r.game_seconds) || r.game_seconds
    }

    if (!!r.player_name) {
        nickname_totals[r.player_name] = (nickname_totals[r.player_name] + 1) || 1
        nickname_playtime[r.player_name] = (nickname_playtime[r.player_name] + r.game_seconds) || r.game_seconds
    }

    if (!!r.opponent_code) {
        opponent_totals[r.opponent_code] = (opponent_totals[r.opponent_code] + 1) || 1
        opponent_playtime[r.opponent_code] = (opponent_playtime[r.opponent_code] + r.game_seconds) || r.game_seconds
    }

    if (!!r.stage_num) {
        stage_totals[r.stage_num] = (stage_totals[r.stage_num] + 1) || 1
        stage_playtime[r.stage_num] = (stage_playtime[r.stage_num] + r.game_seconds) || r.game_seconds
    }

    if (r.total_wins == 1) {
        character_wins[r.player_character_num] = (character_wins[r.player_character_num] + 1) || 1
        nickname_wins[r.player_name] = (nickname_wins[r.player_name] + 1) || 1
        opponent_wins[r.opponent_code] = (opponent_wins[r.opponent_code] + 1) || 1
        stage_wins[r.stage_num] = (stage_wins[r.stage_num] + 1) || 1
    }
}

function printResults() {
    if (!total_games) {
        console.log('\n| No games found matching requested parameters.')
        console.log('-------------------------------')
        opponent_arg ? console.log(`| Players: ${user_player} vs ${opponent_arg}`) : console.log(`| Player: ${user_player}`)
        if (player_character_arg) { console.log(`| Player character: ${characters[characters_lowercase.indexOf(player_character_requested)]}`) }
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
    if (player_character_arg) { console.log(`| Player character: ${characters[characters_lowercase.indexOf(player_character_requested)]}`) }
    if (character_arg) { console.log(`| Opponent character: ${characters[characters_lowercase.indexOf(character_requested)]}`) }
    if (ignored_arg) { console.log(`| Ignored opponents: ${ignored_arg}`) }
    console.log(`| ${total_wins} wins in ${total_games} games (${win_rate}% win rate)`)
    console.log(`| ${secondsToHMS(counted_seconds)} in analyzed matches. ${secondsToHMS(total_seconds)} including ${files.length - total_games} skipped replays`)

    if (!player_character_arg) {
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
    }
    console.log('-------- STAGE RESULTS --------')
    stage_results = []
    // Calculate stage win rates
    for (i in stage_totals) {
        wins = stage_wins[i] || 0
        games = stage_totals[i]
        winrate = ((wins / games) * 100).toFixed(2) || 0
        stage_results.push({stage: stages[i], wins: wins || 0, games: games, playtime: stage_playtime[i]})
    }

    // Sort stage results list by games played in descending order
    stage_results.sort(function(a, b) {
        return b.games - a.games
    })

    // Display stage results
    for (i = 0; i < stage_results.length; i++) {
        winrate = ((stage_results[i].wins / stage_results[i].games) * 100).toFixed(2) || 0
        playtime = secondsToHMS(stage_results[i].playtime)
        console.log(`| ${stage_results[i].stage}: ${stage_results[i].wins} wins in ${stage_results[i].games} games (${winrate}%) - ${playtime}`)
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

    // readlineSync.question is used to prevent automatic closing of window
    readlineSync.question('-------------------------------')
}