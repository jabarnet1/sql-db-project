"# CIS550-Spring2025-Project" 

# NHL Stats App - Server



This is the backend API server for the NHL Stats App that provides NHL player and team statistics from multiple seasons.



## Setup



1. Install dependencies:

   ```

   npm install

   ```



2. Configure database connection in `config.json`:

   ```json

   {

     "rds_host": "your-db-host",

     "rds_port": "5432",

     "rds_user": "username",

     "rds_password": "password",

     "rds_db": "moneypuck_db",

     "server_host": "localhost",

     "server_port": "8080"

   }

   ```



3. Start the server:

   ```

   node server.js

   ```





## Data Model



The server connects to a PostgreSQL database containing NHL statistics. Key tables include:



- `player_info` - Player biographical information

- `team_info` - Team information

- `game` - Game records

- `game_skater_stats` - Player performance in individual games

- `season_skater_stats` - Aggregated player statistics by season

- `season_team_stats` - Aggregated team statistics by season

- `team_standings` - Team standings information by season


4. Client setup:


Unzip the project package and copy the following directory to a local folder.

 ```
    nhl-stats-app

 ```



5. Client Installation:


- navigate to server directory and install dependencies

 ```

   npm install

 ```

- navigate to client directory and install dependencies

 ```

   npm install

 ```

6. Start the application:

- navigate to server directory and execute the following

 ```

   npm start

 ```

- navigate to client directory and execute the following

 ```

   npm start

 ```
7. Run the application in a standard web browser

http://localhost:3000/




