import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';


const config = require('../config.json');

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [playerResults, setPlayerResults] = useState([]);
  const [teamResults, setTeamResults] = useState([]);

  const API_BASE_URL = `http://${config.server_host}:${config.server_port}`;

  const handleGoToStandings = () => {
    navigate('/standings');
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      try {
        const [playerRes, teamRes] = await Promise.all([
          fetch(`${API_BASE_URL}/search/players?name=${query}`),
          fetch(`${API_BASE_URL}/search/teams?name=${query}`)
        ]);

        const [playerData, teamData] = await Promise.all([playerRes.json(), teamRes.json()]);

        setPlayerResults(playerData);
        setTeamResults(teamData);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      setPlayerResults([]);
      setTeamResults([]);
    }
  };

  const handlePlayerRowClick = (params) => {
    const pid = params.row.player_id;
    navigate(`/players/${pid}/profile`);
  };

  const handleTeamRowClick = (params) => {
    navigate(`/teams/${params.row.team_id}`);
  };

  // Player table columns
  const playerColumns = [
    { field: 'player_id', headerName: 'ID', width: 100 },
    { field: 'firstname', headerName: 'First Name', width: 150 },
    { field: 'lastname', headerName: 'Last Name', width: 150 },
    { field: 'birthdate', headerName: 'Birth Date', width: 130 },
    { field: 'nationality', headerName: 'Nationality', width: 120 },
    { field: 'primaryposition', headerName: 'Position', width: 120 },
  ];

  // Team table columns
  const teamColumns = [
    { field: 'team_id', headerName: 'ID', width: 100 },
    { field: 'teamname', headerName: 'Team Name', width: 180 },
    { field: 'abbreviation', headerName: 'Abbreviation', width: 120 },
    { field: 'shortname', headerName: 'Short Name', width: 150 },
    { field: 'division', headerName: 'Division', width: 130 },
    { field: 'conference', headerName: 'Conference', width: 130 },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome to True Fans!
      </Typography>

      {/* Search bar */}
      <TextField
        label="Start typing any player or a team name"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: 20 }}
      />

      {/* Player results */}
      {playerResults.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>Player Results</Typography>
          <div style={{ height: 400, width: '100%', marginBottom: 40 }}>
            <DataGrid
              rows={playerResults.map((p) => ({ id: p.player_id, ...p }))}
              columns={playerColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              onRowClick={handlePlayerRowClick}
            />
          </div>
        </>
      )}

      {/* Team results */}
      {teamResults.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>Team Results</Typography>
          <div style={{ height: 400, width: '100%', marginBottom: 40 }}>
            <DataGrid
              rows={teamResults.map((t) => ({ id: t.team_id, ...t }))}
              columns={teamColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              onRowClick={handleTeamRowClick}
            />
          </div>
        </>
      )}

      {/* Standings Button */}
      <Grid container justifyContent="center">
        <Button variant="contained" color="primary" onClick={handleGoToStandings}>
          League Standings
        </Button>
      </Grid>

      {/* Head-to-Head Button */}
      <Grid container justifyContent="center" style={{ marginTop: 20 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/team-head-to-head')}
        >
          Game Day 
        </Button>
      </Grid>

      {/* Hockey Rink Image */}
      <Grid container justifyContent="center" style={{ marginTop: 30 }}>
        <img
          src="/Icehockeylayout.svg"
          alt="Hockey Rink"
          style={{
            width: '80%',
            maxWidth: '700px',
            borderRadius: 0,
          }}
        />
      </Grid>




    </Container>
  );
};

export default LandingPage;