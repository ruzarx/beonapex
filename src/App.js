import React, { useState, useEffect } from "react";
import { Container, Select, MenuItem, FormControlLabel, Switch, Tabs, Tab, Box } from "@mui/material";
import raceData from "./data/data.json";
import RaceResultsTable from "./components/RaceResultsTable";
import QualResultsTable from "./components/QualResultsTable";
import FantasyPointsTable from "./components/FantasyPointsTable";
import OverviewTable from "./components/OverviewTable";


const trackName = "Phoenix Raceway"; // Placeholder for track name
const groupsOrder = ["I", "I-II", "II", "III", "IV"]

const App = () => {
  const [useStarGroup, setUseStarGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("I-II");
  const [groups, setGroups] = useState(["I-II", "III", "IV"]);
  const [drivers, setDrivers] = useState([]);
  const [raceDates, setRaceDates] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const groupType = useStarGroup ? "star_group" : "open_group";
    const extractedGroups = [...new Set(raceData.map((entry) => entry[groupType]))].filter(Boolean);
    extractedGroups.sort((a, b) => groupsOrder.indexOf(a) - groupsOrder.indexOf(b));
    setGroups(extractedGroups);
    setSelectedGroup(useStarGroup ? "I" : "I-II"); // Reset selection when switching modes
  }, [useStarGroup]);

  useEffect(() => {
    if (selectedGroup) {
      const groupType = useStarGroup ? "star_group" : "open_group";

      // Extract races for selected track from 2021 onward
      const trackRaces = raceData
        .filter((entry) => entry.track_name === trackName && entry.season_year >= 2021)
        .map((entry) => ({ season: entry.season_year, race_date: entry.race_date }));

      // Sort chronologically
      trackRaces.sort((a, b) => new Date(b.race_date) - new Date(a.race_date));

      // Extract unique race dates
      setRaceDates([...new Set(trackRaces.map((race) => race.race_date))]);

      // Extract unique drivers for selected group
      const groupDrivers = [...new Set(
        raceData
          .filter((entry) => entry[groupType] === selectedGroup)
          .map((entry) => entry.driver_name)
      )];
      setDrivers(groupDrivers);
    }
  }, [selectedGroup, useStarGroup]);

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <h1>BOE NASCAR Fantasy 69XL/R34 - {trackName}</h1>

      {/* 🔹 Toggle between Open and Star groups */}
      <FormControlLabel
        control={<Switch checked={useStarGroup} onChange={() => setUseStarGroup(!useStarGroup)} />}
        label={useStarGroup ? "Star Groups" : "Open Groups"}
        sx={{ mb: 2 }}
      />

      {/* Group Selector */}
      <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} displayEmpty sx={{ mb: 3, minWidth: 200 }}>
        <MenuItem value="">Select a {useStarGroup ? "Star" : "Open"} Group</MenuItem>
        {groups.map((group, index) => (
          <MenuItem key={index} value={group}>{group}</MenuItem>
        ))}
      </Select>

      {/* 🔹 Tabs (Only Show If a Group Is Selected) */}
      {selectedGroup && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={selectedTab} onChange={(event, newValue) => setSelectedTab(newValue)} centered>
            <Tab label="Overview" />
            <Tab label="Race Finish Results" />
            <Tab label="Race Start Stats" />
            <Tab label="Fantasy Points" />
            <Tab label="Driver Rating" />
          </Tabs>
        </Box>
      )}

      {/* 🔹 Render the Correct Table Based on Selected Tab */}
      {selectedGroup && drivers.length > 0 && raceDates.length > 0 && (
        <>
          {selectedTab === 0 && <OverviewTable group={selectedGroup} drivers={drivers} raceDates={raceDates} track={trackName} useStar={useStarGroup}/>}
          {selectedTab === 1 && <RaceResultsTable group={selectedGroup} drivers={drivers} raceDates={raceDates} track={trackName} useStar={useStarGroup}/>}
          {selectedTab === 2 && <QualResultsTable group={selectedGroup} drivers={drivers} raceDates={raceDates} track={trackName} useStar={useStarGroup}/>}
          {selectedTab === 3 && <FantasyPointsTable group={selectedGroup} drivers={drivers} raceDates={raceDates} track={trackName} useStar={useStarGroup}/>}
          {selectedTab === 4 && <p>Driver Rating Table (To be implemented)</p>}
        </>
      )}
    </Container>
  );
};

export default App;
