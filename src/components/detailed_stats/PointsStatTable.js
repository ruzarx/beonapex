import React, { useState, useMemo } from "react";
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell } from "@mui/material";
import { getAvgValue, compareSumToPrevSeason, getStagePointsPercentage, getEntities, getSumValue } from "../../utils/statsCalculations";

const PointsStatTable = ({racerType, lastRaceData, raceData, seasonYear, prevSeasonData, isDark}) => {
  const [sortKey, setSortKey] = useState("season_points");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const rawEntities = getEntities(raceData, racerType, seasonYear, "season_points", false);

  const entities = useMemo(() => {
    const getValue = (entity) => {
      if (
        sortKey === "season_points" ||
        sortKey === "playoff_points" ||
        sortKey === "stage_points"
      ) {
        return getSumValue(raceData, entity, sortKey, racerType);
      } else if (sortKey === "stage_points_pct") {
        return getStagePointsPercentage(raceData, entity, racerType);
      } else if (sortKey === "finish_pos_pct") {
        return 100 - getStagePointsPercentage(raceData, entity, racerType);
      } else if (sortKey === "avg_season_points") {
        return getAvgValue(raceData, entity, "season_points", racerType);
      } else if (sortKey === "diff_to_prev") {
        return compareSumToPrevSeason(raceData, prevSeasonData, entity, "season_points", racerType);
      }
      return 0;
    };

    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [rawEntities, sortKey, sortDirection, raceData, racerType, prevSeasonData]);

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };

  return (
    <TableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            {racerType === "driver" && (<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Driver</TableCell>)}
            {racerType === "driver" && (<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>#</TableCell>)}
            {racerType !== "manufacturer" && (<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Team</TableCell>)}
            {racerType === "manufacturer" && (<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Make</TableCell>)}
            <TableCell onClick={() => handleSort("season_points")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Season Points</TableCell>
            <TableCell onClick={() => handleSort("playoff_points")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Playoff Points</TableCell>
            <TableCell onClick={() => handleSort("stage_points")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Stage Points</TableCell>
            <TableCell onClick={() => handleSort("stage_points_pct")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>% Stage Points</TableCell>
            <TableCell onClick={() => handleSort("finish_pos_pct")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>% Finish Pos Points</TableCell>
            <TableCell onClick={() => handleSort("avg_season_points")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Avg Race Points</TableCell>
            <TableCell onClick={() => handleSort("diff_to_prev")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Points Diff To Previous Season</TableCell>
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
              {racerType === "driver" && (<TableCell sx={{ ...cellStyle }}>{lastRaceData.filter((r) => r.driver_name === entity).map((r) => r.car_number)}</TableCell>)}
              {racerType === "driver" && (<TableCell>{lastRaceData.filter((r) => r.driver_name === entity).map((r) => r.team_name)}</TableCell>)}
              {racerType !== "driver" && <TableCell>{entity}</TableCell>}

              <TableCell sx={{ ...cellStyle }}>{getSumValue(raceData, entity, "season_points", racerType)}</TableCell>
              <TableCell sx={{ ...cellStyle }}>{getSumValue(raceData, entity, "playoff_points", racerType)}</TableCell>
              <TableCell sx={{ ...cellStyle }}>{getSumValue(raceData, entity, "stage_points", racerType)}</TableCell>
              <TableCell sx={{ ...cellStyle }}>{getStagePointsPercentage(raceData, entity, racerType)}%</TableCell>
              <TableCell sx={{ ...cellStyle }}>{(100 - getStagePointsPercentage(raceData, entity, racerType)).toFixed(2)}%</TableCell>
              <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "season_points", racerType)}</TableCell>
              <TableCell sx={{ ...cellStyle }}>{compareSumToPrevSeason(raceData, prevSeasonData, entity, "season_points", racerType)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PointsStatTable;
