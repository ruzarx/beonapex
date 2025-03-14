import React, { useState, useEffect } from "react";
import {
  Container,
  Select,
  MenuItem,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  FormControl,
  Radio,
  RadioGroup,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import raceData from "./data/data.json";
import nextRaceData from "./data/next_race_data.json";
import trackSimilarity from "./data/track_similarity.json";
import RaceResultsTable from "./components/RaceResultsTable";
import QualResultsTable from "./components/QualResultsTable";
import FantasyPointsTable from "./components/FantasyPointsTable";
import RatingTable from "./components/RatingTable";
import OverviewTable from "./components/OverviewTable";
import DriverPerformanceChart from "./components/DriverPerformanceChart";

const nextRaceTrack = nextRaceData["next_race_track"];
const groupsOrder = ["I", "I-II", "II", "III", "IV"];

const App = () => {
  const [useStarGroup, setUseStarGroup] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("I-II");
  const [groups, setGroups] = useState(["I-II", "III", "IV"]);
  const [drivers, setDrivers] = useState([]);
  const [raceDates, setRaceDates] = useState([]);
  const [similarRaceDates, setSimilarRaceDates] = useState([]);
  const [allRaceDates, setAllRaceDates] = useState([]);
  const [currentSeasonDates, setCurrentSeasonDates] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTable, setSelectedTable] = useState("finish");

  useEffect(() => {
    const groupType = useStarGroup ? "star_group" : "open_group";
    const extractedGroups = [
      ...new Set(raceData.map((entry) => entry[groupType])),
    ].filter(Boolean);
    extractedGroups.sort(
      (a, b) => groupsOrder.indexOf(a) - groupsOrder.indexOf(b)
    );
    setGroups(extractedGroups);
    setSelectedGroup(useStarGroup ? "I" : "I-II"); // Reset selection when switching modes
  }, [useStarGroup]);

  useEffect(() => {
    if (selectedGroup) {
      const groupType = useStarGroup ? "star_group" : "open_group";

      const trackRaces = raceData
        .filter(
          (entry) =>
            entry.track_name === nextRaceTrack && entry.season_year >= 2022
        )
        .map((entry) => ({
          season: entry.season_year,
          race_date: entry.race_date,
        }));
      trackRaces.sort((a, b) => new Date(b.race_date) - new Date(a.race_date));
      setRaceDates([...new Set(trackRaces.map((race) => race.race_date))]);

      const similarRaces = raceData
        .filter((entry) => {
          const similarTracks = trackSimilarity[nextRaceTrack] || [];
          if (!Array.isArray(similarTracks)) return false;
          return (
            similarTracks.includes(entry.track_name) &&
            entry.season_year >= 2022
          );
        })
        .map((entry) => ({
          season: entry.season_year,
          race_date: entry.race_date,
        }));

      setSimilarRaceDates([
        ...new Set(similarRaces.map((race) => race.race_date)),
      ]);

      const allRaces = raceData
        .filter((entry) => entry.season_year >= 2022)
        .map((entry) => ({
          season: entry.season_year,
          race_date: entry.race_date,
        }));
      setAllRaceDates([...new Set(allRaces.map((race) => race.race_date))]);

      const allSeasonRaces = raceData
        .filter((entry) => entry.season_year === 2025)
        .map((entry) => ({ race_date: entry.race_date }));
      setCurrentSeasonDates([
        ...new Set(allSeasonRaces.map((race) => race.race_date)),
      ]);

      const groupDrivers = [
        ...new Set(
          raceData
            .filter((entry) => entry[groupType] === selectedGroup)
            .map((entry) => entry.driver_name)
        ),
      ];
      setDrivers(groupDrivers);
    }
  }, [selectedGroup, useStarGroup]);

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <h1>BOE NASCAR Fantasy 69XL/R34 - {nextRaceTrack}</h1>

      <Box sx={{ mt: 6 }}>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <RadioGroup
            row
            value={useStarGroup ? "star" : "open"}
            onChange={(event) => setUseStarGroup(event.target.value === "star")}
          >
            <FormControlLabel
              value="star"
              control={<Radio />}
              label="Star Groups"
            />
            <FormControlLabel
              value="open"
              control={<Radio />}
              label="Open Groups"
            />
          </RadioGroup>
        </FormControl>

        {/* Group Selector */}
        <Select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          displayEmpty
          sx={{ mb: 3, minWidth: 200 }}
        >
          <MenuItem value="">
            Select a {useStarGroup ? "Star" : "Open"} Group
          </MenuItem>
          {groups.map((group, index) => (
            <MenuItem key={index} value={group}>
              {group}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* 🔹 Tabs (Only Show If a Group Is Selected) */}
      {selectedGroup && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => setSelectedTab(newValue)}
            centered
          >
            <Tab label="Overview" />
            <Tab label="Driver Stats" />
            <Tab label="Driver Performance" />
          </Tabs>
        </Box>
      )}

      {selectedTab === 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <ToggleButtonGroup
            value={selectedTable}
            exclusive
            onChange={(event, newType) =>
              newType !== null && setSelectedTable(newType)
            }
            aria-label="table type"
          >
            <ToggleButton value="finish">Finish Position</ToggleButton>
            <ToggleButton value="start">Qualification Position</ToggleButton>
            <ToggleButton value="points">Fantasy Points</ToggleButton>
            <ToggleButton value="rating">Rating</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {/* 🔹 Render the Correct Table Based on Selected Tab */}
      {selectedGroup && drivers.length > 0 && raceDates.length > 0 && (
        <>
          {selectedTab === 0 && (
            <OverviewTable drivers={drivers} raceDates={raceDates} />
          )}
          {selectedTab === 1 &&
            selectedGroup &&
            drivers.length > 0 &&
            raceDates.length > 0 && (
              <>
                {selectedTable === "finish" && (
                  <RaceResultsTable
                    drivers={drivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                  />
                )}
                {selectedTable === "start" && (
                  <QualResultsTable
                    drivers={drivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                  />
                )}
                {selectedTable === "points" && (
                  <FantasyPointsTable
                    drivers={drivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                  />
                )}
                {selectedTable === "rating" && (
                  <RatingTable
                    drivers={drivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                  />
                )}
              </>
            )}
          {selectedTab === 2 && (
            <DriverPerformanceChart raceData={raceData} drivers={drivers} />
          )}
        </>
      )}
    </Container>
  );
};

export default App;
