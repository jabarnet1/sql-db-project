const populateShootingHeatmaps = async function(connection) {
    try {
      console.log('Starting shooting heatmap table population...');
      
      // 1. Create the heatmap table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS player_shooting_heatmap (
            player_id INT,
            season INT,
            team_id INT,
            event_type VARCHAR(50),
            x_coord INT,
            y_coord INT,
            shot_count INT,
            PRIMARY KEY (player_id, season, team_id, event_type, x_coord, y_coord),
            FOREIGN KEY (player_id) REFERENCES player_info(player_id),
            FOREIGN KEY (team_id) REFERENCES team_info(team_id)
        );
      `;
      
      await connection.query(createTableQuery);
      console.log('Shooting heatmap table created or validated');
      
      // 2. Insert aggregated data
      const populateQuery = `
        INSERT INTO player_shooting_heatmap (player_id, season, team_id, event_type, x_coord, y_coord, shot_count)
        SELECT 
            gpp.player_id,
            g.season,
            gp.team_id_for AS team_id,
            gp.event AS event_type,
            (gp.x / 5) * 5 AS x_coord,
            (gp.y / 5) * 5 AS y_coord,
            COUNT(*) AS shot_count
        FROM game_plays gp
        JOIN game_plays_players gpp ON gp.play_id = gpp.play_id AND gpp.playerType = 'Shooter'
        JOIN game g ON gp.game_id = g.game_id
        WHERE gp.event IN ('Shot', 'Goal', 'Missed Shot')
        AND gp.x IS NOT NULL AND gp.y IS NOT NULL
        GROUP BY 
            gpp.player_id,
            g.season,
            gp.team_id_for,
            gp.event,
            (gp.x / 5) * 5,
            (gp.y / 5) * 5;
      `;
      
      const result = await connection.query(populateQuery);
      console.log(`Populated shooting heatmap table with ${result.rowCount} records`);
      
      return {
        success: true,
        message: `Populated shooting heatmap table with ${result.rowCount} records`
      };
    } catch (error) {
      console.error('Error populating shooting heatmap table:', error);
      return {
        success: false,
        message: 'Failed to populate shooting heatmap table',
        error: error.message
      };
    }
  };
  module.exports = { populateShootingHeatmaps };