import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, Typography, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';

import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
const config = require('../config.json');

export default function StandingsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [season, setSeason] = useState("20192020");
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const navigate = useNavigate();

  const handleSeasonChange = (season) => {
    setSeason(season);
    console.log(season);
 }

  const handleRowClick = (params) => {
  const team_Id = params.row.team;
  const teamname = params.row.shortname + " " + params.row.teamname;
  navigate(`/teams/${team_Id}`);
  console.log(team_Id);
};

  useEffect(() => {

    if (season) {
    let rowIndex = 0x01;
    fetch(`http://${config.server_host}:${config.server_port}/standings?season=${season}`)
      .then(res => res.json())
      .then(resJson => {
        const standingsWithSeason = resJson.map((standings) => ({ rank: rowIndex++,
                                                                  team: standings.team_id,
                                                                  season: standings.season,
                                                                  shortname: standings.shortname,
                                                                  teamname: standings.teamname,
                                                                  GP: standings.games_played,
                                                                  W: standings.wins,
                                                                  L: standings.losses,
                                                                  OTL: standings.ot_losses,
                                                                  GF: standings.goals_for,
                                                                  GA: standings.goals_against,
                                                                  plus_minus: standings.plus_minus,
                                                                  Pts: standings.points  }));
        setData(standingsWithSeason);
        console.log(season);
      })
    }
  }, [season]);

  /*
  const seasons = data.map(item => item.season);
  let currentSeason = 0;
  if (seasons[0] != null) {
    //currentSeason = seasons[0].slice(0, 4) + "-" + seasons[0].slice(4);
  }
  */

  const columns = [
    { field: 'rank', headerName: 'Rank' },
    { field: 'shortname', headerName: 'Home' },
    { field: 'teamname', headerName: 'Team', renderCell: (params) => (
      <Link component="button" onClick={() => navigate(`/teams/${params.row.team}`)}>{params.value}</Link>)},
    { field: 'GP', headerName: 'Games Played' },
    { field: 'W', headerName: 'Wins' },
    { field: 'L', headerName: 'Losses' },
    { field: 'OTL', headerName: 'Overtime Losses' },
    { field: 'GF', headerName: 'Goals For' },
    { field: 'GA', headerName: 'Goals Against' },
    { field: 'plus_minus', headerName: 'Plus Minus' },
    { field: 'Pts', headerName: 'Points' }
  ]


    return (
    <Container>

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
        getRowId={(row) => row.team}
        onRowClick={handleRowClick}
      />
    </Container>
  );
}