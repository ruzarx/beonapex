import React, { useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import raceData from "../../data/data.json";
import { getSeasonLabel, getTeamFeatureValue } from "../../utils/raceUtils";

const TeamRatingTable = ({ teams, raceDates, similarRaceDates, allRaceDates, currentSeasonDates }) => {
  const [excludePlayoffs, setExcludePlayoffs] = useState(false);
  const [excludeDnf, setExcludeDnf] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => {
    const avgA = getTeamFeatureValue(raceData, a, raceDates, excludePlayoffs, excludeDnf, "driver_rating");
    const avgB = getTeamFeatureValue(raceData, b, raceDates, excludePlayoffs, excludeDnf, "driver_rating");
    return avgB - avgA; // Sort ascending (lower finish positions are better)
  });

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
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Track Rating</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Similar Tracks Rating</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. All Tracks Rating</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Season Rating</TableCell>
            {raceDates.map((race, index) => (
              <TableCell key={index} sx={{ width: "80px", textAlign: "center" }}>
                {getSeasonLabel(race)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTeams.map((team, index) => (
            <TableRow key={index}>
              <TableCell sx={{ width: "120px" }}>{team}</TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFeatureValue(raceData, team, raceDates, excludePlayoffs, excludeDnf, "driver_rating")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFeatureValue(raceData, team, similarRaceDates, excludePlayoffs, excludeDnf, "driver_rating")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFeatureValue(raceData, team, allRaceDates, excludePlayoffs, excludeDnf, "driver_rating")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFeatureValue(raceData, team, currentSeasonDates, excludePlayoffs, excludeDnf, "driver_rating")}
              </TableCell>
                {raceDates.map((race_date, idx) => (
                  <TableCell key={idx} sx={{ width: "80px", textAlign: "center" }}>
                    {getTeamFeatureValue(raceData, team, race_date, excludePlayoffs, excludeDnf, "race_pos")}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamRatingTable;
