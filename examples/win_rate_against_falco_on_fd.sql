-- Win rate against Falco on FD (a personal favorite).
-- Replace 'DJSwerve' with your tag unless your tag is DJSwerve.

with my_games as (
    select me.*
    from players me, players op, games
    where op.id != me.id
    and me.game_id = op.game_id
    and me.game_id = games.id
    and not games.is_teams
    and op.character = 'FALCO'
    and games.stage = 'FINAL_DESTINATION'
    and me.tag = 'DJSwerve')

select avg(winner) * 100 from my_games;
