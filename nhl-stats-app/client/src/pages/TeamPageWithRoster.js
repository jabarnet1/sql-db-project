import React, { useEffect, useState } from 'react';
import { 
  useParams, 
  useSearchParams, 
  useNavigate 
} from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Divider, 
  Link,
  CircularProgress,
  Card,
  CardContent,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const config = require('../config.json');
const API_BASE_URL = `http://${config.server_host}:${config.server_port}`;

const TeamPageWithRoster = () => {
  
  const { team_id } = useParams();
  const [searchParams] = useSearchParams();
  const teamname = searchParams.get('teamname');
  const navigate = useNavigate();
  
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  
  const [teamInfo, setTeamInfo] = useState(null);
  const [standings, setStandings] = useState(null);
  const [metrics, setMetrics] = useState(null);
  
  
  const [roster, setRoster] = useState([]);
  const [season, setSeason] = useState('20192020');
  const [pageSize, setPageSize] = useState(10);

  
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        
        console.log(`Fetching team info from ${API_BASE_URL}/teams/${team_id}`);
        const infoRes = await fetch(`${API_BASE_URL}/teams/${team_id}`);
        const infoData = await infoRes.json();
        console.log('Team info data:', infoData);
        setTeamInfo(infoData);
  
        
        console.log(`Fetching team standings from ${API_BASE_URL}/standings?season=${season}`);
        const standingsRes = await fetch(`${API_BASE_URL}/standings?season=${season}`);
        const standingsData = await standingsRes.json();
        const thisTeamStanding = standingsData.find(t => t.team_id === Number(team_id));
        console.log('This team standing:', thisTeamStanding);
        setStandings(thisTeamStanding);
        
        
        console.log(`Fetching team season stats from ${API_BASE_URL}/teams/${team_id}/season_stats?season=${season}&situation=all`);
        const statsRes = await fetch(`${API_BASE_URL}/teams/${team_id}/season_stats?season=${season}&situation=all`);
        const statsData = await statsRes.json();
        console.log('Team stats data:', statsData);
        
        if (statsData && statsData.length > 0) {
          const statData = statsData[0]; // Use the most recent stats record
          
          // Extract metrics using lowercase field names for consistency
          // Create an object with lowercase keys for easier access
          const lowercaseStats = {};
          Object.keys(statData).forEach(key => {
            lowercaseStats[key.toLowerCase()] = statData[key];
          });
          console.log('Lowercase stats:', lowercaseStats);
          
          const calculatedMetrics = {
            team_id: Number(team_id),
            team_name: infoData.teamname,
            winning_percentage: thisTeamStanding?.wins && thisTeamStanding?.games_played ? 
              (thisTeamStanding.wins / thisTeamStanding.games_played).toFixed(3) : 'N/A',
            shooting_percentage: lowercaseStats.goalsfor !== undefined && 
              lowercaseStats.shotsongoalfor !== undefined && 
              parseFloat(lowercaseStats.shotsongoalfor) > 0 ? 
              (parseFloat(lowercaseStats.goalsfor) / parseFloat(lowercaseStats.shotsongoalfor)).toFixed(3) : 'N/A',
            total_points: thisTeamStanding?.points || 'N/A',
            goals_for: lowercaseStats.goalsfor || 'N/A',
            goals_against: lowercaseStats.goalsagainst || 'N/A',
            total_goals: lowercaseStats.goalsfor || 'N/A',
            total_shots: lowercaseStats.shotsongoalfor || lowercaseStats.shotattemptsfor || 'N/A'
          };
          
          console.log('Calculated metrics:', calculatedMetrics);
          setMetrics(calculatedMetrics);
        } else {
          console.log('No team stats data found');
          setMetrics(null);
        }
        
        console.log(`Fetching roster from ${API_BASE_URL}/teams/${team_id}/roster?season=${season}&teamname=${infoData.teamname}`);
        const rosterRes = await fetch(`${API_BASE_URL}/teams/${team_id}/roster?season=${season}&teamname=${infoData.teamname}`);
        const rosterData = await rosterRes.json();
        const formattedRoster = rosterData.map((player) => ({ 
          pid: player.player_id,
          fName: player.firstname,
          lName: player.lastname,
          Pos: player.primaryposition,
          GP: player.games_played,
          G: player.goals,
          A: player.assists,
          Pts: player.points,
        }));
        setRoster(formattedRoster);
        
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchTeamData();
  }, [team_id, season]);

  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  
  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  
  const handlePlayerRowClick = (params) => {
    const pid = params.row.pid;
    navigate(`/players/${pid}/profile`);
  };

  
  const rosterColumns = [
    { field: 'pid', headerName: 'ID', width: 80, hide: true },
    { field: 'fName', headerName: 'First Name', width: 130 },
    { field: 'lName', headerName: 'Last Name', width: 130 },
    { field: 'Pos', headerName: 'Position', width: 100 },
    { field: 'GP', headerName: 'GP', width: 70, type: 'number' },
    { field: 'G', headerName: 'G', width: 70, type: 'number' },
    { field: 'A', headerName: 'A', width: 70, type: 'number' },
    { field: 'Pts', headerName: 'Pts', width: 70, type: 'number' }
  ];

  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  
  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">{error}</Typography>
      </Container>
    );
  }

  
  if (!teamInfo) {
    return <Container><Typography>Team data unavailable</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4">{teamInfo.teamname}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {teamInfo.division} Division • {teamInfo.conference} Conference
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            
            <Typography variant="body2">
              <strong>Abbreviation:</strong> {teamInfo.abbreviation}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="team information tabs">
          <Tab label="Team Overview" />
          <Tab label="Team Roster" />
        </Tabs>
      </Box>

      
      {activeTab === 0 ? (
        
        <Grid container spacing={3}>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel id="overview-season-select-label">Season</InputLabel>
                <Select
                  labelId="overview-season-select-label"
                  id="overview-season-select"
                  value={season}
                  label="Season"
                  onChange={handleSeasonChange}
                >
                  <MenuItem value="20082009">2008-2009</MenuItem>
                  <MenuItem value="20092010">2009-2010</MenuItem>
                  <MenuItem value="20102011">2010-2011</MenuItem>
                  <MenuItem value="20112012">2011-2012</MenuItem>
                  <MenuItem value="20122013">2012-2013</MenuItem>
                  <MenuItem value="20132014">2013-2014</MenuItem>
                  <MenuItem value="20142015">2014-2015</MenuItem>
                  <MenuItem value="20152016">2015-2016</MenuItem>
                  <MenuItem value="20162017">2016-2017</MenuItem>
                  <MenuItem value="20172018">2017-2018</MenuItem>
                  <MenuItem value="20182019">2018-2019</MenuItem>
                  <MenuItem value="20192020">2019-2020</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Showing team data for {season.slice(0, 4)}-{season.slice(4)} season
              </Typography>
            </Box>
          </Grid>
          
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Standings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {standings ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Games Played</Typography>
                      <Typography variant="body2">Wins</Typography>
                      <Typography variant="body2">Losses</Typography>
                      <Typography variant="body2">OT Losses</Typography>
                      <Typography variant="body2">Points</Typography>
                      <Typography variant="body2">Goal Differential</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>{standings.games_played}</strong></Typography>
                      <Typography variant="body2"><strong>{standings.wins}</strong></Typography>
                      <Typography variant="body2"><strong>{standings.losses}</strong></Typography>
                      <Typography variant="body2"><strong>{standings.ot_losses}</strong></Typography>
                      <Typography variant="body2"><strong>{standings.points}</strong></Typography>
                      <Typography variant="body2"><strong>{standings.plus_minus}</strong></Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography color="text.secondary">Standings data not available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Team Performance Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {metrics ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Winning %</Typography>
                      <Typography variant="body2">Shooting %</Typography>
                      <Typography variant="body2">Total Points</Typography>
                      <Typography variant="body2">Goals For</Typography>
                      <Typography variant="body2">Goals Against</Typography>
                      <Typography variant="body2">Total Goals</Typography>
                      <Typography variant="body2">Total Shots</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>{metrics.winning_percentage !== 'N/A' ? 
                        Number(metrics.winning_percentage).toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 1}) : 
                        'N/A'}</strong></Typography>
                      <Typography variant="body2"><strong>{metrics.shooting_percentage !== 'N/A' ? 
                        Number(metrics.shooting_percentage).toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 1}) : 
                        'N/A'}</strong></Typography>
                      <Typography variant="body2"><strong>{metrics.total_points}</strong></Typography>
                      <Typography variant="body2"><strong>{metrics.goals_for}</strong></Typography>
                      <Typography variant="body2"><strong>{metrics.goals_against}</strong></Typography>
                      <Typography variant="body2"><strong>{metrics.total_goals}</strong></Typography>
                      <Typography variant="body2"><strong>{metrics.total_shots}</strong></Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography color="text.secondary">Team metrics not available for this season</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        
        <Box>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">
                {teamInfo.teamname} Roster
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="season-select-label">Season</InputLabel>
                <Select
                  labelId="season-select-label"
                  id="season-select"
                  value={season}
                  label="Season"
                  onChange={handleSeasonChange}
                >
                  <MenuItem value="20082009">2008-2009</MenuItem>
                  <MenuItem value="20092010">2009-2010</MenuItem>
                  <MenuItem value="20102011">2010-2011</MenuItem>
                  <MenuItem value="20112012">2011-2012</MenuItem>
                  <MenuItem value="20122013">2012-2013</MenuItem>
                  <MenuItem value="20132014">2013-2014</MenuItem>
                  <MenuItem value="20142015">2014-2015</MenuItem>
                  <MenuItem value="20152016">2015-2016</MenuItem>
                  <MenuItem value="20162017">2016-2017</MenuItem>
                  <MenuItem value="20172018">2017-2018</MenuItem>
                  <MenuItem value="20182019">2018-2019</MenuItem>
                  <MenuItem value="20192020">2019-2020</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={roster}
              columns={rosterColumns}
              pageSize={pageSize}
              rowsPerPageOptions={[5, 10, 25]}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              getRowId={(row) => row.pid}
              onRowClick={handlePlayerRowClick}
              density="standard"
              disableSelectionOnClick
            />
          </div>
        </Box>
      )}
    </Container>
  );
};

export default TeamPageWithRoster; 