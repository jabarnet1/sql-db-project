import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper
} from '@mui/material';

const config = require('../config.json');

const PlayerShootingHeatmap = ({ playerId, seasons }) => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const svgRef = useRef();
  
  const formatSeason = (season) => {
    const seasonStr = typeof season === 'string' ? season : JSON.stringify(season);
    return seasonStr.length === 8 
      ? `${seasonStr.slice(0, 4)}-${seasonStr.slice(4)}`
      : seasonStr;
  };
  
  
  const getAvailableSeasons = () => {
    if (!seasons || !seasons.length) return [];
    
    return [...new Set(seasons.map(s => s.season))]
      .sort((a, b) => b - a); // Sort in descending order
  };
  
 
  const getMostRecentSeason = () => {
    const availableSeasons = getAvailableSeasons();
    return availableSeasons.length > 0 ? availableSeasons[0] : null;
  };
  
  
  React.useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeason) {
      setSelectedSeason(getMostRecentSeason());
    }
  }, [seasons]);
  
  
  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value);
    setHeatmapData(null); 
  };

  
  useEffect(() => {
    if (playerId && selectedSeason) {
      const apiUrl = `http://${config.server_host}:${config.server_port}/players/${playerId}/heatmap?season=${selectedSeason}`;
      console.log(`Fetching heatmap data from: ${apiUrl}`);
      
      fetch(apiUrl)
        .then(res => {
          console.log("Heatmap response status:", res.status);
          if (!res.ok) {
            throw new Error(`Server returned ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("Heatmap data received:", data);
          if (data.length === 0) {
            console.log("No heatmap data found for this player/season combination");
          }
          setHeatmapData(data);
        })
        .catch(err => {
          console.error('Error fetching heatmap data:', err);
          setHeatmapData([]);  // Set empty array to show "no data" state
        });
    }
  }, [playerId, selectedSeason]);

  // Draw heatmap when data changes
  useEffect(() => {
    if (heatmapData && heatmapData.length > 0) {
      console.log(`Drawing heatmap with ${heatmapData.length} data points`);
      drawHeatmap();
    }
  }, [heatmapData]);

  // Transform coordinates to fold the rink to a single offensive zone perspective
  const transformCoordinates = (data) => {
    return data.map(d => {
      const transformed = { ...d };
      
      if (d.x_coord < 0) {
        transformed.x_coord = -d.x_coord;
        transformed.y_coord = -d.y_coord;
      }
      
      return transformed;
    });
  };

  const drawHeatmap = () => {
    if (!heatmapData || heatmapData.length === 0) {
      console.log("No heatmap data to draw");
      return;
    }

    // Transform data to fold the rink
    const foldedData = transformCoordinates(heatmapData);

    const margin = { top: 40, right: 80, bottom: 50, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Rink dimensions in NHL are 200x85 feet, but we're only showing the offensive zone (100x85)
    // For the folded view, we only need the offensive half (positive x values)
    const rinkWidth = 100;  
    const rinkHeight = 85;  
    
    // Scale x from 0 to 100 (offensive zone only)
    const xScale = d3.scaleLinear()
      .domain([0, rinkWidth])
      .range([0, width]);
    
    // Scale y from -42.5 to 42.5 (full rink width)
    const yScale = d3.scaleLinear()
      .domain([-rinkHeight/2, rinkHeight/2])
      .range([height, 0]);

    const maxShots = d3.max(foldedData, d => +d.shot_count);
    const colorScale = d3.scaleSequential()
      .domain([0, maxShots])
      .interpolator(d3.interpolateInferno);

    const hexbinGenerator = hexbin()
      .x(d => xScale(d.x_coord))
      .y(d => yScale(d.y_coord))
      .radius(10)
      .extent([[0, 0], [width, height]]);

    
    const points = foldedData.flatMap(d => 
      Array(+d.shot_count).fill({
        x_coord: d.x_coord,
        y_coord: d.y_coord,
        event_type: d.event_type
      })
    );

    
    svg.append("g")
      .selectAll("path")
      .data(hexbinGenerator(points))
      .enter().append("path")
      .attr("d", hexbinGenerator.hexagon())
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("fill", d => colorScale(d.length))
      .attr("stroke", "#000")
      .attr("stroke-width", "0.5")
      .append("title")  
      .text(d => `${d.length} shots in this area`);

    
    svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", "2");
      
    
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
      
    // Draw goal line (typically 11 feet from the boards)

    const goalLineX = xScale(89);  // 100 - 11 = 89
    svg.append("line")
      .attr("x1", goalLineX)
      .attr("y1", 0)
      .attr("x2", goalLineX)
      .attr("y2", height)
      .attr("stroke", "red")
      .attr("stroke-width", 1);
      
    // Draw net (6 feet wide, centered)
    const netWidth = 6;
    const netHeight = 4;  // Approx depth of net
    
    
    const creaseRadius = 6;
    
    
    const creaseArc = d3.arc()
      .innerRadius(0)
      .outerRadius(xScale(creaseRadius) - goalLineX)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);
    
    svg.append("path")
      .attr("d", creaseArc())
      .attr("transform", `translate(${goalLineX}, ${yScale(0)})`)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1);
    
    
    const postRadius = 2;
    svg.append("circle")
      .attr("cx", goalLineX)
      .attr("cy", yScale(netWidth/2))
      .attr("r", postRadius)
      .attr("fill", "red");
      
    svg.append("circle")
      .attr("cx", goalLineX)
      .attr("cy", yScale(-netWidth/2))
      .attr("r", postRadius)
      .attr("fill", "red");
    
    
    svg.append("rect")
      .attr("x", goalLineX)
      .attr("y", yScale(netWidth/2))
      .attr("width", xScale(netHeight) - xScale(0))
      .attr("height", yScale(-netWidth/2) - yScale(netWidth/2))
      .attr("fill", "rgba(0, 0, 0, 0.1)")
      .attr("stroke", "#000")
      .attr("stroke-width", 1);
      
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`Season ${formatSeason(selectedSeason)}`);

    
    const legendWidth = 20;
    const legendHeight = height;
    const legendX = width + 20; 
    
    
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", `heatmap-gradient-${playerId}-${selectedSeason}`)
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
      
    
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = i / numStops;
      gradient.append("stop")
        .attr("offset", `${offset * 100}%`)
        .attr("stop-color", colorScale(maxShots * offset));
    }
    
    
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", `url(#heatmap-gradient-${playerId}-${selectedSeason})`);
      
    
    const legendScale = d3.scaleLinear()
      .domain([0, maxShots])
      .range([legendHeight, 0]);
      
    const legendAxis = d3.axisRight(legendScale)
      .ticks(4);  
      
    svg.append("g")
      .attr("transform", `translate(${legendX + legendWidth}, 0)`)
      .call(legendAxis);
      
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", legendX + legendWidth + 40) 
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Shot Count");
      
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Offensive zone view (shots from both ends combined)");
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Shooting Heatmap
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth sx={{ minWidth: 200 }}>
          <InputLabel>Season</InputLabel>
          <Select
            value={selectedSeason || ''}
            label="Season"
            onChange={handleSeasonChange}
            displayEmpty={!selectedSeason}
          >
            {selectedSeason === null && (
              <MenuItem disabled value="">
                <em>Select a season</em>
              </MenuItem>
            )}
            {getAvailableSeasons().map((season) => (
              <MenuItem key={season} value={season}>
                {formatSeason(season)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
        {heatmapData === null ? (
          <p>Loading shot data...</p>
        ) : heatmapData.length === 0 ? (
          <div>
            <p>No shot data available for this player in {formatSeason(selectedSeason)}.</p>
          </div>
        ) : (
          <svg ref={svgRef}></svg>
        )}
      </Box>
    </Box>
  );
};

export default PlayerShootingHeatmap;
