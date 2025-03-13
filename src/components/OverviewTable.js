import React, { useState } from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, FormControlLabel } from "@mui/material";
import raceData from "../data/data.json"; 
import { getAverageFeatureValue, getAverageFantasyPoints } from "../utils/raceUtils";

const OverviewTable = ({ group, drivers, raceDates, track, useStar }) => {
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

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "120px", fontWeight: "bold" }}>Driver</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Finish Pos</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Start Pos</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Fantasy Points</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((driver, index) => (
            <TableRow key={index}>
              <TableCell sx={{ width: "120px" }}>{driver}</TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar, "race_pos")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar, "quali_pos")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFantasyPoints(raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar)}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar, "driver_rating")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OverviewTable;
