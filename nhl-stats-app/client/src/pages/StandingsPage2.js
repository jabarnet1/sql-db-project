import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import SongCard from '../components/SongCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function StandingsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/standings`)
      .then(res => res.json())
      .then(resJson => {
        const standingsWithSeason = resJson.map((standings) => ({ 
                                                                  season: standings.season,
                                                                  team: standings.team,
                                                                  shortname: standings.shortname,
                                                                  teamname: standings.teamname,
                                                                  GP: standings.gp,
                                                                  W: standings.w,
                                                                  L: standings.l,
                                                                  OTL: standings.otl,
                                                                  GF: standings.gf,
                                                                  GA: standings.ga,
                                                                  plus_minus: standings.plus_minus,
                                                                  Pts: standings.pts  }));
        setData(standingsWithSeason);
      })
  }, []);

  const seasons = data.map(item => item.season);
  let currentSeason = 0;

  if (seasons[0] != null) {
    currentSeason = seasons[0].slice(0, 4) + "-" + seasons[0].slice(4);
  }

  const columns = [
    { field: 'team', headerName: 'Team ID' },
    { field: 'shortname', headerName: 'Home' },
    { field: 'teamname', headerName: 'Team' },
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
      <h2>Season: {currentSeason} </h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        getRowId={(row) => row.team}
      />
    </Container>
  );
}