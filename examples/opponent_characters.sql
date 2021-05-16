-- Get all opponent's characters, ordered by most frequent.

select op.character, count(op.character) as cnt
from players me, players op
where me.tag = "TAG"
and op.id != me.id
and me.game_id = op.game_id
group by op.character
order by cnt desc;
