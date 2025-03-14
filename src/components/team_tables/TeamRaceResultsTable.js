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

const TeamRaceResultsTable = ({ teams, raceDates, similarRaceDates, allRaceDates, currentSeasonDates }) => {
  const [excludePlayoffs, setExcludePlayoffs] = useState(false);
  const [excludeDnf, setExcludeDnf] = useState(false);

  // Compute and sort teams by average all tracks finish position
  const sortedTeams = [...teams].sort((a, b) => {
    const avgA = getTeamFeatureValue(raceData, a, raceDates, excludePlayoffs, excludeDnf, "race_pos");
    const avgB = getTeamFeatureValue(raceData, b, raceDates, excludePlayoffs, excludeDnf, "race_pos");

    return avgA - avgB; // Sort ascending (lower finish positions are better)
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
            <TableCell sx={{ width: "120px", fontWeight: "bold" }}>Team</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Track Finish</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Similar Tracks Finish</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. All Tracks Finish</TableCell>
            <TableCell sx={{ width: "80px", textAlign: "center" }}>Avg. Season Finish</TableCell>
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
                {getTeamFeatureValue(raceData, team, raceDates, excludePlayoffs, excludeDnf, "race_pos")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFeatureValue(raceData, team, similarRaceDates, excludePlayoffs, excludeDnf, "race_pos")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFeatureValue(raceData, team, allRaceDates, excludePlayoffs, excludeDnf, "race_pos")}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFeatureValue(raceData, team, currentSeasonDates, excludePlayoffs, excludeDnf, "race_pos")}
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

export default TeamRaceResultsTable;
