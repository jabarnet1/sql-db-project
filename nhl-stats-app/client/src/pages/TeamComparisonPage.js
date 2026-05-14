import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000"; // Change if needed

const TeamComparisonPage = () => {
  const [searchParams] = useSearchParams();
  const team1_id = searchParams.get("team1_id");
  const team2_id = searchParams.get("team2_id");

  const [headToHeadData, setHeadToHeadData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!team1_id || !team2_id) {
        setError("Missing team information.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/teamheadtohead?team1_id=${team1_id}&team2_id=${team2_id}`);
        const data = await res.json();

        if (data.error) {
          setError("Something went wrong: " + data.error);
        } else if (!data.games || !data.team1_name || !data.team2_name) {
          setError("Invalid data format.");
        } else {
          setHeadToHeadData(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch data.");
      }
    };

    fetchData();
  }, [team1_id, team2_id]);

  if (error) return <div>{error}</div>;
  if (!headToHeadData) return <div>Loading...</div>;

  return (
    <div>
      <h2>{headToHeadData.team1_name} vs {headToHeadData.team2_name}</h2>
      <p>Number of games: {headToHeadData.games.length}</p>
      {/* Add more detailed game info display here */}
    </div>
  );
};

export default TeamComparisonPage;