-- Calculate singles win rate over the past week.
-- Replace 'DJSwerve' with your tag unless your tag is DJSwerve.

with my_games as (
    select me.*
    from players me, players op, games
    where op.id != me.id
    and me.game_id = op.game_id
    and games.id = me.game_id
    and not games.is_teams
    and julianday() - julianday(games.start_time) < 7
    and me.tag = 'DJSwerve')

select avg(winner) * 100 from my_games;
