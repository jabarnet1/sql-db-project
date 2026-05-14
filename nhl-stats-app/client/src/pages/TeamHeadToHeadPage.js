import React, { useState } from 'react';
import {
  TextField, Button, Container, Typography,
  Grid, CircularProgress, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const config = require('../config.json');

const TeamHeadToHeadPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [team1, setTeam1] = useState(null); //test
  const [team2, setTeam2] = useState(null); //test
  const [error, setError] = useState(null); //test
  const [headToHeadData, setHeadToHeadData] = useState(null);
  const [loading, setLoading] = useState(false);

  

  const API_BASE_URL = `http://${config.server_host}:${config.server_port}`;

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      try {
        const res = await fetch(`${API_BASE_URL}/search/teams?name=${query}`);
        const teamData = await res.json();
        setTeams(teamData);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    } else {
      setTeams([]);
    }
  };

  const handleTeamSelect = (team) => {
    const alreadySelected = selectedTeams.find((t) => t.team_id === team.team_id);

    if (alreadySelected) {
      setSelectedTeams(selectedTeams.filter((t) => t.team_id !== team.team_id));
    } else if (selectedTeams.length < 2) {
      setSelectedTeams([...selectedTeams, team]);
    }

    // Clear previous comparison data when teams change
    setHeadToHeadData(null);
  };

  //Version 1 -bad
  //const handleCompareTeams = async () => {
  //  try {
  //    const res = await fetch(`${API_BASE_URL}/teamheadtohead?team1_id=${team1.team_id}&team2_id=${team2.team_id}`);
  //    const data = await res.json();
  //    console.log('Raw head-to-head response:', data);
  
  //    if (data.error) {
  //      console.error('API Error:', data.error);
  //      setError('Something went wrong: ' + data.error);
  //      return;
  //    }
  
      // Check if expected keys exist
  //    if (
  //      !data.games || !Array.isArray(data.games) ||
  //      data.team1_name === undefined || data.team2_name === undefined
  //    ) {
  //      console.error('Head-to-head data is not in the expected format.');
  //      setError('Data format error. Please try again.');
  //      return;
  //   }
  
  //    setHeadToHeadData(data);
  //    setError(null);
  //  } catch (err) {
  //    console.error('Network or parsing error:', err);
  //    setError('Failed to fetch data.');
  //  }
  //};

  const handleCompareTeams = () => {
    if (selectedTeams.length !== 2) {
      setError('Please select exactly two teams.');
      return;
    }
  
    const [team1, team2] = selectedTeams;
  
    navigate('/TeamHeadToHeadResult', {
      state: { team1, team2 }
    });
  };

  const handleRowClick = (params) => {
    navigate(`/TeamPage/${params.row.team_id}`);
  };

  const clearSelectedTeams = () => {
    setSelectedTeams([]);
    setHeadToHeadData(null);
  };

  const teamColumns = [
    { field: 'team_id', headerName: 'ID', width: 100 },
    { field: 'teamname', headerName: 'Team Name', width: 200 },
    { field: 'abbreviation', headerName: 'Abbreviation', width: 120 },
    { field: 'division', headerName: 'Division', width: 130 },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Compare Two Teams Head-to-Head
      </Typography>

      {/* Search bar */}
      <TextField
        label="Search for teams"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: 20 }}
      />

      {/* Display teams */}
      {teams.length > 0 && (
        <div style={{ height: 400, width: '100%', marginBottom: 40 }}>
          <DataGrid
            rows={teams.map((team) => ({ id: team.team_id, ...team }))}
            columns={teamColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            onRowClick={(params) => handleTeamSelect(params.row)}
            getRowClassName={(params) =>
              selectedTeams.some((t) => t.team_id === params.row.team_id) ? 'selected-team-row' : ''
            }
          />
        </div>
      )}

      {/* Selected teams */}
      <Typography variant="h6" gutterBottom>
        Selected Teams ({selectedTeams.length}/2):
      </Typography>
      <Grid container spacing={2} style={{ marginBottom: 10 }}>
        {selectedTeams.map((team) => (
          <Grid item key={team.team_id}>
            <Tooltip title="Click again to remove">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleTeamSelect(team)}
              >
                {team.teamname}
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* Clear button */}
      {selectedTeams.length > 0 && (
        <Button variant="text" color="error" onClick={clearSelectedTeams}>
          Clear Selected Teams
        </Button>
      )}

      {/* Compare button */}
      {selectedTeams.length === 2 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleCompareTeams}
          style={{ marginTop: 20 }}
        >
          Compare Teams
        </Button>
      )}

      {/* Loading spinner */}
      {loading && <CircularProgress style={{ marginTop: 20 }} />}

      {/* Head-to-head data */}
      {headToHeadData && (
        <div style={{ marginTop: 40 }}>
          <Typography variant="h6" gutterBottom>
            Head-to-Head Comparison
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">{headToHeadData.team1_name}</Typography>
              <Typography>Games Played: {headToHeadData.games_played}</Typography>
              <Typography>Wins: {headToHeadData.team1_wins}</Typography>
              <Typography>Avg Goals: {headToHeadData.team1_avg_goals}</Typography>
              <Typography>Avg Shots: {headToHeadData.team1_avg_shots}</Typography>
              <Typography>Power Play %: {headToHeadData.team1_pp_percentage}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">{headToHeadData.team2_name}</Typography>
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
        </div>
      )}
    </Container>
  );
};

export default TeamHeadToHeadPage;
