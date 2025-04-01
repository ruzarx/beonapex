import React, { useState, useEffect } from "react";
import {
  Container,
  Select,
  MenuItem,
  FormControlLabel,
  Box,
  FormControl,
  Radio,
  RadioGroup,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Button,
  Divider,
  Typography
} from "@mui/material";
import raceData from "../../data/data.json";
import entryList from "../../data/entry_list.json";
import nextRaceData from "../../data/next_race_data.json";
import trackSimilarity from "../../data/track_similarity.json";
import OverviewTable from "./OverviewTable";
import DriverFantasyTable from "./DriverFantasyTable";
import GroupSelector from "./GroupSelector";

const nextRaceTrack = nextRaceData["next_race_track"];
const groupsOrder = ["I", "I-II", "II", "III", "IV", "All"];
const currentSeason = 2025;
const currentRaceNumber = nextRaceData["next_race_number"] - 1;
const allowedDrivers = entryList[currentSeason.toString()] || [];

// Move these outside the component as they don't need to be recreated on each render
const getTrackRaces = (minYear = 2022) => 
  raceData
    .filter(entry => entry.track_name === nextRaceTrack && entry.season_year >= minYear)
    .map(entry => entry.race_date);

const getSimilarTrackRaces = (minYear = 2022) => {
  const similarTracks = trackSimilarity[nextRaceTrack] || [];
  return raceData
    .filter(entry => similarTracks.includes(entry.track_name) && entry.season_year >= minYear)
    .map(entry => entry.race_date);
};

const MainFantasyScreen = () => {
  const [useStarGroup, setUseStarGroup] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("I-II");
  const [groups, setGroups] = useState(["I-II", "III", "IV", "All"]);
  const [groupDrivers, setGroupDrivers] = useState([]);
  const [raceDates, setRaceDates] = useState([]);
  const [similarRaceDates, setSimilarRaceDates] = useState([]);
  const [allRaceDates, setAllRaceDates] = useState([]);
  const [pastSeasonDates, setPastSeasonDates] = useState([]);
  const [currentSeasonDates, setCurrentSeasonDates] = useState([]);
  const [selectedTable, setSelectedTable] = useState("finish");

  useEffect(() => {
    const groupType = useStarGroup ? "star_group" : "open_group";
    const extractedGroups = Array.from(new Set(
      raceData
        .map(entry => entry[groupType])
        .filter(Boolean)
    ))
    .sort((a, b) => groupsOrder.indexOf(a) - groupsOrder.indexOf(b))
    .filter(g => g !== "All");
    
    extractedGroups.push("All");
    
    setGroups(extractedGroups);
    setSelectedGroup(useStarGroup ? "I" : "I-II");
  }, [useStarGroup]);

  useEffect(() => {
    if (!selectedGroup) return;

    const groupType = useStarGroup ? "star_group" : "open_group";

    // Use memoized helper functions
    setRaceDates([...new Set(getTrackRaces())]);
    setSimilarRaceDates([...new Set(getSimilarTrackRaces())]);
    
    // Simplified date filtering
    const allRaceDates = raceData
      .filter(entry => entry.season_year >= 2022)
      .map(entry => entry.race_date);
    setAllRaceDates([...new Set(allRaceDates)]);

    const currentSeasonRaces = raceData
      .filter(entry => entry.season_year === currentSeason)
      .map(entry => entry.race_date);
    setCurrentSeasonDates([...new Set(currentSeasonRaces)]);

    const pastSeasonRaces = raceData
      .filter(entry => 
        entry.season_year === currentSeason - 1 && 
        entry.race_number <= currentRaceNumber
      )
      .map(entry => entry.race_date);
    setPastSeasonDates([...new Set(pastSeasonRaces)]);

    // Simplified driver filtering
    const drivers = raceData
      .filter(entry => selectedGroup === "All" || entry[groupType] === selectedGroup)
      .map(entry => entry.driver_name)
      .filter(name => allowedDrivers.includes(name));
    
    setGroupDrivers([...new Set(drivers)]);
  }, [selectedGroup, useStarGroup]);

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <h2>{nextRaceTrack}</h2>

      <Box sx={{ mt: 2, mb: 3 }}>
        <GroupSelector 
          onGroupSelect={(group, isStar) => {
            setSelectedGroup(group);
            setUseStarGroup(isStar);
          }} 
        />
      </Box>

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

      {selectedGroup && groupDrivers.length > 0 && raceDates.length > 0 && (
        <>
          {selectedGroup &&
            groupDrivers.length > 0 &&
            raceDates.length > 0 && (
              <>
                {selectedTable === "overview" && (
                  <OverviewTable
                    groupDrivers={groupDrivers}
                    raceDates={raceDates}
                    currentSeasonDates={currentSeasonDates}
                    pastSeasonDates={pastSeasonDates}
                  />
                )}
                {selectedTable === "finish" && (
                  <DriverFantasyTable
                    groupDrivers={groupDrivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    pastSeasonDates={pastSeasonDates}
                    feature={"race_pos"}
                    name={"Finish Position"}
                  />
                )}
                {selectedTable === "start" && (
                  <DriverFantasyTable
                    groupDrivers={groupDrivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    pastSeasonDates={pastSeasonDates}
                    feature={"quali_pos"}
                    name={"Qualification Position"}
                  />
                )}
                {selectedTable === "points" && (
                  <DriverFantasyTable
                    groupDrivers={groupDrivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    pastSeasonDates={pastSeasonDates}
                    feature={"fantasy_points"}
                    name={"Fantasy Points"}
                  />
                )}
                {selectedTable === "rating" && (
                  <DriverFantasyTable
                    groupDrivers={groupDrivers}
                    raceDates={raceDates}
                    similarRaceDates={similarRaceDates}
                    allRaceDates={allRaceDates}
                    currentSeasonDates={currentSeasonDates}
                    pastSeasonDates={pastSeasonDates}
                    feature={"driver_rating"}
                    name={"Rating"}
                  />
                )}
              </>
            )}
        </>
      )}
    </Container>
  );
};

export default MainFantasyScreen;
