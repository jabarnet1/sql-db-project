-- Create TEAM_INFO table
CREATE TABLE TEAM_INFO (
    team_id INT PRIMARY KEY,
    franchiseId INT NOT NULL,
    shortName VARCHAR(50) NOT NULL,
    teamName VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    link VARCHAR(255) NOT NULL
);

-- Create PLAYER_INFO table
CREATE TABLE PLAYER_INFO (
    player_id INT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    nationality VARCHAR(50), --missing for 8
    birthCity VARCHAR(100), --missing for 5
    primaryPosition VARCHAR(20) NOT NULL,
    birthDate DATE,
    height VARCHAR(10), --missing for 3
    height_cm FLOAT, --missing for 3
    weight INT, --missing for 3
    shootsCatches CHAR(1) --missing for 17, 'L' or 'R'
);

-- Create GAME table
CREATE TABLE GAME (
    game_id INT PRIMARY KEY,
    season INT NOT NULL,
    type VARCHAR(10) NOT NULL,
    date_time_GMT TIMESTAMPTZ NOT NULL,
    away_team_id INT NOT NULL,
    home_team_id INT NOT NULL,
    away_goals INT NOT NULL DEFAULT 0,
    home_goals INT NOT NULL DEFAULT 0,
    outcome VARCHAR(20) NOT NULL,
    home_rink_side_start VARCHAR(10), -- missing for 1196 games (4.5%)
    venue VARCHAR(50),
    venue_link VARCHAR(255),
    venue_time_zone_id VARCHAR(50),
    venue_time_zone_offset INT,
    venue_time_zone_tz VARCHAR(10),
    FOREIGN KEY (away_team_id) REFERENCES TEAM_INFO(team_id),
    FOREIGN KEY (home_team_id) REFERENCES TEAM_INFO(team_id)
);

-- Create GAME_TEAMS_STATS table: 5k/53k duplicates removed, 10 errors game_id not found
CREATE TABLE GAME_TEAMS_STATS (
    game_id INT NOT NULL,
    team_id INT NOT NULL,
    HoA CHAR(4),  -- 'home' or 'away'
    won BOOLEAN NOT NULL,
    settled_in VARCHAR(10) NOT NULL, --'REG' or 'OT'
    head_coach VARCHAR(100), -- missing for 28 games
    goals INT, -- missing for 8 games
    shots INT, -- missing for 8 games
    hits INT, -- missing for 2000-2001
    pim INT, -- missing for 8 games
    powerPlayOpportunities INT, -- missing for 8 games
    powerPlayGoals INT, -- missing for 8 games
    faceOffWinPercentage FLOAT, -- missing prior to 2010
    giveaways INT, -- missing for 2000-2001
    takeaways INT, -- missing for 2000-2001
    blocked INT, -- missing for 2000-2001
    startRinkSide VARCHAR(10),-- missing for 2392 games (4.5%)
    PRIMARY KEY (game_id, team_id),
    FOREIGN KEY (game_id) REFERENCES GAME(game_id),
    FOREIGN KEY (team_id) REFERENCES TEAM_INFO(team_id)
);

-- Create GAME_SKATER_STATS table: remove 92k/945k duplicates, 90 errors game_id not found
CREATE TABLE GAME_SKATER_STATS (
    game_id INT NOT NULL,
    player_id INT NOT NULL,
    team_id INT NOT NULL,
    timeOnIce INT NOT NULL,
    assists INT NOT NULL,
    goals INT NOT NULL,
    shots INT NOT NULL,
    hits INT, -- all null prior to 2010
    powerPlayGoals INT NOT NULL,
    powerPlayAssists INT NOT NULL,
    penaltyMinutes INT NOT NULL,
    faceOffWins INT NOT NULL,
    faceoffTaken INT NOT NULL,
    takeaways INT, --same as hits
    giveaways INT, --same as hits
    shortHandedGoals INT NOT NULL,
    shortHandedAssists INT NOT NULL,
    blocked INT, --same as hits
    plusMinus INT NOT NULL,
    evenTimeOnIce INT NOT NULL,
    shortHandedTimeOnIce INT NOT NULL,
    powerPlayTimeOnIce INT NOT NULL,
    PRIMARY KEY (game_id, player_id),
    FOREIGN KEY (game_id) REFERENCES GAME(game_id),
    FOREIGN KEY (player_id) REFERENCES PLAYER_INFO(player_id),
    FOREIGN KEY (team_id) REFERENCES TEAM_INFO(team_id)
);

-- Create GAME_GOALIE_STATS table: 20 game id not present, dropped 5000+ duplicate with same composite primary keys
CREATE TABLE GAME_GOALIE_STATS (
    game_id INT NOT NULL,
    player_id INT NOT NULL,
    team_id INT NOT NULL,
    timeOnIce INT NOT NULL,
    assists INT NOT NULL,
    goals INT NOT NULL,
    pim INT NOT NULL,
    shots INT NOT NULL,
    saves INT NOT NULL,
    powerPlaySaves INT NOT NULL,
    shortHandedSaves INT NOT NULL,
    evenSaves INT NOT NULL,
    shortHandedShotsAgainst INT NOT NULL,
    evenShotsAgainst INT NOT NULL,
    powerPlayShotsAgainst INT NOT NULL ,
    decision VARCHAR(1), -- missing decision data for some game
    savePercentage FLOAT, --0 shots played against for some game
    powerPlaySavePercentage FLOAT, --same as above
    evenStrengthSavePercentage FLOAT, --same as above
    PRIMARY KEY (game_id, player_id),
    FOREIGN KEY (game_id) REFERENCES GAME(game_id),
    FOREIGN KEY (player_id) REFERENCES PLAYER_INFO(player_id),
    FOREIGN KEY (team_id) REFERENCES TEAM_INFO(team_id)
);

-- Create GAME_PLAYS table: some game_id missing in game table (~5000/4m), dropped lots of duplicates
CREATE TABLE GAME_PLAYS (
    play_id VARCHAR(36) PRIMARY KEY,
    game_id INT NOT NULL,
    team_id_for INT, -- null for some event types like period start
    team_id_against INT,
    event VARCHAR(50) NOT NULL,
    secondaryType VARCHAR(100), -- secondary characterization of some event, like shot type, embelishment, etc..
    x INT, -- null for none-shot/block related
    y INT, -- same as x
    period INT NOT NULL,
    periodType VARCHAR(20) NOT NULL,
    periodTime INT NOT NULL,
    periodTimeRemaining INT, -- null for some? notsure why, 1200-periodTime
    dateTime TIMESTAMP NOT NULL,
    goals_away INT NOT NULL,
    goals_home INT NOT NULL,
    description TEXT NOT NULL,
    st_x INT, -- same as x, y
    st_y INT,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id),
    FOREIGN KEY (team_id_for) REFERENCES TEAM_INFO(team_id),
    FOREIGN KEY (team_id_against) REFERENCES TEAM_INFO(team_id)
);

-- Create GAME_PLAYS_PLAYERS table: removed 1.2m/7.6m duplicate composite primary keys, 15 play_id absent, 839 game_id absent
CREATE TABLE GAME_PLAYS_PLAYERS (
    game_id INT NOT NULL,
    play_id VARCHAR(36) NOT NULL,
    player_id INT NOT NULL,
    playerType VARCHAR(20) NOT NULL,
    PRIMARY KEY (play_id, player_id),
    FOREIGN KEY (game_id) REFERENCES GAME(game_id),
    FOREIGN KEY (play_id) REFERENCES GAME_PLAYS(play_id),
    FOREIGN KEY (player_id) REFERENCES PLAYER_INFO(player_id)
);

-- Create GAME_SHIFTS table: remove 4m/11.8m duplicates, 
CREATE TABLE GAME_SHIFTS (
    game_id INT NOT NULL,
    player_id INT NOT NULL,
    period INT NOT NULL,
    shift_start INT NOT NULL,
    shift_end INT, --can be null since some shifts didn't end?
    PRIMARY KEY (game_id, player_id, period, shift_start),
    FOREIGN KEY (game_id) REFERENCES GAME(game_id),
    FOREIGN KEY (player_id) REFERENCES PLAYER_INFO(player_id),
    FOREIGN KEY (team_id) REFERENCES TEAM_INFO(team_id)
);

-- Create GAME_GOALS table: 15k/148k duplicates removed, 65 play_id not exist
CREATE TABLE GAME_GOALS (
    play_id VARCHAR(36) PRIMARY KEY,
    strength VARCHAR(20) NOT NULL,
    gameWinningGoal BOOLEAN DEFAULT FALSE, --some are null, assume false
    emptyNet BOOLEAN DEFAULT FALSE, --some are null, assume false
    FOREIGN KEY (play_id) REFERENCES GAME_PLAYS(play_id)
);

-- Create GAME_PENALTIES table: removed 18k duplicate, 1 error play_id not found
CREATE TABLE GAME_PENALTIES (
    play_id VARCHAR(36) PRIMARY KEY,
    penaltySeverity VARCHAR(20), --all present 2010-, all null prior to 2010
    penaltyMinutes INT NOT NULL,
    year INT,
    FOREIGN KEY (play_id) REFERENCES GAME_PLAYS(play_id)
);

-- Create GAME_OFFICIALS table: removed 10k/105k duplicates, 20 game_id not found in game
CREATE TABLE GAME_OFFICIALS (
    game_id INT NOT NULL,
    official_name VARCHAR(50) NOT NULL,
    official_type VARCHAR(20) NOT NULL,
    PRIMARY KEY(game_id, official_name)
    FOREIGN KEY (game_id) REFERENCES GAME(game_id)
);

-- Create GAME_SCRATCHES table: removed 17k/137k duplicates
CREATE TABLE GAME_SCRATCHES (
    game_id INT NOT NULL,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    PRIMARY KEY (game_id, team_id, player_id),
    FOREIGN KEY (game_id) REFERENCES GAME(game_id),
    FOREIGN KEY (team_id) REFERENCES TEAM_INFO(team_id),
    FOREIGN KEY (player_id) REFERENCES PLAYER_INFO(player_id)
);
