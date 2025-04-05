import React, { useState, useMemo } from "react";
import {
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
} from "@mui/material";
import {
  getAvgValue,
  getSumValue,
  compareAvgToPrevSeason,
  getEntities,
} from "../../utils/statsCalculations";

const PositionStatTable = ({
  racerType,
  lastRaceData,
  raceData,
  seasonYear,
  prevSeasonData,
  isDark,
}) => {
  const [sortKey, setSortKey] = useState("race_pos");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const rawEntities = getEntities(raceData, racerType, seasonYear, "avg_pos", true);

  const entities = useMemo(() => {
    const getValue = (entity) => {
      if (sortKey === "top_15_laps" || sortKey === "laps_led") {
        return getSumValue(raceData, entity, sortKey, racerType);
      } else if (sortKey === "avg_pos_diff_prev") {
        return compareAvgToPrevSeason(raceData, prevSeasonData, entity, "avg_pos", racerType);
      } else {
        return getAvgValue(raceData, entity, sortKey, racerType);
      }
    };

    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [rawEntities, raceData, prevSeasonData, racerType, sortKey, sortDirection]);

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };

  return (
    <TableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            {racerType === "driver" && (
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Driver</TableCell>
            )}
            {racerType === "driver" && (
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>#</TableCell>
            )}
            {racerType !== "manufacturer" && (
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Team</TableCell>
            )}
            {racerType === "manufacturer" && (
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Make</TableCell>
            )}
            <TableCell onClick={() => handleSort("race_pos")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>
              Avg Finish Pos
            </TableCell>
            <TableCell onClick={() => handleSort("quali_pos")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>
              Avg Start Pos
            </TableCell>
            <TableCell onClick={() => handleSort("avg_pos")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>
              Avg Running Pos
            </TableCell>
            <TableCell onClick={() => handleSort("top_15_laps")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>
              Top-15 Laps
            </TableCell>
            <TableCell onClick={() => handleSort("pct_top_15_laps")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>
              % Top-15 Laps
            </TableCell>
            <TableCell onClick={() => handleSort("laps_led")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>
              Lead Laps
            </TableCell>
            <TableCell onClick={() => handleSort("pct_laps_led")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>
              % Lead Laps
            </TableCell>
            <TableCell onClick={() => handleSort("avg_pos_diff_prev")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>
              Avg Running Pos Diff To Previous Season
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {entities.map((entity, index) => (
            <TableRow
              key={index}
              sx={{
                bgcolor: applyZebraTint(
                  isDark ? "#1e1e1e" : "#fff",
                  isDark ? "#2a2a2a" : "#f9f9f9",
                  index
                ),
              }}
            >
              {racerType === "driver" && <TableCell>{entity}</TableCell>}
              {racerType === "driver" && (
                <TableCell sx={{ ...cellStyle }}>
                  {lastRaceData.filter((r) => r.driver_name === entity).map((r) => r.car_number)}
                </TableCell>
              )}
              {racerType === "driver" && (
                <TableCell>
                  {lastRaceData.filter((r) => r.driver_name === entity).map((r) => r.team_name)}
                </TableCell>
              )}
              {racerType !== "driver" && <TableCell>{entity}</TableCell>}

              <TableCell sx={{ ...cellStyle }}>
                {getAvgValue(raceData, entity, "race_pos", racerType)}
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {getAvgValue(raceData, entity, "quali_pos", racerType)}
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {getAvgValue(raceData, entity, "avg_pos", racerType)}
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {getSumValue(raceData, entity, "top_15_laps", racerType)}
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {getAvgValue(raceData, entity, "pct_top_15_laps", racerType)}
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {getSumValue(raceData, entity, "laps_led", racerType)}
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {getAvgValue(raceData, entity, "pct_laps_led", racerType)}
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {compareAvgToPrevSeason(raceData, prevSeasonData, entity, "avg_pos", racerType)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PositionStatTable;
