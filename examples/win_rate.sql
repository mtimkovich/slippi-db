-- Calculate all time win percentage in singles.
-- Replace 'DJSwerve' with your tag unless your tag is DJSwerve.

with my_games as (
    select me.*
    from players me, players op
    where op.id != me.id
    and me.game_id = op.game_id
    and me.team is null
    and me.tag = 'DJSwerve')

select avg(winner)*100 from my_games;
