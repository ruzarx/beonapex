import React, { useState, useMemo } from "react";
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell } from "@mui/material";
import { getAvgValue, getEntities, compareAvgToAllDrivers } from "../../utils/statsCalculations";

const FightStatTable = ({ racerType, lastRaceData, raceData, seasonYear, prevSeasonData, isDark }) => {
    const [sortKey, setSortKey] = useState("pass_diff");
    const [sortDirection, setSortDirection] = useState("desc");

    const handleSort = (key) => {
      if (sortKey === key) {
        setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("desc");
      }
    };

    const rawEntities = getEntities(raceData, racerType, seasonYear, "quality_passes", false);

    const entities = useMemo(() => {
      const getValue = (entity) => {
        if (sortKey === "green_flag_passes" || sortKey === "green_flag_times_passed" || 
            sortKey === "quality_passes" || sortKey === "pass_diff" || sortKey === "pct_quality_passes") {
          return getAvgValue(raceData, entity, sortKey, racerType);
        } else if (sortKey === "compare_green_flag_passes" || sortKey === "compare_green_flag_times_passed") {
          return compareAvgToAllDrivers(raceData, entity, 
            sortKey.includes("passes") ? "green_flag_passes" : "green_flag_times_passed", racerType);
        }
        return 0;
      };

      return [...rawEntities].sort((a, b) => {
        const valA = getValue(a);
        const valB = getValue(b);
        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }, [raceData, racerType, rawEntities, sortKey, sortDirection]);


    const applyZebraTint = (colorEven, colorOdd, index) => index % 2 === 0 ? colorEven : colorOdd;
    
    const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };

    return (
        <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  { racerType === "driver" && <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Driver</TableCell>}
                  { racerType === "driver" && <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>#</TableCell>}
                  { racerType != "manufacturer" && <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Team</TableCell>}
                  { racerType === "manufacturer" && <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Make</TableCell>}
                  <TableCell onClick={() => handleSort("pass_diff")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Avg Pass Balance</TableCell>
                  <TableCell onClick={() => handleSort("green_flag_passes")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Avg Green Flag Passes</TableCell>
                  <TableCell onClick={() => handleSort("compare_green_flag_passes")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Avg Passes To All Drivers</TableCell>
                  <TableCell onClick={() => handleSort("green_flag_times_passed")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Avg Green Flag Passed</TableCell>
                  <TableCell onClick={() => handleSort("compare_green_flag_times_passed")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Avg Passed To All Drivers</TableCell>
                  <TableCell onClick={() => handleSort("quality_passes")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Avg Top-15 Passes</TableCell>
                  <TableCell onClick={() => handleSort("pct_quality_passes")} sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>% Top-15 Passes</TableCell>
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
                    // onClick={() => onDriverClick(driver)}
                  >
                    { racerType === "driver" && <TableCell>{entity}</TableCell>}
                    { racerType === "driver" && <TableCell sx={{ ...cellStyle }}>{lastRaceData.filter(r => r.driver_name === entity).map(r => r.car_number)}</TableCell>}
                    { racerType === "driver" && <TableCell>{lastRaceData.filter(r => r.driver_name === entity).map(r => r.team_name)}</TableCell>}
                    { racerType != "driver" && <TableCell>{entity}</TableCell>}
                    <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "pass_diff", racerType)}</TableCell>
                    <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "green_flag_passes", racerType)}</TableCell>
                    <TableCell sx={{ ...cellStyle }}>{compareAvgToAllDrivers(raceData, entity, "green_flag_passes", racerType)}</TableCell>
                    <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "green_flag_times_passed", racerType)}</TableCell>
                    <TableCell sx={{ ...cellStyle }}>{compareAvgToAllDrivers(raceData, entity, "green_flag_times_passed", racerType)}</TableCell>
                    <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "quality_passes", racerType)}</TableCell>
                    <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "pct_quality_passes", racerType)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </TableContainer>
    )
};

export default FightStatTable;
