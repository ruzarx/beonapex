import React, { useState } from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, FormControlLabel, Box, Typography } from "@mui/material";
import raceData from "../../data/data.json"; 
import { getAverageFantasyPoints, getFantasyPoints, getSeasonLabel } from "../../utils/raceUtils";

const FantasyPointsTable = ({ drivers, raceDates, similarRaceDates, allRaceDates, currentSeasonDates }) => {
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
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Fantasy Pts</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Similar Tracks Fantasy Pts</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. All Tracks Fantasy Pts</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Season Fantasy Pts</TableCell>
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
                {getAverageFantasyPoints(raceData, driver, raceDates, excludePlayoffs, excludeDnf)}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFantasyPoints(raceData, driver, similarRaceDates, excludePlayoffs, excludeDnf)}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFantasyPoints(raceData, driver, allRaceDates, excludePlayoffs, excludeDnf)}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFantasyPoints(raceData, driver, currentSeasonDates, excludePlayoffs, excludeDnf)}
              </TableCell>
              {raceDates.map((race_date, idx) => {
                    const { value, status } = getFantasyPoints(raceData, driver, race_date, excludePlayoffs, excludeDnf);
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

export default FantasyPointsTable;
