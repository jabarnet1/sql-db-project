import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, Typography, CircularProgress, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const config = require('../config.json');

export default function TeamRosterPage() {

  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');

  const [season, setSeason] = useState('20192020');
  const params = useParams();

  const [team_id, setTeamID] = useState(params.team_id);

  const [searchParams] = useSearchParams();
  const teamname = searchParams.get('teamname');

  const [selectedPId, setSelectedPId] = useState(null);
  const navigate = useNavigate();



 // const [searchParams] = useSearchParams();
//setTeamID(searchParams.get('team_id'));

  const handleSeasonChange = (season) => {
    setSeason(season);
    console.log(season);
 }

  const handleRowClick = (params) => {
  const pid = params.row.pid;
  navigate(`/players/${pid}/profile`);
  console.log(pid);
};


  useEffect(() => {

    if (team_id, season) {
    fetch(`http://${config.server_host}:${config.server_port}/teams/${team_id}/roster?season=${season}&teamname=${teamname}`)
      .then(res => res.json())
      .then(resJson => {
        const teamRosterForTheSeason = resJson.map((teamRoster) => ({ pid: teamRoster.player_id,
                                                                  fName: teamRoster.firstname,
                                                                  lName: teamRoster.lastname,
                                                                  Pos: teamRoster.primaryposition,
                                                                  GP: teamRoster.games_played,
                                                                  G: teamRoster.goals,
                                                                  A: teamRoster.assists,
                                                                  Pts: teamRoster.points,
                                                                  }));
        setData(teamRosterForTheSeason);
        console.log(team_id);
        console.log(season);
        console.log(teamname);
      })
    }
  }, [team_id, season, teamname]);

  const seasons = data.map(item => item.season);
  let currentSeason = 0;

  if (seasons[0] != null) {
    currentSeason = seasons[0].slice(0, 4) + "-" + seasons[0].slice(4);
  }

  const columns = [
    { field: 'pid', headerName: 'Player ID' },
    { field: 'fName', headerName: 'fName' },
    { field: 'lName', headerName: 'lName', renderCell: (params) => (
      <Link onClick={() => setSelectedPId(params.row.pid)}>{params.value} </Link>)},
    { field: 'Pos', headerName: 'Pos'},
    { field: 'G', headerName: 'G' },
    { field: 'A', headerName: 'A' },
    { field: 'Pts', headerName: 'Points' }
  ]


    return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Roster for {teamname} {/* Display team name */}
      </Typography>
    <h4>
      <label for="season">
      Season:&nbsp;
      </label> 
      <select font-size="28px" id="season" name="season" value={season} onChange={event => handleSeasonChange(event.target.value)}>
            <option value="20082009" >20082009</option>
            <option value="20092010" >20092010</option>
            <option value="20102011" >20102011</option>
            <option value="20112012" >20112012</option>
            <option value="20122013" >20122013</option>
            <option value="20132014" >20132014</option>
            <option value="20142015" >20142015</option>
            <option value="20152016" >20152016</option>
            <option value="20162017" >20162017</option>
            <option value="20172018" >20172018</option>
            <option value="20182019" >20182019</option>
            <option value="20192020" >20192020</option>
      </select>
      </h4>

      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        getRowId={(row) => row.pid}
        onRowClick={handleRowClick}
      />
    </Container>
  );
}