import React, { useState } from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, FormControlLabel } from "@mui/material";
import raceData from "../data/data.json"; 
import { getAverageFinishPosition, getFinishPosition, getSeasonLabel } from "../utils/raceUtils";

const RaceResultsTable = ({ group, drivers, raceDates, track, useStar }) => {
  const [excludePlayoffs, setExcludePlayoffs] = useState(false);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 700, overflow: "auto" }}>

      <FormControlLabel
        control={<Checkbox checked={excludePlayoffs} onChange={() => setExcludePlayoffs(!excludePlayoffs)} />}
        label="Exclude Playoff Races"
      />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "120px", fontWeight: "bold" }}>Driver</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Finish Pos</TableCell>
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
                {getAverageFinishPosition(raceData, driver, group, track, excludePlayoffs, useStar)}
              </TableCell>
              {raceDates.map((race, idx) => (
                <TableCell key={idx} sx={{ width: "80px", textAlign: "center" }}>
                  {getFinishPosition(raceData, driver, race, group, track, excludePlayoffs, useStar)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RaceResultsTable;
