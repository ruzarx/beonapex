import React, { useState } from "react";
import racesData from "../../data/calendar.json";
import nextRaceData from "../../data/next_race_data.json";
import RaceSelector from "../../components/stats/RaceSelector";
import SeasonStandings from "./SeasonStandings";
import PlayoffStandings from "./PlayoffStandings";
import StandingsDriverDrawer from "./StandingsDriverDrawer"; // ✅ Add this import

import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

const drawerWidth = 240;
const collapsedWidth = 64;

const StandingsPage = (themeMode) => {
  const initialRaceNumber = nextRaceData["next_race_number"] - 1;
  const initialSeasonYear =
    nextRaceData["next_race_number"] <= 36
      ? nextRaceData["next_race_season"]
      : nextRaceData["next_race_season"] - 1;

  const [currentRace, setCurrentRace] = useState(initialRaceNumber);
  const [seasonYear, setSeasonYear] = useState(initialSeasonYear);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [viewMode, setViewMode] = useState("regular");

  const handleDriverClick = (driverName) => {
    setSelectedDriver(driverName);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedDriver(null);
    setDrawerOpen(false);
  };

  const handleViewToggle = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleRaceSelect = (race) => {
    setCurrentRace(race.race_number);
    setSeasonYear(new Date(race.race_date).getFullYear());
  };

  const handleSeasonToggle = (event, newSeason) => {
    if (newSeason !== null) {
      setSeasonYear(newSeason);
      setCurrentRace(36); // optional: reset to latest/full season race
    }
  };

  const filteredRaces = racesData.filter(
    (race) => race.season_year === seasonYear
  );

  return (
    <Box sx={{ display: "flex" }}>
      <RaceSelector
        races={filteredRaces}
        currentRace={currentRace}
        onSelect={handleRaceSelect}
        open={drawerOpen}
        onToggle={() => setDrawerOpen((prev) => !prev)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: drawerOpen ? `${drawerWidth}px` : `${collapsedWidth}px`,
          transition: "margin 0.3s ease",
          padding: 2,
        }}
      >
        {/* Toggle Season Selector */}
        <ToggleButtonGroup
          color="primary"
          value={seasonYear}
          exclusive
          onChange={handleSeasonToggle}
          sx={{ mb: 2 }}
        >
          {[2024, 2025].map((year) => (
            <ToggleButton key={year} value={year}>
              {year}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <ToggleButtonGroup
          color="secondary"
          value={viewMode}
          exclusive
          onChange={handleViewToggle}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="regular">Regular Season</ToggleButton>
          <ToggleButton value="playoffs">Playoffs</ToggleButton>
        </ToggleButtonGroup>

        {viewMode === "regular" && (
          <SeasonStandings
            seasonYear={seasonYear}
            currentRace={currentRace}
            themeMode={themeMode}
            onDriverClick={handleDriverClick}
          />
        )}
        {viewMode === "playoffs" && (
          <PlayoffStandings
            seasonYear={seasonYear}
            currentRace={currentRace}
            themeMode={themeMode}
            onDriverClick={handleDriverClick} // Optional: if you want drawer from playoff too
          />
        )}
      </Box>

      {/* ✅ Add the driver drawer here */}
      <StandingsDriverDrawer
        driver={selectedDriver}
        open={drawerOpen}
        onClose={handleDrawerClose}
        seasonYear={seasonYear}
        currentRace={currentRace}
      />
    </Box>
  );
};

export default StandingsPage;
