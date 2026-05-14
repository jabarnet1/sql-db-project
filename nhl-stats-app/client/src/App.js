import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
//import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";
import { blueGrey, lightBlue, grey, red } from '@mui/material/colors'; //test
import { useNavigate } from 'react-router-dom'; 


import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage'; 
import StandingsPage from './pages/StandingsPage';
import PlayerProfilePage from "./pages/PlayerProfilePage";
import TeamPageWithRoster from './pages/TeamPageWithRoster'; 
import TeamSeasonPerformance from './pages/TeamSeasonPerformance';
import TeamHeadToHeadPage from './pages/TeamHeadToHeadPage';
import TeamComparisonPage from './pages/TeamComparisonPage';
import TeamHeadToHeadResult from './pages/TeamHeadToHeadResult';
import GoalPredictor from './pages/GoalPredictor'; // MO test apr22
//import AutoSummary from './pages/AutoSummary';



// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
//export const theme = createTheme({
//  palette: {
//    primary: indigo,
//    secondary: amber,
//  },
//});


export const theme = createTheme({
  palette: {
    mode: 'light', // set to light mode for white background
    primary: {
      main: '#041E42', // navy blue (close to NHL/navy color)
    },
    secondary: {
      main: red[500],
    },
    background: {
      default: '#d0d0d0', // slightly off white (cool) background
      paper: '#f7f7f7',    // light grey for cards/panels
    },
    text: {
      primary: '#000000', // black text
      secondary: grey[700],
    },
  },
  typography: {
    fontFamily: `'Roboto Slab', 'Arial', sans-serif`,
    h5: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
    },
  },
});


// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/standings" element={<StandingsPage />} />
          <Route path="/players/:pid/profile" element={<PlayerProfilePage />} />
          <Route path="/teams/:team_id" element={<TeamPageWithRoster />} /> 
          <Route path="/team-performance" element={<TeamSeasonPerformance />} />
          <Route path="/team-head-to-head" element={<TeamHeadToHeadPage />} />
          <Route path="/team-head-to-head/compare" element={<TeamComparisonPage />} /> 
          <Route path="/TeamHeadToHeadResult" element={<TeamHeadToHeadResult />} />
          <Route path="/goalsdifference" element={<GoalPredictor />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}