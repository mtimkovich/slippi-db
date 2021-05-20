-- Calculate win rate against all characters encountered
-- Supplement your own player code (in place of 'FRTZ#931') on lines 13 and 28

WITH
totals AS (
  SELECT
  character,
    COUNT(*) total_games_played,
    SUM(winner) total_wins,
    ROUND((SUM(winner) * 100.0)/(COUNT(*) *100.0),4) * 100 AS total_win_rate
  FROM players
-- Change this to your own player code
  WHERE code = 'FRTZ#931'
  GROUP BY character),
character_mus AS (
  SELECT
    me.character,
    COUNT(*) AS games_played,
    SUM(me.winner) AS wins,
    ROUND((SUM(me.winner) * 100.0)/(COUNT(*) * 100.0),4) * 100.0 AS win_rate,
    op.character AS op_character
  FROM players me, players op, games
  WHERE op.id != me.id
    AND me.game_id = op.game_id
    AND me.game_id = games.id
    AND NOT games.is_teams
  -- Change this to your own player code
  AND me.code = 'FRTZ#931'
  GROUP BY me.character, op_character
  ORDER BY win_rate DESC),
  reduce_set AS (
  SELECT * FROM character_mus
  -- Disregard low sample size MU's
  WHERE games_played > 5)
SELECT t.*,
  MAX(CASE WHEN op_character = 'FOX' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS fox,
  MAX(CASE WHEN op_character = 'FALCO' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS falco,
  MAX(CASE WHEN op_character = 'MARTH' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS marth,
  MAX(CASE WHEN op_character = 'SHEIK' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS sheik,
  MAX(CASE WHEN op_character = 'CAPTAIN_FALCON' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS captain_falcon,
  MAX(CASE WHEN op_character = 'JIGGLYPUFF' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS jigglypuff,
  MAX(CASE WHEN op_character = 'PEACH' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS peach,
  MAX(CASE WHEN op_character = 'PIKACHU' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS pikachu,
  MAX(CASE WHEN op_character = 'YOSHI' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS yoshi,
  MAX(CASE WHEN op_character = 'SAMUS' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS samus,
  MAX(CASE WHEN op_character = 'ICE_CLIMBERS' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS ice_climbers,
  MAX(CASE WHEN op_character = 'DR_MARIO' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS doctor_mario,
  MAX(CASE WHEN op_character = 'LUIGI' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS luigi,
  MAX(CASE WHEN op_character = 'MARIO' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS mario,
  MAX(CASE WHEN op_character = 'YOUNG_LINK' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS young_link,
  MAX(CASE WHEN op_character = 'GANONDORF' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS ganondorf,
  MAX(CASE WHEN op_character = 'LINK' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS link,
  MAX(CASE WHEN op_character = 'DONKEY_KONG' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS donkey_kong,
  MAX(CASE WHEN op_character = 'MEWTWO' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS mew_two,
  MAX(CASE WHEN op_character = 'ROY' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS roy,
  MAX(CASE WHEN op_character = 'GAME_AND_WATCH' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS game_and_watch,
  MAX(CASE WHEN op_character = 'ZELDA' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS zelda,
  MAX(CASE WHEN op_character = 'PICHU' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS pichu,
  MAX(CASE WHEN op_character = 'NESS' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS ness,
  MAX(CASE WHEN op_character = 'BOWSER' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS bowser,
  MAX(CASE WHEN op_character = 'KIRBY' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS kirby
FROM reduce_set
JOIN totals t USING(character)
GROUP BY character
ORDER BY AVG(total_win_rate) DESC;
