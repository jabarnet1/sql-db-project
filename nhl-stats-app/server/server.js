const express = require('express');
const cors = require('cors');
const config = require('./config.json');
const routes = require('./routes');


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/teams', routes.getTeams);
app.get('/teams/:team_id', routes.getTeamById);
app.get('/players', routes.getPlayers);
app.get('/players/:player_id', routes.getPlayerById);
app.get('/games', routes.getGames);
app.get('/games/:game_id', routes.getGameById);
app.get('/games/:game_id/plays', routes.getGamePlays);
app.get('/teams/:team_id/season_stats', routes.getTeamSeasonStats);
app.get('/players/:player_id/season_stats', routes.getPlayerSeasonStats);
app.get('/teams/:team_id/roster', routes.getTeamRoster);
app.get('/standings', routes.getTeamStandings);
app.get('/goalsdifference', routes.getExpectedVsActualGoals);
app.get('/playergoalsdifference', routes.getPlayerExpectedVsActualGoals);
app.get('/teamperformance', routes.getTeamPerformanceMetrics);
app.get('/players/:player_id/profile', routes.getPlayerProfile);
app.get('/players/:player_id/hotstreaks', routes.getPlayerHotStreaks);
app.get('/players/:player_id/heatmap', routes.getPlayerShootingHeatmap);
app.get('/teams/:team_id/performance', routes.getTeamPerformanceBySituation);
app.get('/teamheadtohead', routes.getTeamHeadToHead);
app.get('/search/players', routes.searchPlayers);
app.get('/search/teams', routes.searchTeams);


const PORT = process.env.PORT || config.server_port || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

module.exports = app;