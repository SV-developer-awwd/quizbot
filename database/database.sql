create TABLE settings
(
    id                   SERIAL PRIMARY KEY,
    guild_id             BIGINT UNIQUE,
    rules                TEXT,
    prefix               VARCHAR,
    embed_color          VARCHAR,
    game_start           INTEGER,
    confirmation_timeout INTEGER,
    question_timeout     INTEGER,
    threads_timeout      INTEGER
);

create TABLE games
(
    id          SERIAL PRIMARY KEY,
    guild_id    BIGINT,
    game_id     INTEGER UNIQUE,
    rules       VARCHAR,
    type        INTEGER,
    leaderboard JSON,
    settings    JSON,
    questions   BIGINT[]
);

create TABLE questions
(
    id          SERIAL PRIMARY KEY,
    guild_id    BIGINT,
    question_id BIGINT UNIQUE,
    question    TEXT,
    answer_type INTEGER,
    answers     JSON,
    images      TEXT[]
);

create TABLE leaderboard
(
    id                SERIAL PRIMARY KEY,
    user_id           BIGINT UNIQUE,
    points_on_servers JSON
);

create TABLE servers
(
    id        SERIAL PRIMARY KEY,
    server_id BIGINT UNIQUE,
    users     BIGINT[]
);
