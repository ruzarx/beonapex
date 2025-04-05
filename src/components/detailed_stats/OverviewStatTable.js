import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import {
  getAvgValue,
  getPercentage,
  getStagePointsPercentage,
  getEntities,
} from "../../utils/statsCalculations";

const OverviewStatTable = ({
  racerType,
  lastRaceData,
  raceData,
  seasonYear,
  isDark,
}) => {
  const [sortKey, setSortKey] = useState("driver_rating");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const rawEntities = getEntities(raceData, racerType, seasonYear, "driver_rating", false);

  const entities = useMemo(() => {
    const getValue = (entity) => {
      if (sortKey === "stage_points_pct") {
        return getStagePointsPercentage(raceData, entity, racerType);
      } else if (sortKey === "finish_pct") {
        return getPercentage(raceData, entity, "status", "finished", racerType);
      } else {
        return getAvgValue(raceData, entity, sortKey, racerType);
      }
    };

    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [raceData, racerType, rawEntities, sortKey, sortDirection]);

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };

  return (
    <TableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            {racerType === "driver" && (
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                Driver
              </TableCell>
            )}
            {racerType === "driver" && (
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                #
              </TableCell>
            )}
            {racerType !== "manufacturer" && (
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                Team
              </TableCell>
            )}
            {racerType === "manufacturer" && (
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                Make
              </TableCell>
            )}
            <TableCell
              onClick={() => handleSort("race_pos")}
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
            >
              Average Finish
            </TableCell>
            <TableCell
              onClick={() => handleSort("quali_pos")}
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
            >
              Average Start
            </TableCell>
            <TableCell
              onClick={() => handleSort("finish_pct")}
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
            >
              % Finished Races
            </TableCell>
            <TableCell
              onClick={() => handleSort("stage_points_pct")}
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
            >
              % Stage Points
            </TableCell>
            <TableCell
              onClick={() => handleSort("driver_rating")}
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
            >
              Avg Rating
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
                  {lastRaceData
                    .filter((r) => r.driver_name === entity)
                    .map((r) => r.car_number)}
                </TableCell>
              )}
              {racerType === "driver" && (
                <TableCell>
                  {lastRaceData
                    .filter((r) => r.driver_name === entity)
                    .map((r) => r.team_name)}
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
                {getPercentage(raceData, entity, "status", "finished", racerType)}%
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {getStagePointsPercentage(raceData, entity, racerType)}%
              </TableCell>
              <TableCell sx={{ ...cellStyle }}>
                {getAvgValue(raceData, entity, "driver_rating", racerType)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OverviewStatTable;
