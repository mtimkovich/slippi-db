-- Find the longest consecutive winning streak.
-- Returns the replay that the streak starts with and the length of the streak.
-- Replace 'DJSwerve' with your tag unless your tag is DJSwerve.

with my_games as (
    select me.*, games.filepath, games.start_time
    from players me, players op, games
    where op.id != me.id
    and me.tag = 'DJSwerve'
    and me.game_id = op.game_id
    and me.game_id = games.id
    and not games.is_teams
    order by start_time
),

streaks as (
    select *,
    (row_number() over (order by start_time) -
     row_number() over (partition by winner order by start_time)
    ) as grp
    from my_games
)

select filepath, count(*) as cnt
from streaks
-- Change this to `where not winner` if you want to see your longest losing streak. :/
where winner
group by grp, winner
order by cnt desc
limit 1;
