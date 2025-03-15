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
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import raceData from "../../data/data.json";
import {
  getTeamFeatureValue,
  getSeasonLabel,
} from "../../utils/raceUtils";

const TeamFantasyTable = ({
  teams,
  raceDates,
  similarRaceDates,
  allRaceDates,
  currentSeasonDates,
  feature,
  name,
}) => {
  const [excludePlayoffs, setExcludePlayoffs] = useState(false);
  const [excludeDnf, setExcludeDnf] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => {
    const avgA = getTeamFeatureValue(raceData, a, raceDates, excludePlayoffs, excludeDnf, feature);
    const avgB = getTeamFeatureValue(raceData, b, raceDates, excludePlayoffs, excludeDnf, feature);
    if (feature === "race_pos" || feature === "quali_pos") {
      return avgA - avgB;
    } else {
      return avgB - avgA;
    }
  });

  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3, bgcolor: "background.paper" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={excludePlayoffs} onChange={() => setExcludePlayoffs(!excludePlayoffs)} />}
            label="Exclude Playoff Races"
          />
          {feature !== "quali_pos" && (
            <FormControlLabel
              control={<Checkbox checked={excludeDnf} onChange={() => setExcludeDnf(!excludeDnf)} />}
              label="Exclude DNFs"
            />
          )}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 700, borderRadius: 2 }}>
        <Table stickyHeader>
          {/* Header - Unified Column */}
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", color: "black", px: 2 }}>
                Team
              </TableCell>
              <TableCell colSpan={4} sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                Average {name}
              </TableCell>
              {raceDates.map((race, index) => (
                <TableCell key={index} rowSpan={2} sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  {getSeasonLabel(race)}
                </TableCell>
              ))}
            </TableRow>

            {/* Sub-Headers */}
            <TableRow sx={{ bgcolor: "primary.light" }}>
                <Tooltip title={`Team average ${name.toLowerCase()} on this track`}>
                <TableCell sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  This Track
                </TableCell>
              </Tooltip>
              <Tooltip title={`Team average ${name.toLowerCase()} on similar tracks`}>
                <TableCell sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  Similar Tracks
                </TableCell>
              </Tooltip>
              <Tooltip title={`Team average ${name.toLowerCase()} on all tracks`}>
                <TableCell sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  All Tracks
                </TableCell>
              </Tooltip>
              <Tooltip title={`Team average ${name.toLowerCase()} in the current season`}>
                <TableCell sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  This Season
                </TableCell>
              </Tooltip>
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow
                key={index}
                sx={{
                  bgcolor: index % 2 === 0 ? "background.default" : "action.hover",
                  "&:hover": { bgcolor: "action.selected", transition: "all 0.3s ease" },
                }}
              >
                <TableCell sx={{ fontWeight: "bold", px: 2 }}>{team}</TableCell>
                <Tooltip title={`Team average ${name.toLowerCase()} on this track`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getTeamFeatureValue(raceData, team, raceDates, excludePlayoffs, excludeDnf, feature)}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Team average ${name.toLowerCase()} on similar tracks`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getTeamFeatureValue(raceData, team, similarRaceDates, excludePlayoffs, excludeDnf, feature)}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Team average ${name.toLowerCase()} on all tracks`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getTeamFeatureValue(raceData, team, allRaceDates, excludePlayoffs, excludeDnf, feature)}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Team average ${name.toLowerCase()} in the current season`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getTeamFeatureValue(raceData, team, currentSeasonDates, excludePlayoffs, excludeDnf, feature)}
                  </TableCell>
                </Tooltip>
                  {raceDates.map((race_date, idx) => (
                    <Tooltip title={`Team ${name.toLowerCase()} in this race`}>
                      <TableCell key={idx} sx={{ width: "80px", textAlign: "center" }}>
                        {getTeamFeatureValue(raceData, team, race_date, excludePlayoffs, excludeDnf, feature)}
                      </TableCell>
                    </Tooltip>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TeamFantasyTable;
