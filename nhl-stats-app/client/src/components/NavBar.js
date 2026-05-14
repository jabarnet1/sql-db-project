// src/components/NavBar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* NHL Logo */}
        <Box
          component="img"
          src="/hockey.png" 
          alt="NHL Logo"
          sx={{ height: 40, marginRight: 2 }}
        />

        {/* Title */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          NHL Stats App
        </Typography>

        {/* Navigation Buttons */}
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/standings">
          Standings
        </Button>
        <Button color="inherit" component={Link} to="/goalsdifference">
          Goal Predictor
        </Button>
      </Toolbar>
    </AppBar>
  );
}
