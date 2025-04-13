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
} from "@mui/material";
import FantasyOverviewTable from "./FantasyOverviewTable";
import FantasyDriverTable from "./FantasyDriverTable";
import { loadJsonData } from "../utils/dataLoader";


const raceData = loadJsonData("data.json");
const entryList = loadJsonData("entry_list.json");
const nextRaceData = loadJsonData("entry_list.json");
const trackSimilarity = loadJsonData("track_similarity.json");

const nextRaceTrack = nextRaceData["next_race_track"];
const groupsOrder = ["I", "I-II", "II", "III", "IV", "All"];
const currentSeason = 2025;
const currentRaceNumber = nextRaceData["next_race_number"] - 1;
const allowedDrivers = entryList[currentSeason.toString()] || [];

const FantasyMainScreen = () => {
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
    const extractedGroups = [
      ...new Set(raceData.map((entry) => entry[groupType])),
    ]
      .filter(Boolean)
      .sort((a, b) => groupsOrder.indexOf(a) - groupsOrder.indexOf(b))
      .filter((g) => g !== "All");
    
    extractedGroups.push("All");
    
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
        .filter((entry) => entry.season_year === currentSeason)
        .map((entry) => ({ race_date: entry.race_date }));
      setCurrentSeasonDates([
        ...new Set(allSeasonRaces.map((race) => race.race_date)),
      ]);

      const allPastSeasonRaces = raceData
        .filter((entry) => entry.season_year === currentSeason - 1 && entry.race_number <= currentRaceNumber) // ✅ Properly closed
        .map((entry) => ({ race_date: entry.race_date }));
      setPastSeasonDates([
        ...new Set(allPastSeasonRaces.map((race) => race.race_date)),
      ]);

      const allGroupDrivers = selectedGroup === "All"
      ? [...new Set(
          raceData
            .map((entry) => entry.driver_name)
            .filter((name) => allowedDrivers.includes(name))
        )]
      : [...new Set(
          raceData
            .filter((entry) => entry[groupType] === selectedGroup)
            .map((entry) => entry.driver_name)
            .filter((name) => allowedDrivers.includes(name))
        )];
      setGroupDrivers(allGroupDrivers);
    }
  }, [selectedGroup, useStarGroup]);

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
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
                  <FantasyOverviewTable
                    groupDrivers={groupDrivers}
                    raceDates={raceDates}
                    currentSeasonDates={currentSeasonDates}
                    pastSeasonDates={pastSeasonDates}
                  />
                )}
                {selectedTable === "finish" && (
                  <FantasyDriverTable
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
                  <FantasyDriverTable
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
                  <FantasyDriverTable
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
                  <FantasyDriverTable
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

export default FantasyMainScreen;
