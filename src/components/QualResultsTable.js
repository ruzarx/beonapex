import React, { useState } from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, FormControlLabel } from "@mui/material";
import raceData from "../data/data.json"; 
import { getAverageFeatureValue, getFeatureValue, getSeasonLabel } from "../utils/raceUtils";

const QualResultsTable = ({ group, drivers, raceDates, similarRaceDates, allRaceDates, currentSeasonDates, track, useStar }) => {
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
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Start Pos</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Similar Tracks Start</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. All Tracks Start</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Current Season Start</TableCell>
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
                {getAverageFeatureValue(raceData, driver, group, raceDates, excludePlayoffs, false, useStar, "quali_pos")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, similarRaceDates, excludePlayoffs, false, useStar, "quali_pos")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, allRaceDates, excludePlayoffs, false, useStar, "quali_pos")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getAverageFeatureValue(raceData, driver, group, currentSeasonDates, excludePlayoffs, false, useStar, "quali_pos")}
              </TableCell>
                  {raceDates.map((race, idx) => {
                    const { value, status } = getFeatureValue(raceData, driver, race, group, track, excludePlayoffs, false, useStar, "quali_pos");
  
                    return (
                      <TableCell
                        key={idx}
                        sx={{
                          width: "80px",
                          textAlign: "center",
                          // backgroundColor: status !== "finished" ? "rgba(255, 0, 0, 0.2)" : "inherit",
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

export default QualResultsTable;
