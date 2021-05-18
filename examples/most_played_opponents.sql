-- Get the people you've played the most amount of games with.
-- Replace 'DJSwerve' with your tag unless your tag is DJSwerve.

with my_games as (
    select op.tag as op
    from players me, players op
    where op.id != me.id
    and me.game_id = op.game_id
    and me.tag = 'DJSwerve')

select
    op,
    count(op) as cnt
from my_games
group by op
order by cnt desc
limit 10;
