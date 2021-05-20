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
    op.character AS op_character,
	games.stage
  FROM players me, players op, games
  WHERE op.id != me.id
    AND me.game_id = op.game_id
    AND me.game_id = games.id
    AND NOT games.is_teams
  -- Change this to your own player code
  AND me.code = 'FRTZ#931'
  GROUP BY me.character, stage
  ORDER BY win_rate DESC),
  reduce_set AS (
  SELECT * FROM character_mus
  -- Disregard low sample size MU's
  WHERE games_played > 5)
SELECT t.*,
  MAX(CASE WHEN stage = 'BATTLEFIELD' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS battlefield,
  MAX(CASE WHEN stage = 'DREAM_LAND_N64' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS dreamland,
  MAX(CASE WHEN stage = 'YOSHIS_STORY' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS yoshis_story,
  MAX(CASE WHEN stage = 'FINAL_DESTINATION' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS final_destination,
  MAX(CASE WHEN stage = 'POKEMON_STADIUM' THEN win_rate || '% ' || char(40) || wins || '/' || games_played || char(41) END) AS pokemon_stadium
FROM reduce_set rs
JOIN totals t USING(character)
GROUP BY character
ORDER BY AVG(total_win_rate) DESC;
