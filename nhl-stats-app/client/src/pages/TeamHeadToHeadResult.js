import React, { useEffect, useState } from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Grid, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
const config = require('../config.json');

const TeamHeadToHeadResult = () => {
  const { state } = useLocation();
  const { team1, team2 } = state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headToHeadData, setHeadToHeadData] = useState(null);

  const API_BASE_URL = `http://${config.server_host}:${config.server_port}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!team1 || !team2) {
          setError('Teams not provided.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/teamheadtohead?team1_id=${team1.team_id}&team2_id=${team2.team_id}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          // Flatten the head-to-head data and include games
          setHeadToHeadData({
            ...data.headToHead,
            games: data.games
          });
        }
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [team1, team2]);

  if (loading) return <Container><CircularProgress /></Container>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;
  if (!headToHeadData) return null;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Head-to-Head: {headToHeadData.team1_name} vs {headToHeadData.team2_name}
      </Typography>

      <Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <Typography variant="h6">
      {headToHeadData.team1_name}
      {headToHeadData.team1_wins > headToHeadData.team2_wins && (
        <EmojiEventsIcon style={{ color: '#FFD700', marginLeft: 8 }} />
      )}
    </Typography>
    <Typography>Games Played: {headToHeadData.games_played}</Typography>
    <Typography>Wins: {headToHeadData.team1_wins}</Typography>
    <Typography>Avg Goals: {headToHeadData.team1_avg_goals}</Typography>
    <Typography>Avg Shots: {headToHeadData.team1_avg_shots}</Typography>
    <Typography>Power Play %: {headToHeadData.team1_pp_percentage}</Typography>
  </Grid>

  <Grid item xs={12} md={6}>
    <Typography variant="h6">
      {headToHeadData.team2_name}
      {headToHeadData.team2_wins > headToHeadData.team1_wins && (
        <EmojiEventsIcon style={{ color: '#FFD700', marginLeft: 8 }} />
      )}
    </Typography>
    <Typography>Games Played: {headToHeadData.games_played}</Typography>
    <Typography>Wins: {headToHeadData.team2_wins}</Typography>
    <Typography>Avg Goals: {headToHeadData.team2_avg_goals}</Typography>
    <Typography>Avg Shots: {headToHeadData.team2_avg_shots}</Typography>
    <Typography>Power Play %: {headToHeadData.team2_pp_percentage}</Typography>
  </Grid>
</Grid>


      <Typography variant="h6" gutterBottom style={{ marginTop: 30 }}>
        Games Between Teams
      </Typography>
      {headToHeadData.games.length > 0 ? (
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={headToHeadData.games.map((game) => ({ id: game.game_id, ...game }))}
            columns={[
              { field: 'game_id', headerName: 'Game ID', width: 100 },
              { field: 'date_time_GMT', headerName: 'Date', width: 180 },
              { field: 'home_team', headerName: 'Home Team', width: 180 },
              { field: 'away_team', headerName: 'Away Team', width: 180 },
              { field: 'home_goals', headerName: 'Home Goals', width: 130 },
              { field: 'away_goals', headerName: 'Away Goals', width: 130 },
              { field: 'outcome', headerName: 'Outcome', width: 130 },
            ]}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </div>
      ) : (
        <Typography>No games found between the selected teams.</Typography>
      )}
    </Container>
  );
};

export default TeamHeadToHeadResult;
