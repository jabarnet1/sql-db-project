import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  Autocomplete,
  CircularProgress,
  Box
} from '@mui/material';

const config = require('../config.json');
const API_BASE_URL = `http://${config.server_host}:${config.server_port}`;

/**
 * Reusable search component for NHL players and teams
 * 
 * @param {boolean} isPlayerSearch - Whether to search for players (true) or teams (false)
 * @param {boolean} allowTypeSwitch - Whether to display radio buttons to switch between player/team search
 * @param {function} onSelectionChange - Callback when selection changes, receives { id, label, type }
 * @param {function} onSearchTypeChange - Callback when search type changes (player/team)
 * @param {string} placeholder - Custom placeholder text
 * @param {boolean} fullWidth - Whether the search bar should take full width
 * @param {string} helperText - Custom helper text to display
 */
const SearchBar = ({ 
  isPlayerSearch = true, 
  allowTypeSwitch = true,
  onSelectionChange = () => {},
  onSearchTypeChange = () => {},
  placeholder,
  fullWidth = true,
  helperText
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState(isPlayerSearch ? 'player' : 'team');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Update internal search type when prop changes
  useEffect(() => {
    setSearchType(isPlayerSearch ? 'player' : 'team');
  }, [isPlayerSearch]);

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setLoadingSuggestions(true);
      try {
        const isSearchingForPlayer = searchType === 'player';
        const endpoint = isSearchingForPlayer 
          ? `${API_BASE_URL}/search/players?name=${encodeURIComponent(searchTerm)}`
          : `${API_BASE_URL}/search/teams?name=${encodeURIComponent(searchTerm)}`;
        
        console.log('Fetching suggestions from:', endpoint);
        const response = await axios.get(endpoint);
        
        if (isSearchingForPlayer) {
          setSuggestions(response.data.map(player => ({
            label: `${player.firstname} ${player.lastname}`,
            id: player.player_id,
            type: 'player',
            data: player
          })));
        } else {
          setSuggestions(response.data.map(team => ({
            label: team.teamname,
            id: team.team_id,
            type: 'team',
            data: team
          })));
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchType]);

  // Reset search when switching between player and team
  useEffect(() => {
    setSearchTerm('');
    setSelectedOption(null);
    setSuggestions([]);
  }, [searchType]);

  const handleSearchTypeChange = (e) => {
    const newType = e.target.value;
    setSearchType(newType);
    onSearchTypeChange(newType === 'player');
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedOption(newValue);
    setSearchTerm(newValue ? newValue.label : '');
    onSelectionChange(newValue);
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {allowTypeSwitch && (
        <RadioGroup
          row
          value={searchType}
          onChange={handleSearchTypeChange}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="player" control={<Radio />} label="Player" />
          <FormControlLabel value="team" control={<Radio />} label="Team" />
        </RadioGroup>
      )}

      <Autocomplete
        options={suggestions}
        loading={loadingSuggestions}
        filterOptions={(x) => x}
        value={selectedOption}
        onChange={handleSelectionChange}
        onInputChange={(event, newInputValue) => {
          setSearchTerm(newInputValue);
        }}
        noOptionsText={
          searchTerm.length < 2 
            ? "Type at least 2 characters..." 
            : "No options found"
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={placeholder || (searchType === 'player' ? "Player Name" : "Team Name")}
            fullWidth={fullWidth}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            helperText={helperText || (searchType === 'player' ? "Select a player from the dropdown for best results" : null)}
          />
        )}
      />
    </Box>
  );
};

export default SearchBar; 