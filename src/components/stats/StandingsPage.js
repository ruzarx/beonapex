import React, { useState } from "react";
import racesData from "../../data/calendar.json";
import nextRaceData from "../../data/next_race_data.json";
import RaceSelector from "../../components/stats/RaceSelector";
import Standings from "../../components/stats/Standings";
import { Box } from "@mui/material";

const drawerWidth = 240;
const collapsedWidth = 64;

const StandingsPage = () => {
  const initialRaceNumber = nextRaceData["next_race_number"] - 1;
  const initialSeasonYear =
    nextRaceData["next_race_number"] <= 36
      ? nextRaceData["next_race_season"]
      : nextRaceData["next_race_season"] - 1;

  const [currentRace, setCurrentRace] = useState(initialRaceNumber);
  const [seasonYear, setSeasonYear] = useState(initialSeasonYear);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRaceSelect = (race) => {
    setCurrentRace(race.race_number);
    setSeasonYear(new Date(race.race_date).getFullYear());
  };

  return (
    <Box sx={{ display: "flex" }}>
      <RaceSelector
        races={racesData}
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
        <Standings seasonYear={seasonYear} currentRace={currentRace} />
      </Box>
    </Box>
  );
};

export default StandingsPage;
