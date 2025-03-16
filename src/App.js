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
import { motion } from "framer-motion";
// import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import raceData from "./data/data.json";
import nextRaceData from "./data/next_race_data.json";
import trackSimilarity from "./data/track_similarity.json";
import OverviewTable from "./components/driver_tables/OverviewTable";
import DriverPerformanceChart from "./components/driver_tables/DriverPerformanceChart";
import DriverFantasyTable from "./components/driver_tables/DriverFantasyTable";
import TeamFantasyTable from "./components/team_tables/TeamFantasyTable";

const nextRaceTrack = nextRaceData["next_race_track"];
const groupsOrder = ["I", "I-II", "II", "III", "IV"];

const App = () => {
  const [useStarGroup, setUseStarGroup] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("I-II");
  const [groups, setGroups] = useState(["I-II", "III", "IV"]);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
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

      const groupTeams = [
        ...new Set(
          raceData
            .filter((entry) => (entry.season_year === 2025) && (entry.team_name !== 'unknown'))
            .map((entry) => entry.team_name)
        ),
      ];
      setTeams(groupTeams);
    }
  }, [selectedGroup, useStarGroup]);

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      {/* <h1>BOE NASCAR Fantasy 69XL/R34</h1> */}
      <h2>{nextRaceTrack}</h2>

      <Box sx={{ mt: 2 }}>
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
          sx={{ mb: 2, minWidth: 200 }}
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
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => setSelectedTab(newValue)}
            centered
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "primary.main", height: 2 },
              "& .MuiTab-root": { minHeight: 36, padding: "6px 12px", fontSize: "0.875rem" }
            }}
          >
            {/* <Tab icon={<DashboardIcon fontSize="small" />} label="Overview" /> */}
            <Tab icon={<PeopleIcon fontSize="small" />} label="Driver Stats" />
          <Tab icon={<GroupsIcon fontSize="small" />} label="Team Stats" />
          <Tab icon={<TrendingUpIcon fontSize="small" />} label="Driver Performance" />
          </Tabs>
          </motion.div>
        </Box>
      )}

      {selectedTab === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ToggleButtonGroup
            value={selectedTable}
            exclusive
            onChange={(event, newType) =>
              newType !== null && setSelectedTable(newType)
            }
            aria-label="table type"
          >
            <ToggleButton value="overview">Overview</ToggleButton>  
            <ToggleButton value="finish">Finish Position</ToggleButton>
            <ToggleButton value="start">Qualification Position</ToggleButton>
            <ToggleButton value="points">Fantasy Points</ToggleButton>
            <ToggleButton value="rating">Rating</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {selectedTab === 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
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

      {selectedGroup && drivers.length > 0 && raceDates.length > 0 && (
        <>
          {/* {selectedTab === 0 && (
            <OverviewTable drivers={drivers} raceDates={raceDates} />
          )} */}
          {selectedTab === 0 &&
            selectedGroup &&
            drivers.length > 0 &&
            raceDates.length > 0 && (
              <>
                {selectedTable === "overview" && (
                  <OverviewTable drivers={drivers} raceDates={raceDates} />
                )}
                {selectedTable === "finish" && (
                  <DriverFantasyTable
                    drivers={drivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    feature={"race_pos"}
                    name={"Finish Position"}
                  />
                )}
                {selectedTable === "start" && (
                  <DriverFantasyTable
                    drivers={drivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    feature={"quali_pos"}
                    name={"Qualification Position"}
                  />
                )}
                {selectedTable === "points" && (
                  <DriverFantasyTable
                    drivers={drivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    feature={"fantasy_points"}
                    name={"Fantasy Points"}
                />
                )}
                {selectedTable === "rating" && (
                  <DriverFantasyTable
                    drivers={drivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    feature={"driver_rating"}
                    name={"Rating"}
                />
                )}
              </>
            )}
          {selectedTab === 1 &&
            teams.length > 0 &&
            raceDates.length > 0 && (
              <>
                {selectedTable === "finish" && (
                  <TeamFantasyTable
                    teams={teams}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    feature={"race_pos"}
                    name={"Finish Position"}
                  />
                )}
                {selectedTable === "start" && (
                  <TeamFantasyTable
                    teams={teams}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    feature={"quali_pos"}
                    name={"Qualification Position"}
                  />
                )}
                {selectedTable === "points" && (
                  <TeamFantasyTable
                    teams={teams}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    feature={"fantasy_points"}
                    name={"Fantasy Points"}
                  />
                )}
                {selectedTable === "rating" && (
                  <TeamFantasyTable
                    teams={teams}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    feature={"driver_rating"}
                    name={"Rating"}
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
