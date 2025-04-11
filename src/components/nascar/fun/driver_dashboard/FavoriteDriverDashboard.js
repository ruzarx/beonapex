// src/components/driver_dashboard/FavoriteDriverDashboard.jsx
import React from "react";
import { Box, Grid } from "@mui/material";
import DriverHeaderCard from "./DriverHeaderCard";
import NextRaceCountdown from "./NextRaceCountdown";
import RecentFormPanel from "./RecentFormPanel";
import TrackHistoryTable from "./TrackHistoryTable";
import QualiRaceStatsCard from "./QualiRaceStatsCard";
import OvertakesCard from "./OvertakesCard";
import DriverProspectsText from "./DriverProspectsText";

import nextRaceData from "../../../../data/next_race_data.json";
import raceData from "../../../../data/data.json";
import standingsData from "../../../../data/standings.json";

const FavoriteDriverDashboard = () => {
  const favoriteDriver = "Ross Chastain";
  const currentSeason = nextRaceData.next_race_season;
  const currentRace = nextRaceData.next_race_number - 1;

  const driverRaces = raceData.filter(
    r => r.driver_name === favoriteDriver && r.season_year <= currentSeason && r.race_number <= currentRace
  );

  const lastRace = driverRaces[driverRaces.length - 1];
  const driverStanding = standingsData.find(
    r => r.driver_name === favoriteDriver && r.season_year === currentSeason && r.race_number === currentRace
  );

  const driverSummary = {
    driver_name: favoriteDriver,
    car_number: lastRace?.car_number,
    team_name: lastRace?.team_name,
    imageUrl: "/images/drivers/ross_chastain.png", // placeholder
    championship_pos: driverStanding?.pos,
    total_points: driverStanding?.season_points,
    total_wins: driverStanding?.season_wins,
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Left Column: Driver Info + Recent Form */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DriverHeaderCard driver={driverSummary} />
            </Grid>
            <Grid item xs={12} md={6}>
              <NextRaceCountdown nextRaceData={nextRaceData} />
            </Grid>
            <Grid item xs={12}>
              <RecentFormPanel />
            </Grid>
          </Grid>
        </Grid>
  
        {/* Right Column: Overtakes full-height */}
        <Grid item xs={12} md={4}>
          <OvertakesCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <QualiRaceStatsCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <DriverProspectsText />
        </Grid>
        <Grid item xs={12} md={4}><TrackHistoryTable /></Grid>
      </Grid>
    </Box>
  );
  
};  

export default FavoriteDriverDashboard;