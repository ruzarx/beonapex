import { Paper, Table, TableBody, TableContainer, TableHead, TableRow, TableCell } from "@mui/material";
import React from "react";
import standingsData from "../../data/standings.json";
import { getStandings, getBestFinish } from "../../utils/standingsCalculations";


const Standings = ({ seasonYear, currentRace }) => {
  const allDrivers = [...new Set(standingsData.filter((race) => race.season_year === seasonYear && race.race_number <= currentRace).map((race) => race.driver_name))];
  console.log(seasonYear, currentRace);
  
  const driverCarNumbers = {};
  const currentSeasonRacesData = standingsData.filter((race) => race.season_year === seasonYear && race.race_number === currentRace);
  currentSeasonRacesData.forEach((race) => {driverCarNumbers[race.driver_name] = race.car_number});
  
  const sortedDrivers = [...allDrivers].sort((driverA, driverB) => {
    const driverAPoints = getStandings(currentSeasonRacesData, driverA, "season_points");
    const driverBPoints = getStandings(currentSeasonRacesData, driverB, "season_points");
    const isInvalidA = driverAPoints === "-" || isNaN(driverAPoints);
    const isInvalidB = driverBPoints === "-" || isNaN(driverBPoints);
    if (isInvalidA && isInvalidB) return 0;
    if (isInvalidA) return 1;
    if (isInvalidB) return -1;
    return driverBPoints - driverAPoints;
  });

  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>
      <TableContainer
          sx={{
            maxHeight: 700,
            borderRadius: 2,
            overflowY: "auto",
            scrollbarWidth: "none", // Firefox: hides scrollbar
            "&::-webkit-scrollbar": {
              width: 0, // Chrome, Safari: hidden by default
            },
            "&:hover::-webkit-scrollbar": {
              width: "6px", // Appear on hover
            },
            "&:hover::-webkit-scrollbar-thumb": {
              backgroundColor: "#555", // Dark thumb
              borderRadius: "4px",
            },
            "&:hover::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>#</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>Driver</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", textAlign: "center" }}>Season Points</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", textAlign: "center" }}>Wins</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", textAlign: "center" }}>Stage Points</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", textAlign: "center" }}>Stage Wins</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", textAlign: "center" }}>Playoff Points</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", textAlign: "center" }}>Best Finish</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedDrivers.map((driver, index) => (
              <TableRow key={index}
                sx={{bgcolor: index % 2 === 0 ? "background.default" : "action.hover",
                  "&:hover": { bgcolor: "action.selected", transition: "all 0.3s ease" }}}>
                <TableCell sx={{ width: "40px", fontWeight: "bold", px: 2, cursor: "pointer" }}>{driverCarNumbers[driver] || "-"}</TableCell>
                <TableCell sx={{ fontWeight: "bold", px: 2, cursor: "pointer" }}>{driver}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{getStandings(currentSeasonRacesData, driver, "season_points")}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{getStandings(currentSeasonRacesData, driver, "wins")}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{getStandings(currentSeasonRacesData, driver, "race_stage_points")}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{getStandings(currentSeasonRacesData, driver, "stage_wins")}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{getStandings(currentSeasonRacesData, driver, "playoff_points")}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{getBestFinish(currentSeasonRacesData, driver)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    );
};

export default Standings;