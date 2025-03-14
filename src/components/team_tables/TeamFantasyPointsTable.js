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
import { getSeasonLabel, getTeamFantasyPoints } from "../../utils/raceUtils";

const TeamFantasyPointsTable = ({ teams, raceDates, similarRaceDates, allRaceDates, currentSeasonDates }) => {
  const [excludePlayoffs, setExcludePlayoffs] = useState(false);
  const [excludeDnf, setExcludeDnf] = useState(false);

  // Compute and sort teams by average all tracks finish position
  const sortedTeams = [...teams].sort((a, b) => {
    const avgA = getTeamFantasyPoints(raceData, a, raceDates, excludePlayoffs, excludeDnf);
    const avgB = getTeamFantasyPoints(raceData, b, raceDates, excludePlayoffs, excludeDnf);

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
            <TableCell sx={{ width: "120px", fontWeight: "bold" }}>Team</TableCell>
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
          {sortedTeams.map((team, index) => (
            <TableRow key={index}>
              <TableCell sx={{ width: "120px" }}>{team}</TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFantasyPoints(raceData, team, raceDates, excludePlayoffs, excludeDnf)}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFantasyPoints(raceData, team, similarRaceDates, excludePlayoffs, excludeDnf)}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFantasyPoints(raceData, team, allRaceDates, excludePlayoffs, excludeDnf)}
              </TableCell>
              <TableCell sx={{ width: "80px", textAlign: "center" }}>
                {getTeamFantasyPoints(raceData, team, currentSeasonDates, excludePlayoffs, excludeDnf)}
              </TableCell>
              {raceDates.map((race_date, idx) => (
                <TableCell key={idx} sx={{ width: "80px", textAlign: "center" }}>
                  {getTeamFantasyPoints(raceData, team, race_date, excludePlayoffs, excludeDnf)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamFantasyPointsTable;
