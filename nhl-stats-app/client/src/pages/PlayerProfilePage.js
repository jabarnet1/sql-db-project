import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import { deepOrange, deepPurple } from '@mui/material/colors';
import { DataGrid } from '@mui/x-data-grid';
import PlayerShootingHeatmap from '../components/PlayerShootingHeatmap';

const config = require('../config.json');


export default function PlayerProfilePage() {
  const { pid } = useParams(); 
  const [profileData, setProfile] = useState(null);

  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
    console.log("Season selected:", event.target.value);
  };

  const handleRowClick = (params) => {
    const team_Id = params.row.team;
    navigate(`/teams/${team_Id}/roster`);
    console.log(team_Id);
  };

  function formatSeason(ufs) {
    let ufseason = JSON.parse(ufs) + "";
    return ufseason.slice(0,4) + "-" + ufseason.slice(4);
  }

  useEffect(() => {
    if (pid) {
      fetch(`http://${config.server_host}:${config.server_port}/players/${pid}/profile`)
        .then((res) => res.json())
        .then((resJson) => {
          console.log("Fetched profile:", resJson);
          setProfile(resJson);
        })
        .catch((err) => console.error("Error fetching player profile:", err));
    }
  }, [pid]);

  return (
    <> 
    <Container>
        <h1></h1>
        

        {profileData ? (
          <>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>{profileData.profile.firstname[0]}{profileData.profile.lastname[0]}</Avatar>
            <h1 style={{ fontSize: 16 }}>First Name: {profileData.profile.firstname}</h1>
            <h1 style={{ fontSize: 16 }}>Last Name: {profileData.profile.lastname}</h1>
            <h1 style={{ fontSize: 16 }}>Nationality: {profileData.profile.nationality}</h1>
            <h1 style={{ fontSize: 16 }}>Birth City: {profileData.profile.birthcity}</h1>
            <h1 style={{ fontSize: 16 }}>Primary Position: {profileData.profile.primaryposition}</h1>
            <h1 style={{ fontSize: 16 }}>Birthdate: {profileData.profile.birthdate}</h1>
            <h1 style={{ fontSize: 16 }}>Height: {profileData.profile.height}</h1>
            <h1 style={{ fontSize: 16 }}>Height (cm): {profileData.profile.height_cm}</h1>
            <h1 style={{ fontSize: 16 }}>Weight: {profileData.profile.weight}</h1>
            <h1 style={{ fontSize: 16 }}>Shot: {profileData.profile.shootscatches}</h1>


            <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Games Played</th>
                  <th>Goals</th>
                  <th>Assists</th>
                  <th>Points</th>
                  <th>Shots</th>
                  <th>Shooting Percentage</th>
                  <th>Avg Time on Ice</th>
                </tr>
              </thead>
              <tbody>
                {profileData.seasons.map((season, index) => (
                  <tr key={index}>
                    <td>
                        {formatSeason(season.season)}
                      </td>
                    <td>{season.games_played}</td>
                    <td>{season.goals}</td>
                    <td>{season.assists}</td>
                    <td>{season.points}</td>
                    <td>{season.shots}</td>
                    <td>{season.shooting_percentage}%</td>
                    <td>{Math.round(season.avg_time_on_ice/60)} min </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add the shooting heatmap visualization */}
            <div style={{ marginTop: '2rem' }}>
              <PlayerShootingHeatmap 
                playerId={pid} 
                seasons={profileData.seasons}
              />
            </div>
          </>

          

        ) : (
          <h2>Loading player profile...</h2>
        )}
      </Container>
    </>
  );
}
