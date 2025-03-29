import React, { useState } from "react";
import {
  Box, Typography, Tabs, Tab, ToggleButton, ToggleButtonGroup, Chip
} from "@mui/material";

import racesData from "../../data/calendar.json";
import nextRaceData from "../../data/next_race_data.json";

import RaceSelector from "./RaceSelector";
import StandingsPage from "./StandingsPage";
import RaceResults from "./RaceResults";
import StandingsDriverDrawer from "./StandingsDriverDrawer";
import ResultsDriverDrawer from "./ResultsDrawer";


const drawerWidth = 240;
const collapsedWidth = 64;

const StatisticsScreen = (themeMode) => {
  const [selectedTab, setSelectedTab] = useState("standings");

  const allSeasons = Array.from(new Set(racesData.map(r => r.season_year))).sort();

  const getLatestRaceNumber = (year) => {
    const today = new Date();
    const seasonRaces = racesData.filter((r) => (r.season_year === year && new Date(r.race_date) <= today));
    return Math.max(...seasonRaces.map((r) => r.race_number));
  };
  
  const initialSeasonYear =
  nextRaceData["next_race_number"] <= 36
  ? nextRaceData["next_race_season"]
  : nextRaceData["next_race_season"] - 1;
  const initialRaceNumber = getLatestRaceNumber(initialSeasonYear);

  const [currentRace, setCurrentRace] = useState(initialRaceNumber);
  const [seasonYear, setSeasonYear] = useState(initialSeasonYear);
  const [raceSelectorOpen, setRaceSelectorOpen] = useState(false);
  const [driverDrawerOpen, setDriverDrawerOpen] = useState(false);

  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleRaceSelect = (race) => {
    setCurrentRace(race.race_number);
    setSeasonYear(new Date(race.race_date).getFullYear());
  };

  const handleDriverClick = (driverName) => {
    setSelectedDriver(driverName);
    setDriverDrawerOpen(true);
  };
  
  const handleDrawerClose = () => {
    setDriverDrawerOpen(false);
    setSelectedDriver(null);
  };
  

  const filteredRaces = racesData.filter(
    (race) => race.season_year === seasonYear
  );

  const currentRaceInfo = racesData.find(
    (r) => r.season_year === seasonYear && r.race_number === currentRace
  );
  
  const currentRaceName = currentRaceInfo?.race_name || "Race";

  const formatDate = (rawDate) => {
    const d = new Date(rawDate);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  
  const raceChipLabel = currentRaceInfo
    ? `Race ${currentRaceInfo.race_number}: ${currentRaceInfo.race_name} (${formatDate(currentRaceInfo.race_date)})`
    : "Race Info";
  

  return (
    <Box sx={{ display: "flex" }}>
      {/* Shared Race Selector */}
      <RaceSelector
        races={filteredRaces}
        currentRace={currentRace}
        onSelect={handleRaceSelect}
        open={raceSelectorOpen}
        onToggle={() => setRaceSelectorOpen((prev) => !prev)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: raceSelectorOpen ? `${drawerWidth}px` : `${collapsedWidth}px`,
          transition: "margin 0.3s ease",
          padding: 2,
        }}
      >
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Standings" value="standings" />
          <Tab label="Results" value="results" />
          <Tab label="Stats" value="drivers" />
          <Tab label="Track" value="tracks" />
        </Tabs>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            flexWrap: "wrap",
            gap: 2
          }}
        >
          <ToggleButtonGroup
            color="primary"
            value={seasonYear}
            exclusive
            onChange={(e, newSeason) => {
              if (newSeason !== null) {
                setSeasonYear(newSeason);
                setCurrentRace(getLatestRaceNumber(newSeason));
              }
            }}
          >
            {[2024, 2025].map((year) => (
              <ToggleButton key={year} value={year}>
                {year}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Chip
            label={raceChipLabel}
            color="info"
            variant="outlined"
            sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
            size="medium"
          />
        </Box>



        <Box sx={{ mt: 3 }}>
          {selectedTab === "standings" && (
            <StandingsPage
              seasonYear={seasonYear}
              currentRace={currentRace}
              themeMode={themeMode}
              onDriverClick={handleDriverClick}
              onSeasonChange={setSeasonYear}
            />
          )}
          {selectedTab === "results" && (
            <RaceResults
              seasonYear={seasonYear}
              currentRace={currentRace}
              themeMode={themeMode}
              onDriverClick={handleDriverClick}
            />
          )}
          {selectedTab === "tracks" && (
            <Typography>Track statistics will be displayed here</Typography>
          )}
        </Box>
      </Box>

      {selectedTab === "standings" && (
        <StandingsDriverDrawer
          driver={selectedDriver}
          open={driverDrawerOpen}
          onClose={handleDrawerClose}
          seasonYear={seasonYear}
          currentRace={currentRace}
        />
      )}

      {selectedTab === "results" && (
        <ResultsDriverDrawer
          driver={selectedDriver}
          open={driverDrawerOpen}
          onClose={handleDrawerClose}
          seasonYear={seasonYear}
          currentRace={currentRace}
          raceName={currentRaceInfo.race_name}
        />
      )}

    </Box>
  );
};

export default StatisticsScreen;
