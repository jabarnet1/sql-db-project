const config = require('./config.json');
const { Pool } = require('pg');

const pool = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    // Test query to get a count of teams
    const result = await client.query('SELECT COUNT(*) FROM TEAM_INFO');
    console.log(`Number of teams in database: ${result.rows[0].count}`);
    
    // Test query to get first 5 players
    const players = await client.query('SELECT player_id, firstName, lastName FROM PLAYER_INFO LIMIT 5');
    console.log('Sample players:');
    players.rows.forEach(player => {
      console.log(`  ${player.player_id}: ${player.firstname} ${player.lastname}`);
    });
    
    client.release();
  } catch (err) {
    console.error('Error testing database connection:', err);
  } finally {
    
    await pool.end();
  }
}

testDatabaseConnection();