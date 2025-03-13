import React, { useState } from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, FormControlLabel, Box, Typography } from "@mui/material";
import raceData from "../data/data.json"; 
import { getAverageFeatureValue, getFeatureValue, getSeasonLabel } from "../utils/raceUtils";

const RatingTable = ({ group, drivers, raceDates, similarRaceDates, allRaceDates, currentSeasonDates, track, useStar }) => {
  const [excludePlayoffs, setExcludePlayoffs] = useState(false);
  const [excludeDnf, setExcludeDnf] = useState(false);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 700, overflow: "auto" }}>

      <FormControlLabel
        control={<Checkbox checked={excludePlayoffs} onChange={() => setExcludePlayoffs(!excludePlayoffs)} />}
        label="Exclude Playoff Races"
      />

      <FormControlLabel
        control={<Checkbox checked={excludeDnf} onChange={() => setExcludeDnf(!excludeDnf)} />}
        label="Exclude DNFs"
      />

      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Box sx={{ width: 20, height: 20, backgroundColor: "rgba(255, 0, 0, 0.2)", border: "1px solid red", mr: 1 }} />
        <Typography variant="body2">Did Not Finish (DNF)</Typography>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "120px", fontWeight: "bold" }}>Driver</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Track Rating</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Similar Tracks Rating</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. All Tracks Rating</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Current Season Rating</TableCell>
            {raceDates.map((race, index) => (
              <TableCell key={index} sx={{ width: "80px", textAlign: "center" }}>
                {getSeasonLabel(race)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((driver, index) => (
            <TableRow key={index}>
              <TableCell sx={{ width: "120px" }}>{driver}</TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar, "driver_rating")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, similarRaceDates, excludePlayoffs, excludeDnf, useStar, "driver_rating")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, allRaceDates, excludePlayoffs, excludeDnf, useStar, "driver_rating")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, currentSeasonDates, excludePlayoffs, excludeDnf, useStar, "driver_rating")}
              </TableCell>
              {raceDates.map((race, idx) => {
                  const { value, status } = getFeatureValue(raceData, driver, race, group, track, excludePlayoffs, excludeDnf, useStar, "driver_rating");

                  return (
                    <TableCell
                      key={idx}
                      sx={{
                        width: "80px",
                        textAlign: "center",
                        backgroundColor: status !== "finished" ? "rgba(255, 0, 0, 0.2)" : "inherit",
                      }}
                    >
                      {value}
                    </TableCell>
                  );
                })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RatingTable;
