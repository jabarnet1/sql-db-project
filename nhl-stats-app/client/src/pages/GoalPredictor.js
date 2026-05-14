import React, { useState } from 'react';
import axios from 'axios';
import { 
  Button, 
  Paper, 
  Typography, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import SearchBar from '../components/SearchBar';

const config = require('../config.json');
const API_BASE_URL = `http://${config.server_host}:${config.server_port}`;

const GoalPredictor = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [isPlayerSearch, setIsPlayerSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [seasonSummary, setSeasonSummary] = useState(null);

  const handleSelectionChange = (option) => {
    setSelectedOption(option);
  };

  const handleSearchTypeChange = (isPlayer) => {
    setIsPlayerSearch(isPlayer);
    setResults([]);
    setSeasonSummary(null);
    setSelectedOption(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedOption) {
      setError('Please select a player or team from the dropdown');
      return;
    }
    
    setError('');
    setResults([]);
    setSeasonSummary(null);
    setIsLoading(true);

    try {
      const endpoint = isPlayerSearch
        ? `${API_BASE_URL}/playergoalsdifference`
        : `${API_BASE_URL}/goalsdifference`;
      
      // For players, use player_id, for teams use team_name
      const params = isPlayerSearch
        ? { player_id: selectedOption.id }
        : { team_name: selectedOption.label };

      console.log('Fetching goal data from:', endpoint, 'with params:', params);
      const response = await axios.get(endpoint, { params });
      console.log('Goal data response:', response.data);
      
      if (response.data.length === 0) {
        setError(`No ${isPlayerSearch ? 'player' : 'team'} found with that name`);
      } else {
        // Sort by season - most recent first
        const sortedResults = [...response.data].sort((a, b) => b.season - a.season);
        setResults(sortedResults);
        
        // Generate season summary stats
        const totalExpected = sortedResults.reduce((sum, item) => sum + parseFloat(item.expected_goals || 0), 0);
        const totalActual = sortedResults.reduce((sum, item) => sum + parseFloat(item.actual_goals || 0), 0);
        const totalDifference = totalActual - totalExpected;
        const allSeasons = sortedResults.map(item => formatSeason(item.season)).join(', ');
        
        setSeasonSummary({
          totalExpected: totalExpected.toFixed(2),
          totalActual: totalActual.toFixed(2),
          totalDifference: totalDifference.toFixed(2),
          allSeasons,
          numSeasons: sortedResults.length
        });
      }
    } catch (err) {
      console.error('Error fetching goal data:', err);
      setError(`Error fetching data: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to format season display
  const formatSeason = (season) => {
    return `${season.toString().slice(0, 4)}-${season.toString().slice(4)}`;
  };

  return (
    <Paper elevation={3} sx={{ padding: '2rem', margin: '2rem' }}>
      <Typography variant="h5" gutterBottom>
        Goal Predictor: Expected vs Actual Goals
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Compare expected goals (xG) with actual goals to evaluate performance across seasons.
        A positive difference means outperforming expectations.
      </Typography>

      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <SearchBar 
          isPlayerSearch={isPlayerSearch}
          allowTypeSwitch={true}
          onSelectionChange={handleSelectionChange}
          onSearchTypeChange={handleSearchTypeChange}
          helperText={isPlayerSearch 
            ? "Search for a player to see their expected vs. actual goals" 
            : "Search for a team to see their expected vs. actual goals"
          }
        />

        <Button 
          type="submit" 
          variant="contained" 
          disabled={isLoading || !selectedOption}
          sx={{ height: '56px', mt: 2 }}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </form>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {seasonSummary && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            {isPlayerSearch ? 'Player' : 'Team'} stats across {seasonSummary.numSeasons} seasons ({seasonSummary.allSeasons}):
          </Typography>
          <Typography>
            Total expected goals: <strong>{seasonSummary.totalExpected}</strong>, 
            actual goals: <strong>{seasonSummary.totalActual}</strong>, 
            difference: <strong style={{ 
              color: parseFloat(seasonSummary.totalDifference) > 0 ? 'green' : 
                     parseFloat(seasonSummary.totalDifference) < 0 ? 'red' : 'inherit'
            }}>
              {parseFloat(seasonSummary.totalDifference) > 0 ? '+' : ''}
              {seasonSummary.totalDifference}
            </strong>
          </Typography>
        </Alert>
      )}

      {results.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isPlayerSearch ? "Player Name" : "Team"}</TableCell>
                <TableCell>Season</TableCell>
                <TableCell align="right">Expected Goals</TableCell>
                <TableCell align="right">Actual Goals</TableCell>
                <TableCell align="right">Goal Difference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((item, idx) => (
                <TableRow 
                  key={idx}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell>{isPlayerSearch ? item.player_name : item.teamname}</TableCell>
                  <TableCell>{formatSeason(item.season)}</TableCell>
                  <TableCell align="right">{item.expected_goals}</TableCell>
                  <TableCell align="right">{item.actual_goals}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      color: 
                        parseFloat(item.goals_difference) > 0 ? 'success.main' : 
                        parseFloat(item.goals_difference) < 0 ? 'error.main' : 'text.primary',
                      fontWeight: 'bold'
                    }}
                  >
                    {parseFloat(item.goals_difference) > 0 ? '+' : ''}{item.goals_difference}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default GoalPredictor;
