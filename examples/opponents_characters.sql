-- Get a distribution of all opponent's characters, ordered by most common.
-- Replace 'DJSwerve' with your tag, unless your tag is DJSwerve.

with my_games as (
    select op.character as char
    from players me, players op
    where op.id != me.id
    and me.game_id = op.game_id
    and me.tag = 'DJSwerve')

select
    char,
    count(char) * 100.0 / (select count(*) from my_games) as pct
from my_games
group by char
order by pct desc;
