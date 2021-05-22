-- Fetch all the games where someone got 4 stocked.

select *
from players p1, players p2, games
where p1.id != p2.id
and p1.game_id = p2.game_id
and games.id = p1.game_id
and not games.is_teams
and p1.stocks = 4;
