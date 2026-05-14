import { useEffect, useState } from 'react';
import { Container, Link } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
const config = require('../config.json');

export default function TeamPerformancePage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [season, setSeason] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const navigate = useNavigate();

  const handleSeasonChange = (season) => {
    setSeason(season);
    console.log(season);
  };

  const handleRowClick = (params) => {
    const teamId = params.row.team_id; // Make sure you're using the correct field for team ID
    navigate(`/teams/${teamId}/performance`); // Adjust routing if needed
    console.log(teamId);
  };

  useEffect(() => {
    if (season) {
      fetch(`http://${config.server_host}:${config.server_port}/teamperformance?season=${season}`)
        .then(res => res.json())
        .then(resJson => {
          const teamPerformanceWithSeason = resJson.map((teamPerformance) => ({
            team_id: teamPerformance.team_id,
            team_name: teamPerformance.team_name,
            winning_percentage: teamPerformance.winning_percentage,
            shooting_percentage: teamPerformance.shooting_percentage,
            total_points: teamPerformance.total_points,
            goals_for: teamPerformance.goals_for,
            goals_against: teamPerformance.goals_against,
            total_goals: teamPerformance.total_goals,
            total_shots: teamPerformance.total_shots,
          }));
          setData(teamPerformanceWithSeason);
          console.log(season);
        });
    }
  }, [season]);

  const seasons = data.map(item => item.season); // If needed, adjust the season fetching logic

  let currentSeason = 0;

  if (seasons[0] != null) {
    currentSeason = seasons[0].slice(0, 4) + "-" + seasons[0].slice(4);
  }

  const columns = [
    { field: 'team_id', headerName: 'Team ID' },
    { field: 'team_name', headerName: 'Team', renderCell: (params) => (
      <Link onClick={() => setSelectedTeamId(params.row.team_id)}>{params.value}</Link>) },
    { field: 'winning_percentage', headerName: 'Winning Percentage' },
    { field: 'shooting_percentage', headerName: 'Shooting Percentage' },
    { field: 'total_points', headerName: 'Total Points' },
    { field: 'goals_for', headerName: 'Goals For' },
    { field: 'goals_against', headerName: 'Goals Against' },
    { field: 'total_goals', headerName: 'Total Goals' },
    { field: 'total_shots', headerName: 'Total Shots' }
  ];

  return (
    <Container>
      <label htmlFor="season">Choose a season: </label>
      <select id="season" name="season" value={season} onChange={event => handleSeasonChange(event.target.value)}>
        <option value="20182019">20182019</option>
        <option value="20192020">20192020</option>
      </select>
      <h2>Season: {currentSeason}</h2>

      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        onRowClick={handleRowClick}
        rowsPerPageOptions={[10, 20, 30]}
      />
    </Container>
  );
}
