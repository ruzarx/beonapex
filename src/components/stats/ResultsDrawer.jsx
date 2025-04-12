import {
  Box,
  Drawer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { loadJsonData } from "../../utils/dataLoader";
import { buildStatRow } from "../../utils/driverStats";

const raceResultsData = loadJsonData("data.json");

const ResultsDriverDrawer = ({ driver, open, onClose, seasonYear, currentRace, raceName }) => {
  const allRaces = raceResultsData.filter((r) => r.driver_name === driver);

  // Season races for this driver
  const seasonRaces = allRaces.filter((r) => r.season_year === seasonYear);

  // Current race entry
  const currentRaceEntry = allRaces.find(
    (r) => r.race_number === currentRace && r.season_year === seasonYear
  );

  const seasonRacesWithoutDriver = raceResultsData.filter(
    (r) => r.driver_name !== driver && r.season_year === seasonYear
  );

  const rows = [
    buildStatRow(
      "Finish Position",
      "race_pos",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Qual Position",
      "quali_pos",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Mid Race Position",
      "mid_race_pos",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Avg Running Pos",
      "avg_pos",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Highest Position",
      "highest_pos",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Lowest Position",
      "lowest_pos",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Finish Points",
      "finish_position_points",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Stage Points",
      "stage_points",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Passes Difference",
      "pass_diff",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Green Flag Passes",
      "green_flag_passes",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Green Flag Times Passed",
      "green_flag_times_passed",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Quality Passes",
      "quality_passes",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Fastest Laps",
      "fastest_lap",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Top 15 Laps",
      "top_15_laps",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "% Top 15 Laps",
      "pct_top_15_laps",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Laps Led",
      "laps_led",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "% Laps Led",
      "pct_laps_led",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Driver Rating",
      "driver_rating",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Stage 1 Points",
      "stage_1_pts",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Stage 2 Points",
      "stage_2_pts",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
    buildStatRow(
      "Stage 3 Points",
      "stage_3_pts",
      currentRaceEntry,
      seasonRaces,
      allRaces,
      seasonRacesWithoutDriver
    ),
  ];
  // Replace with real content later
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: "60vw", p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {driver}
        </Typography>
        <Typography variant="body2">
          Season: {seasonYear}, Race: {currentRace}
        </Typography>
        <Typography variant="body2">{raceName}</Typography>

        {/* Your detailed race-related stats will go here */}
        <Box sx={{ mt: 2 }}>
          {/* Placeholder or table/chart component */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Stat</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>This Race</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Season Avg</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Overall Avg</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Season Avg Other Drivers</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell align="right">{row.current}</TableCell>
                    <TableCell align="right">{row.seasonAvg}</TableCell>
                    <TableCell align="right">{row.overallAvg}</TableCell>
                    <TableCell align="right">{row.seasonRacesWithoutDriverAvg}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ResultsDriverDrawer;
