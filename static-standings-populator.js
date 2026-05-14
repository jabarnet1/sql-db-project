
// This script creates the standings table and populates it with data for all seasons

async function populateStandingsTable(connection) {
    try {
      console.log('Starting standings table population...');
      
      // Create the standings table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS team_standings (
          season VARCHAR(8),
          team_id INT,
          shortname VARCHAR(50),
          teamname VARCHAR(100),
          games_played INT,
          wins INT,
          losses INT,
          ot_losses INT,
          goals_for INT,
          goals_against INT,
          plus_minus INT,
          points INT,
          PRIMARY KEY (season, team_id),
          FOREIGN KEY (team_id) REFERENCES team_info(team_id)
        );
      `;
      
      await connection.query(createTableQuery);
      console.log('Standings table created or validated');
      
      //  Compute and insert the standings data for all seasons
      const populateQuery = `
        INSERT INTO team_standings (
          season, team_id, shortname, teamname, 
          games_played, wins, losses, ot_losses, 
          goals_for, goals_against, plus_minus, points
        )
        WITH nhl_games AS (
          SELECT g.home_team_id,
                 g.away_team_id,
                 g.outcome,
                 g.home_goals,
                 g.away_goals,
                 g.season
          FROM game AS g
          WHERE g.type = 'R'
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
               ns.team,
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
        FROM nhl_standings AS ns JOIN team_info t ON
            ns.team = t.team_id
        GROUP BY ns.season, ns.team, t.shortname, t.teamname
      `;
      
      const result = await connection.query(populateQuery);
      console.log(`Populated standings table with ${result.rowCount} team season records`);
      
      return {
        success: true,
        message: `Populated standings table with ${result.rowCount} team season records`
      };
    } catch (error) {
      console.error('Error populating standings table:', error);
      return {
        success: false,
        message: 'Failed to populate standings table',
        error: error.message
      };
    }
  }
  
  module.exports = { populateStandingsTable };