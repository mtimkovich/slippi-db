create table if not exists games (
    id integer primary key not null,
    filepath text not null unique,
    is_teams boolean not null,
    start_time datetime not null,
    stage text not null,
    duration real not null
);

create table if not exists players (
    id integer primary key not null,
    game_id integer not null,
    tag text not null,
    code text not null,
    character text not null,
    port integer not null,
    stocks integer not null,
    damage real not null,
    team text,
    winner boolean not null,

    foreign key(game_id) references game(id) on delete cascade
);
