create table games (
    id integer primary key not null,
    foreign key(filename) references slps(filename),
    is_teams boolean not null,
    start_time datetime not null,
    stage text not null,
    duration real not null,
    foreign key(port1) references players(id),
    foreign key(port2) references players(id),
    foreign key(port3) references players(id),
    foreign key(port4) references players(id),
    -- json
    teams text,
    winners text not null,
);

create table players (
    id integer primary key not null,
    tag text not null,
    code text not null,
    -- `character` is a reserved word lol
    fighter text not null,
);

create table slps (
    filename text primary key not null,
);
