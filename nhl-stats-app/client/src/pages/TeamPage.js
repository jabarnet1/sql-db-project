// TeamPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TeamPage = () => {
  const { team_id } = useParams();
  const [teamInfo, setTeamInfo] = useState(null);
  const [standings, setStandings] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const infoRes = await fetch(`http://localhost:8080/teams/${team_id}`);
        const infoData = await infoRes.json();
        setTeamInfo(infoData);
  
        const standingsRes = await fetch(`http://localhost:8080/standings?season=20192020`);
        const standingsData = await standingsRes.json();
        const thisTeamStanding = standingsData.find(t => t.team_id === Number(team_id)); // ← FIXED
        setStandings(thisTeamStanding);
  
        //const metricsRes = await fetch(`http://localhost:8080/team-performance?season=20192020`);
        //const metricsData = await metricsRes.json();
        //const thisTeamMetrics = metricsData.find(m => m.team_name === infoData.teamname); OG version
        //const thisTeamMetrics = metricsData.find(
        //    m => m.team_name.toLowerCase() === infoData.teamname.toLowerCase()
        //  ); searching by name version
        //const thisTeamMetrics = metricsData.find(
        //    m => parseInt(m.team_id) === parseInt(team_id)
        //  ); //searching by team_id version
        //setMetrics(thisTeamMetrics);
      } catch (err) {
        console.error('Error fetching team data:', err);
      }
    };
  
    fetchTeamData();
  }, [team_id]);

  if (!teamInfo) return <div>Loading team info...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{teamInfo.teamname}</h1>
      <p><strong>Short name:</strong> {teamInfo.shortname}</p>

      {standings && (
        <>
          <h2>Standings</h2>
          <p>Games Played: {standings.games_played}</p>
          <p>Wins: {standings.wins}</p>
          <p>Losses: {standings.losses}</p>
          <p>OT Losses: {standings.ot_losses}</p>
          <p>Points: {standings.points}</p>
          <p>Goal Differential: {standings.plus_minus}</p>
        </>
      )}

      {metrics && (
        <>
          <h2>Performance Metrics</h2>
          <p>Shooting %: {metrics.shooting_percentage}</p>
          <p>Winning %: {metrics.winning_percentage}</p>
          <p>Total Goals: {metrics.total_goals}</p>
          <p>Total Shots: {metrics.total_shots}</p>
        </>
      )}
    </div>
  );
};

export default TeamPage;
