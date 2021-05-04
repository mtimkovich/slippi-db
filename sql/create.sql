create table games (
    id integer primary key not null,
    filename text not null,
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

    foreign key(filename) references slps(filename),
    foreign key(port1) references players(id),
    foreign key(port2) references players(id),
    foreign key(port3) references players(id),
    foreign key(port4) references players(id)
);

create table players (
    id integer primary key not null,
    tag text not null,
    code text not null,
    -- `character` is a reserved word lol
    fighter text not null
);

create table slps (
    filename text primary key not null
);
