const { Pool } = require('pg');
const { populateShootingHeatmaps } = require('./static-shotheatmap-populator'); 

const pool = new Pool({
  host: 'hockey-db.ch98wn7athal.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'cis550hockey',
  password: 'JaMoYu123'
  
});

(async function() {
  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    console.log('Connected successfully, populating standings table...');
    const result = await populateShootingHeatmaps(client);
    console.log(result.message);
    client.release();
  } catch (error) {
    console.error('Error connecting to database or populating table:', error);
  } finally {
    console.log('Closing database connection pool');
    await pool.end();
  }
})();