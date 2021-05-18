-- Calculate all time win rate in doubles.
-- Replace 'DJSwerve' with your tag unless your tag is DJSwerve.

with my_games as (
    select me.*
    from players me, players op, games
    where op.id != me.id
    and me.game_id = op.game_id
    and games.id = me.game_id
    and games.is_teams
    and me.tag = 'DJSwerve')

select distinct avg(winner) * 100 from my_games;
