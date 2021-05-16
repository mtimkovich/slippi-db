create table if not exists games (
    id integer primary key not null,
    filepath text not null unique,
    is_teams boolean not null,
    start_time datetime not null,
    stage text not null,
    duration real not null
);

/*
create table if not exists games (
    id integer primary key not null,
    filepath text not null unique,
    is_teams boolean not null,
    start_time datetime not null,
    stage text not null,
    duration real not null,
    port1 integer,
    port2 integer,
    port3 integer,
    port4 integer,
    -- json
    teams text,
    winners text not null,
    remaining_stocks text not null,

    foreign key(filepath) references slps(filepath),
    foreign key(port1) references players(id),
    foreign key(port2) references players(id),
    foreign key(port3) references players(id),
    foreign key(port4) references players(id)
);
*/

create table if not exists players (
    id integer primary key not null,
    game_id integer not null,
    tag text not null,
    code text not null,
    -- `character` is a reserved word lol
    /* fighter text not null, */
    port integer not null,
    stocks integer not null,
    damage real not null,
    team integer,

    foreign key(game_id) references game(id)
);
