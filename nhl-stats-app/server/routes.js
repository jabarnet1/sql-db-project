const { Pool } = require('pg');
const config = require('./config.json');


const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Successfully connected to the database');
  }
});

/**
 * Team Routes
 */

// Get all teams
const getTeams = async function(req, res) {
  connection.query(
    `SELECT * 
     FROM TEAM_INFO 
     ORDER BY teamName`,
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(data.rows);
      }
    }
  );
}

// Get team by ID
const getTeamById = async function(req, res) {
  const team_id = req.params.team_id;
  connection.query(
    `SELECT * 
     FROM TEAM_INFO 
     WHERE team_id = $1`, 
    [team_id],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (data.rows.length === 0) {
        res.status(404).json({ error: 'Team not found' });
      } else {
        res.json(data.rows[0]);
      }
    }
  );
}

/**
 * Player Routes
 */

// Get all players (with pagination)
const getPlayers = async function(req, res) {
  const page = req.query.page || 1;
  const pageSize = req.query.page_size || 20;
  const offset = (page - 1) * pageSize;
  
  connection.query(
    `SELECT * 
     FROM PLAYER_INFO 
     ORDER BY lastName, firstName
     LIMIT $1 OFFSET $2`,
    [pageSize, offset],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(data.rows);
      }
    }
  );
}

// Get player by ID
const getPlayerById = async function(req, res) {
  const player_id = req.params.player_id;
  connection.query(
    `SELECT * 
     FROM PLAYER_INFO 
     WHERE player_id = $1`,
    [player_id],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (data.rows.length === 0) {
        res.status(404).json({ error: 'Player not found' });
      } else {
        res.json(data.rows[0]);
      }
    }
  );
}

/**
 * Game Routes
 */

// Get games (with optional filtering and pagination)
const getGames = async function(req, res) {
  const page = req.query.page || 1;
  const pageSize = req.query.page_size || 20;
  const offset = (page - 1) * pageSize;
  const season = req.query.season;
  
  let query = `
    SELECT g.*, 
           ht.teamName as home_team_name, 
           at.teamName as away_team_name
    FROM GAME g
    JOIN TEAM_INFO ht ON g.home_team_id = ht.team_id
    JOIN TEAM_INFO at ON g.away_team_id = at.team_id
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (season) {
    query += ` WHERE g.season = $${paramCount}`;
    params.push(season);
    paramCount++;
  }
  
  query += ` ORDER BY g.date_time_GMT DESC
             LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(pageSize, offset);
  
  connection.query(query, params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.rows);
    }
  });
}

// Get game by ID
const getGameById = async function(req, res) {
  const game_id = req.params.game_id;
  connection.query(
    `SELECT g.*, 
            ht.teamName as home_team_name, 
            at.teamName as away_team_name
     FROM GAME g
     JOIN TEAM_INFO ht ON g.home_team_id = ht.team_id
     JOIN TEAM_INFO at ON g.away_team_id = at.team_id
     WHERE g.game_id = $1`,
    [game_id],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (data.rows.length === 0) {
        res.status(404).json({ error: 'Game not found' });
      } else {
        res.json(data.rows[0]);
      }
    }
  );
}

// Get plays for a specific game
const getGamePlays = async function(req, res) {
  const game_id = req.params.game_id;
  connection.query(
    `SELECT p.*, 
            t1.teamName as team_for_name,
            t2.teamName as team_against_name
     FROM GAME_PLAYS p
     LEFT JOIN TEAM_INFO t1 ON p.team_id_for = t1.team_id
     LEFT JOIN TEAM_INFO t2 ON p.team_id_against = t2.team_id
     WHERE p.game_id = $1
     ORDER BY p.period, p.periodTime`,
    [game_id],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(data.rows);
      }
    }
  );
}

/**
 * Season Stats Routes
 */

// Get team season stats
const getTeamSeasonStats = async function(req, res) {
  const team_id = req.params.team_id;
  const season = req.query.season;
  const situation = req.query.situation || 'all';
  
  let query = `
    SELECT * 
    FROM SEASON_TEAM_STATS 
    WHERE team_id = $1 AND situation = $2
  `;
  
  const params = [team_id, situation];
  
  if (season) {
    query += ` AND season = $3`;
    params.push(season);
  }
  
  connection.query(query, params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.rows);
    }
  });
}

// Get player season stats
const getPlayerSeasonStats = async function(req, res) {
  const player_id = req.params.player_id;
  const season = req.query.season;
  const situation = req.query.situation || 'all';
  
  
  connection.query(
    `SELECT primaryPosition FROM PLAYER_INFO WHERE player_id = $1`,
    [player_id],
    (err, posData) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      } 
      
      if (posData.rows.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      const isGoalie = posData.rows[0].primaryPosition === 'G';
      const table = isGoalie ? 'SEASON_GOALIE_STATS' : 'SEASON_SKATER_STATS';
      
      let query = `
        SELECT * 
        FROM ${table} 
        WHERE player_id = $1 AND situation = $2
      `;
      
      const params = [player_id, situation];
      
      if (season) {
        query += ` AND season = $3`;
        params.push(season);
      }
      
      connection.query(query, params, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.json(data.rows);
        }
      });
    }
  );
}

/**
 * Team Matchup Routes
 */

// Get team roster
const getTeamRoster = async function(req, res) {
  const team_id = req.params.team_id;
  const season = req.query.season || '20192020';
  
  connection.query(
    `SELECT DISTINCT g.player_id, p.firstname, p.lastname, p.primaryPosition, 
            s.games_played, s.i_f_goals AS goals, 
            (s.i_f_primaryassists + s.i_f_secondaryassists) AS assists, 
            s.i_f_points AS points 
     FROM game_skater_stats g
     JOIN player_info p ON p.player_id = g.player_id
     LEFT JOIN season_skater_stats s ON s.player_id = g.player_id AND s.season = $2 AND s.situation = 'all'
     WHERE g.team_id = $1 
     AND g.game_id IN (SELECT game_id FROM game WHERE season = $2)
     ORDER BY points DESC NULLS LAST`,
    [team_id, season],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(data.rows);
      }
    }
  );
}

//code to create Materialized View for expected vs actual goals
// CREATE MATERIALIZED VIEW team_goals_comparison_mv AS
// SELECT
//     ss.team,
//     ti.team_id,
//     ti.teamname,
//     ss.season,
//     ROUND(SUM(ss.i_f_lowDangerxGoals + ss.i_f_mediumDangerxGoals + ss.i_f_highDangerxGoals)::numeric, 2) AS expected_goals,
//     ROUND(SUM(ss.i_f_lowDangerGoals + ss.i_f_mediumDangerGoals + ss.i_f_highDangerGoals)::numeric, 2) AS actual_goals,
//     ROUND((SUM(ss.i_f_lowDangerGoals + ss.i_f_mediumDangerGoals + ss.i_f_highDangerGoals) -
//     SUM(ss.i_f_lowDangerxGoals + ss.i_f_mediumDangerxGoals + ss.i_f_highDangerxGoals))::numeric, 2) AS goals_difference
// FROM season_skater_stats ss
// JOIN team_info ti ON ss.team = ti.abbreviation
// WHERE ss.situation = 'all'
// GROUP BY ss.team, ti.team_id, ti.teamname, ss.season;
// Get team expected vs actual goals
const getExpectedVsActualGoals = async function(req, res) {
  const team_id = req.query.team_id;
  const team_name = req.query.team_name;
  const season = req.query.season;
  
  let query = `
    SELECT * FROM team_goals_comparison_mv
    WHERE 1=1
  `;
  
  const params = [];
  let paramIndex = 1;
  
  if (season) {
    query += ` AND season = $${paramIndex}`;
    params.push(season);
    paramIndex++;
  }
  
  if (team_id) {
    query += ` AND team_id = $${paramIndex}`;
    params.push(team_id);
    paramIndex++;
  }
  
  if (team_name) {
    query += ` AND (LOWER(teamname) LIKE LOWER($${paramIndex}) OR LOWER(team) LIKE LOWER($${paramIndex}))`;
    params.push(`%${team_name}%`);
    paramIndex++;
  }
  
  query += ` ORDER BY goals_difference DESC`;
  
  connection.query(query, params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.rows);
    }
  });
}

const getPlayerExpectedVsActualGoals = async function(req, res) {
    const player_id = req.query.player_id;
    const player_name = req.query.player_name;
    const season = req.query.season;
    const team = req.query.team;
    
    let query = `
      SELECT 
        ss.player_id,
        pi.firstname || ' ' || pi.lastname AS player_name,
        ss.team,
        ti.teamname,
        ss.season,
        ss.position,
        ss.games_played,
        ROUND(SUM(ss.i_f_lowDangerxGoals + ss.i_f_mediumDangerxGoals + ss.i_f_highDangerxGoals)::numeric, 2) AS expected_goals,
        ROUND(SUM(ss.i_f_lowDangerGoals + ss.i_f_mediumDangerGoals + ss.i_f_highDangerGoals)::numeric, 2) AS actual_goals,
        ROUND((SUM(ss.i_f_lowDangerGoals + ss.i_f_mediumDangerGoals + ss.i_f_highDangerGoals) - 
        SUM(ss.i_f_lowDangerxGoals + ss.i_f_mediumDangerxGoals + ss.i_f_highDangerxGoals))::numeric, 2) AS goals_difference
      FROM season_skater_stats ss
      JOIN player_info pi ON ss.player_id = pi.player_id
      JOIN team_info ti ON ss.team = ti.abbreviation
      WHERE ss.situation = 'all'`;
    
    const params = [];
    let paramIndex = 1;
    
    if (player_id) {
      query += ` AND ss.player_id = $${paramIndex}`;
      params.push(player_id);
      paramIndex++;
    }
    
    if (player_name) {
      // Case-insensitive search for either first name or last name
      query += ` AND (LOWER(pi.firstname) LIKE LOWER($${paramIndex}) OR LOWER(pi.lastname) LIKE LOWER($${paramIndex}))`;
      params.push(`%${player_name}%`);
      paramIndex++;
    }
    
    if (season) {
      query += ` AND ss.season = $${paramIndex}`;
      params.push(season);
      paramIndex++;
    }
    
    if (team) {
      query += ` AND ss.team = $${paramIndex}`;
      params.push(team);
      paramIndex++;
    }
    
    query += `
      GROUP BY ss.player_id, pi.firstname, pi.lastname, ss.team, ti.teamname, ss.season, ss.position, ss.games_played
      ORDER BY goals_difference DESC`;
    
    connection.query(query, params, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(data.rows);
      }
    });
  }

// Get team standings

// const getTeamStandings = async function(req, res) {
//     const season = req.query.season || '20192020';
    
//     const query = `
//       SELECT 
//         season,
//         team_id AS team,
//         shortname,
//         teamname,
//         games_played AS GP,
//         wins AS W,
//         losses AS L,
//         ot_losses AS OTL,
//         goals_for AS GF,
//         goals_against AS GA,
//         plus_minus,
//         points AS Pts
//       FROM team_standings
//       WHERE season = $1
//       ORDER BY Pts DESC, W DESC, plus_minus DESC`;
    
//     connection.query(query, [season], (err, data) => {
//       if (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//       } else {
//         res.json(data.rows);
//       }
//     });
//   }
const getTeamStandings = async function(req, res) {
  const season = req.query.season || '20192020';
  
  const query = `
    WITH nhl_games AS (
      SELECT g.home_team_id,
             g.away_team_id,
             g.outcome,
             g.home_goals,
             g.away_goals,
             g.season
      FROM game AS g
      WHERE g.type = 'R'
      AND g.season = $1
    ),
    nhl_standings AS (
      SELECT ng.season,
             ng.home_team_id AS team,
             'home' AS home_away,
             ng.home_goals AS goals_for,
             ng.away_goals AS goals_against,
             CASE WHEN ng.outcome = 'home win REG' THEN 2
                  WHEN ng.outcome = 'home win OT' THEN 2
                  WHEN ng.outcome = 'away win OT' THEN 1
                  ELSE 0 END AS points
      FROM nhl_games AS ng
      UNION ALL
      SELECT ng.season,
             ng.away_team_id AS team,
             'away' AS home_away,
             ng.away_goals AS goals_for,
             ng.home_goals AS goals_against,
             CASE WHEN ng.outcome = 'away win REG' THEN 2
                  WHEN ng.outcome = 'away win OT' THEN 2
                  WHEN ng.outcome = 'home win OT' THEN 1
                  ELSE 0 END AS points
      FROM nhl_games AS ng
    )
    SELECT ns.season,
           ns.team AS team_id,
           t.shortname,
           t.teamname,
           COUNT(*) AS games_played,
           SUM(CASE WHEN points = 2 THEN 1 ELSE 0 END) AS wins,
           SUM(CASE WHEN points = 0 THEN 1 ELSE 0 END) AS losses,
           SUM(CASE WHEN points = 1 THEN 1 ELSE 0 END) AS ot_losses,
           SUM(goals_for) AS goals_for,
           SUM(goals_against) AS goals_against,
           SUM(goals_for) - SUM(goals_against) AS plus_minus,
           SUM(points) AS points
    FROM nhl_standings AS ns 
    JOIN team_info t ON ns.team = t.team_id
    GROUP BY ns.season, ns.team, t.shortname, t.teamname
    ORDER BY points DESC, wins DESC, plus_minus DESC
  `;
  
  connection.query(query, [season], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.rows);
    }
  });
};

  

  // Get team performance metrics
  
  const getTeamPerformanceMetrics = async function(req, res) {
    const { season, team_id } = req.query;  // Get team_id from query params
    const querySeason = season || '20192020';  // Use provided season or default
  
    const query = `
      WITH shooting_stats AS (
          SELECT T.team_id,
                 T.teamName AS teamname,
                 SUM(GTS.goals) AS total_goals,
                 SUM(GTS.shots) AS total_shots,
                 COUNT(DISTINCT GTS.game_id) AS games_played,
                 ROUND(SUM(GTS.goals) * 1.0 / NULLIF(SUM(GTS.shots), 0), 4) AS shooting_percentage
          FROM game_teams_stats GTS
          JOIN team_info T ON GTS.team_id = T.team_id
          JOIN game G ON GTS.game_id = G.game_id
          WHERE G.season = $1
          GROUP BY T.team_id, T.teamName
      )
      SELECT
      ts.team_id,  
          ts.teamname AS team_name,
          ROUND((ts.wins * 1.0 / NULLIF(ts.games_played, 0)), 3) AS winning_percentage,
          ss.shooting_percentage,
          ts.points AS total_points,
          ts.goals_for AS goals_for,
          ts.goals_against AS goals_against,
          ss.total_goals,
          ss.total_shots
      FROM team_standings ts
      JOIN shooting_stats ss ON ts.team_id = ss.team_id
      WHERE ts.season = $1
      AND ts.team_id = $2
      ORDER BY winning_percentage DESC, shooting_percentage DESC, total_points DESC`;
  
    connection.query(query, [querySeason, team_id], (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(data.rows);
      }
    });
  };


// Get player profile
const getPlayerProfile = async function(req, res) {
  const player_id = req.params.player_id;
  
  connection.query(
    `SELECT 
       p.firstname,
       p.lastname,
       p.nationality,
       p.birthcity,
       p.primaryposition,
       p.birthdate,
       p.height,
       p.weight,
       p.shootscatches,
       p.player_id
     FROM player_info p
     WHERE p.player_id = $1`,
    [player_id],
    (err, profileData) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (profileData.rows.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      // Get player stats by season
      connection.query(
        `SELECT 
           season,
           games_played,
           i_f_goals AS goals,
           i_f_primaryassists + i_f_secondaryassists AS assists,
           i_f_points AS points,
           i_f_shotsOnGoal AS shots,
           ROUND(CAST((i_f_goals * 1.0 / NULLIF(i_f_shotsOnGoal, 0)) * 100 AS numeric), 1) AS shooting_percentage,
           icetime / games_played AS avg_time_on_ice
         FROM season_skater_stats 
         WHERE player_id = $1 AND situation = 'all' 
         ORDER BY season`,
        [player_id],
        (err, statsData) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          res.json({
            profile: profileData.rows[0],
            seasons: statsData.rows
          });
        }
      );
    }
  );
}


// advanced analytics

// Get player hot streaks
const getPlayerHotStreaks = async function(req, res) {
  const player_id = req.params.player_id;
  const season = req.query.season;
  
  let query = `
    SELECT 
      p.firstname, p.lastname,
      g.date_time_GMT::date as game_date,
      gs.goals, gs.assists, gs.shots,
      (gs.goals + gs.assists) as points,
      t.shortname as team,
      opp.shortname as opponent,
      g.outcome,
      gs.timeOnIce,
      g.game_id
    FROM game_skater_stats gs
    JOIN game g ON gs.game_id = g.game_id
    JOIN player_info p ON gs.player_id = p.player_id
    JOIN team_info t ON gs.team_id = t.team_id
    JOIN team_info opp ON (CASE WHEN gs.team_id = g.home_team_id THEN g.away_team_id ELSE g.home_team_id END) = opp.team_id
    WHERE gs.player_id = $1`;
  
  const params = [player_id];
  let paramIndex = 2;
  
  if (season) {
    query += ` AND g.season = $${paramIndex}`;
    params.push(season);
  }
  
  query += ` ORDER BY game_date`;
  
  connection.query(query, params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Calculate 5-game rolling average for points
      const games = data.rows;
      if (games.length >= 5) {
        for (let i = 4; i < games.length; i++) {
          let sum = 0;
          for (let j = i - 4; j <= i; j++) {
            sum += games[j].points;
          }
          games[i].rolling_avg_points = parseFloat((sum / 5).toFixed(2));
        }
      }
      
      res.json(data.rows);
    }
  });
}

// Get team performance by situation
const getTeamPerformanceBySituation = async function(req, res) {
  const team_id = req.params.team_id;
  const season = req.query.season || '20182019';
  
  const query = `
    SELECT 
      t.teamname,
      gts.HoA,
      COUNT(*) as games,
      SUM(CASE WHEN gts.won THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN NOT gts.won THEN 1 ELSE 0 END) as losses,
      ROUND(SUM(CASE WHEN gts.won THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*), 0), 1) as win_percentage,
      ROUND(AVG(gts.goals), 2) as avg_goals_for,
      ROUND(AVG(gts.shots), 2) as avg_shots_for,
      ROUND(AVG(gts.powerPlayGoals), 2) as avg_pp_goals,
      ROUND(AVG(gts.powerPlayOpportunities), 2) as avg_pp_opportunities,
      ROUND(AVG(gts.powerPlayGoals) * 100.0 / NULLIF(AVG(gts.powerPlayOpportunities), 0), 1) as pp_percentage,
      ROUND(AVG(gts.faceOffWinPercentage), 1) as avg_faceoff_win_pct
    FROM game_teams_stats gts
    JOIN team_info t ON gts.team_id = t.team_id
    JOIN game g ON gts.game_id = g.game_id
    WHERE gts.team_id = $1
    AND g.season = $2
    GROUP BY t.teamname, gts.HoA
    ORDER BY win_percentage DESC`;
  
  connection.query(query, [team_id, season], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.rows);
    }
  });
}


// Get team head-to-head comparison
const getTeamHeadToHead = async function(req, res) {
  const team1_id = req.query.team1_id;
  const team2_id = req.query.team2_id;
  const season = req.query.season || '20182019';
  
  if (!team1_id || !team2_id) {
    return res.status(400).json({ error: 'Both team IDs are required' });
  }
  
  // Get season stats for both teams
  connection.query(
    `WITH matchup_games AS (
      SELECT game_id
      FROM game
      WHERE season = $3
      AND ((home_team_id = $1 AND away_team_id = $2) OR (home_team_id = $2 AND away_team_id = $1))
    ),
    team1_stats AS (
      SELECT 
        t.teamname,
        COUNT(*) as games_played,
        SUM(CASE WHEN gts.won THEN 1 ELSE 0 END) as wins,
        ROUND(AVG(gts.goals), 2) as avg_goals,
        ROUND(AVG(gts.shots), 2) as avg_shots,
        ROUND(SUM(gts.powerPlayGoals) * 100.0 / NULLIF(SUM(gts.powerPlayOpportunities), 0), 1) as pp_percentage
      FROM game_teams_stats gts
      JOIN team_info t ON gts.team_id = t.team_id
      JOIN matchup_games mg ON gts.game_id = mg.game_id
      WHERE gts.team_id = $1
      GROUP BY t.teamname
    ),
    team2_stats AS (
      SELECT 
        t.teamname,
        COUNT(*) as games_played,
        SUM(CASE WHEN gts.won THEN 1 ELSE 0 END) as wins,
        ROUND(AVG(gts.goals), 2) as avg_goals,
        ROUND(AVG(gts.shots), 2) as avg_shots,
        ROUND(SUM(gts.powerPlayGoals) * 100.0 / NULLIF(SUM(gts.powerPlayOpportunities), 0), 1) as pp_percentage
      FROM game_teams_stats gts
      JOIN team_info t ON gts.team_id = t.team_id
      JOIN matchup_games mg ON gts.game_id = mg.game_id
      WHERE gts.team_id = $2
      GROUP BY t.teamname
    )
    SELECT 
      t1.teamname as team1_name,
      t2.teamname as team2_name,
      t1.games_played,
      t1.wins as team1_wins,
      t2.wins as team2_wins,
      t1.avg_goals as team1_avg_goals,
      t2.avg_goals as team2_avg_goals,
      t1.avg_shots as team1_avg_shots,
      t2.avg_shots as team2_avg_shots,
      t1.pp_percentage as team1_pp_percentage,
      t2.pp_percentage as team2_pp_percentage
   FROM team1_stats t1, team2_stats t2`,
   [team1_id, team2_id, season],
   (err, headToHeadData) => {
     if (err) {
       console.error(err);
       return res.status(500).json({ error: 'Internal server error' });
     }
     
     // Get games between the teams
     connection.query(
       `SELECT 
         g.game_id,
         g.date_time_GMT,
         t1.teamname as home_team,
         t2.teamname as away_team,
         g.home_goals,
         g.away_goals,
         g.outcome
       FROM game g
       JOIN team_info t1 ON g.home_team_id = t1.team_id
       JOIN team_info t2 ON g.away_team_id = t2.team_id
       WHERE g.season = $3
       AND ((g.home_team_id = $1 AND g.away_team_id = $2) OR (g.home_team_id = $2 AND g.away_team_id = $1))
       ORDER BY g.date_time_GMT DESC`,
       [team1_id, team2_id, season],
       (err, gamesData) => {
         if (err) {
           console.error(err);
           return res.status(500).json({ error: 'Internal server error' });
         }
         
         res.json({
           headToHead: headToHeadData.rows[0] || {},
           games: gamesData.rows
         });
       }
     );
   }
 );
}

/**
* Search Routes
*/

// Search players
const searchPlayers = async function(req, res) {
 const name = req.query.name || '';
 const position = req.query.position;
 const nationality = req.query.nationality;
 const team = req.query.team;
 const season = req.query.season;
 
 let query = `
   SELECT DISTINCT p.player_id, p.firstname, p.lastname, p.primaryposition, p.nationality, p.birthdate, p.height, p.weight
   FROM player_info p
 `;
 

 if (team || season) {
   query += `
     JOIN game_skater_stats gs ON p.player_id = gs.player_id
     JOIN game g ON gs.game_id = g.game_id
   `;
 }
 

 let whereClause = [];
 const params = [];
 let paramIndex = 1;
 
 if (name) {
   whereClause.push(`(p.firstname ILIKE $${paramIndex} OR p.lastname ILIKE $${paramIndex})`);
   params.push(`%${name}%`);
   paramIndex++;
 }
 
 if (position) {
   whereClause.push(`p.primaryposition = $${paramIndex}`);
   params.push(position);
   paramIndex++;
 }
 
 if (nationality) {
   whereClause.push(`p.nationality = $${paramIndex}`);
   params.push(nationality);
   paramIndex++;
 }
 
 if (team) {
   whereClause.push(`gs.team_id = $${paramIndex}`);
   params.push(team);
   paramIndex++;
 }
 
 if (season) {
   whereClause.push(`g.season = $${paramIndex}`);
   params.push(season);
   paramIndex++;
 }
 
 if (whereClause.length > 0) {
   query += ` WHERE ` + whereClause.join(' AND ');
 }
 
 query += ` ORDER BY p.lastname, p.firstname`;
 
 connection.query(query, params, (err, data) => {
   if (err) {
     console.error(err);
     res.status(500).json({ error: 'Internal server error' });
   } else {
     res.json(data.rows);
   }
 });
}

// Search teams
const searchTeams = async function(req, res) {
 const name = req.query.name || '';
 
 connection.query(
   `SELECT * 
    FROM team_info 
    WHERE teamname ILIKE $1 OR shortname ILIKE $1 OR abbreviation ILIKE $1
    ORDER BY teamname`,
   [`%${name}%`],
   (err, data) => {
     if (err) {
       console.error(err);
       res.status(500).json({ error: 'Internal server error' });
     } else {
       res.json(data.rows);
     }
   }
 );
}



// const getPlayerShootingHeatmap = async function(req, res) {
//     const player_id = req.query.player_id;
//     const season = req.query.season || '20192020';
    
//     if (!player_id) {
//       return res.status(400).json({ error: 'Player ID is required' });
//     }
    
//     const query = `
//       SELECT 
//         pi.firstname || ' ' || pi.lastname AS player_name,
//         psh.season,
//         ti.teamname,
//         psh.event_type,
//         psh.x_coord,
//         psh.y_coord,
//         psh.shot_count
//       FROM player_shooting_heatmap psh
//       JOIN player_info pi ON psh.player_id = pi.player_id
//       JOIN team_info ti ON psh.team_id = ti.team_id
//       WHERE psh.player_id = $1
//       AND psh.season = $2
//       ORDER BY psh.shot_count DESC
//     `;
    
//     connection.query(query, [player_id, season], (err, data) => {
//       if (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//       } else {
//         res.json(data.rows);
//       }
//     });
//   };
const getPlayerShootingHeatmap = async function(req, res) {
  const player_id = req.params.player_id;
  const season = req.query.season || '20192020';
  
  if (!player_id) {
    return res.status(400).json({ error: 'Player ID is required' });
  }
  
  const query = `
    SELECT 
      CONCAT(pi.firstname, ' ', pi.lastname) AS player_name,
      g.season,
      ti.teamname,
      gp.event AS event_type,
      (gp.x / 5) * 5 AS x_coord,
      (gp.y / 5) * 5 AS y_coord,
      COUNT(*) AS shot_count
    FROM game_plays gp
    JOIN game_plays_players gpp ON gp.play_id = gpp.play_id AND gpp.playerType = 'Shooter'
    JOIN player_info pi ON gpp.player_id = pi.player_id
    JOIN game g ON gp.game_id = g.game_id
    JOIN team_info ti ON gp.team_id_for = ti.team_id
    WHERE gpp.player_id = $1
    AND g.season = $2
    AND gp.event IN ('Shot', 'Goal', 'Missed Shot')
    AND gp.x IS NOT NULL AND gp.y IS NOT NULL
    GROUP BY 
      pi.firstname, pi.lastname,
      g.season,
      ti.teamname,
      gp.event,
      (gp.x / 5) * 5,
      (gp.y / 5) * 5
    ORDER BY shot_count DESC
  `;
  
  connection.query(query, [player_id, season], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.rows);
    }
  });
};

  
  module.exports = {
    getTeams,
    getTeamById,
    getPlayers,
    getPlayerById,
    getGames,
    getGameById,
    getGamePlays,
    getTeamSeasonStats,
    getPlayerSeasonStats,
    getTeamRoster,
    getTeamStandings,
    getExpectedVsActualGoals,
    getPlayerExpectedVsActualGoals,
    getTeamPerformanceMetrics,
    getPlayerProfile,
    getPlayerHotStreaks,
    getTeamPerformanceBySituation,
    getTeamHeadToHead,
    searchPlayers,
    searchTeams,
    getPlayerShootingHeatmap
  };