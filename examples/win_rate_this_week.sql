-- Calculate singles win rate over the past week.
-- Replace 'DJSwerve' with your tag unless your tag is DJSwerve.

with my_games as (
    select me.*
    from players me, players op, games
    where op.id != me.id
    and me.game_id = op.game_id
    and games.id = me.game_id
    and not games.is_teams
    and games.start_time between
        datetime('now', 'localtime', '-6 days')
        and datetime('now', 'localtime')
    and me.tag = 'DJSwerve')

select avg(winner) * 100 from my_games;
