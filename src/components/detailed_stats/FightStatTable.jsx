import React, { useState, useMemo } from "react";
import { 
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  Box, Typography, IconButton, Collapse 
} from "@mui/material";
import { getAvgValue, getEntities, compareAvgToAllDrivers } from "../../utils/statsCalculations";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ExpandedRowContent = ({ entity, racerType, raceData, isDark }) => {
  // Get and aggregate races for this entity
  const entityRaces = useMemo(() => {
    const races = raceData.filter(r => 
      r[racerType === "driver" ? "driver_name" : 
         racerType === "team" ? "team_name" : "manufacturer"] === entity
    );

    if (racerType === "driver") {
      return races
        .sort((a, b) => {
          if (a.season_year !== b.season_year) return b.season_year - a.season_year;
          return b.race_number - a.race_number;
        })
        .slice(0, 10);
    } else {
      // For teams and manufacturers, aggregate by race
      const raceMap = new Map();
      
      races.forEach(race => {
        const raceKey = `${race.season_year}-${race.race_number}-${race.track_name}`;
        if (!raceMap.has(raceKey)) {
          raceMap.set(raceKey, {
            season_year: race.season_year,
            race_number: race.race_number,
            track_name: race.track_name,
            pass_diff: 0,
            green_flag_passes: 0,
            green_flag_times_passed: 0,
            quality_passes: 0,
            total_cars: 0,
          });
        }
        
        const raceData = raceMap.get(raceKey);
        raceData.pass_diff += race.pass_diff || 0;
        raceData.green_flag_passes += race.green_flag_passes || 0;
        raceData.green_flag_times_passed += race.green_flag_times_passed || 0;
        raceData.quality_passes += race.quality_passes || 0;
        raceData.total_cars++;
      });

      // Convert aggregated data to array and sort
      return Array.from(raceMap.values())
        .sort((a, b) => {
          if (a.season_year !== b.season_year) return b.season_year - a.season_year;
          return b.race_number - a.race_number;
        })
        .slice(0, 10)
        .map(race => ({
          ...race,
          avg_pass_diff: (race.pass_diff / race.total_cars).toFixed(1),
          avg_green_flag_passes: (race.green_flag_passes / race.total_cars).toFixed(1),
          avg_green_flag_times_passed: (race.green_flag_times_passed / race.total_cars).toFixed(1),
          avg_quality_passes: (race.quality_passes / race.total_cars).toFixed(1),
        }));
    }
  }, [raceData, entity, racerType]);

  return (
    <Box sx={{ margin: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Last 10 Races
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Race</TableCell>
            <TableCell>Pass Balance</TableCell>
            <TableCell>Green Flag Passes</TableCell>
            <TableCell>Green Flag Passed</TableCell>
            <TableCell>Top-15 Passes</TableCell>
            <TableCell>% Top-15 Passes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entityRaces.map((race, index) => (
            <TableRow key={index}
              sx={{
                bgcolor: index % 2 === 0 
                  ? (isDark ? "#1e1e1e" : "#fff")
                  : (isDark ? "#2a2a2a" : "#f9f9f9")
              }}
            >
              <TableCell>{`${race.season_year} ${race.track_name}`}</TableCell>
              <TableCell>{racerType === "driver" ? race.pass_diff : race.avg_pass_diff}</TableCell>
              <TableCell>{racerType === "driver" ? race.green_flag_passes : race.avg_green_flag_passes}</TableCell>
              <TableCell>{racerType === "driver" ? race.green_flag_times_passed : race.avg_green_flag_times_passed}</TableCell>
              <TableCell>{racerType === "driver" ? race.quality_passes : race.avg_quality_passes}</TableCell>
              <TableCell>
                {((racerType === "driver" ? race.quality_passes : parseFloat(race.avg_quality_passes)) /
                  (racerType === "driver" ? race.green_flag_passes : parseFloat(race.avg_green_flag_passes)) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const FightStatTable = ({ racerType, lastRaceData, raceData, seasonYear, prevSeasonData, isDark, showAllYears }) => {
    const [sortKey, setSortKey] = useState("pass_diff");
    const [sortDirection, setSortDirection] = useState("desc");
    const [expandedRow, setExpandedRow] = useState(null);

    // Helper function to get the latest entry for a driver
    const getLatestDriverInfo = (driverName) => {
      const driverRaces = raceData.filter(r => r.driver_name === driverName);
      if (driverRaces.length === 0) return null;
      
      // Sort by season_year and race_number to get the latest
      return driverRaces.sort((a, b) => 
        b.season_year - a.season_year || b.race_number - a.race_number
      )[0];
    };

    // Get year range for the data
    const years = [...new Set(raceData.map(r => r.season_year))].sort();
    const yearRange = years.length > 1 
      ? `${Math.min(...years)}-${Math.max(...years)}`
      : (seasonYear?.toString() || "No year selected");

    const handleSort = (key) => {
      if (sortKey === key) {
        setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("desc");
      }
    };

    const rawEntities = getEntities(
      raceData, 
      racerType, 
      showAllYears ? null : seasonYear,
      "quality_passes", 
      false
    );

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
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Statistics for {yearRange}
              </Typography>
            </Box>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  <TableCell />
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
                  <React.Fragment key={index}>
                    <TableRow
                      sx={{
                          bgcolor: applyZebraTint(
                            isDark ? "#1e1e1e" : "#fff",
                            isDark ? "#2a2a2a" : "#f9f9f9",
                            index
                          ),
                          '& > *': { borderBottom: 'unset' },
                          cursor: 'pointer',
                      }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setExpandedRow(expandedRow === entity ? null : entity)}
                        >
                          {expandedRow === entity ? 
                            <KeyboardArrowUpIcon /> : 
                            <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      { racerType === "driver" && <TableCell>{entity}</TableCell>}
                      { racerType === "driver" && (
                        <TableCell sx={{ ...cellStyle }}>
                          {(lastRaceData.length > 0 
                            ? lastRaceData.find((r) => r.driver_name === entity)?.car_number
                            : getLatestDriverInfo(entity)?.car_number
                          )}
                        </TableCell>
                      )}
                      { racerType === "driver" && (
                        <TableCell>
                          {(lastRaceData.length > 0 
                            ? lastRaceData.find((r) => r.driver_name === entity)?.team_name
                            : getLatestDriverInfo(entity)?.team_name
                          )}
                        </TableCell>
                      )}
                      { racerType !== "driver" && <TableCell>{entity}</TableCell>}
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "pass_diff", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "green_flag_passes", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{compareAvgToAllDrivers(raceData, entity, "green_flag_passes", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "green_flag_times_passed", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{compareAvgToAllDrivers(raceData, entity, "green_flag_times_passed", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "quality_passes", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "pct_quality_passes", racerType)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                        <Collapse in={expandedRow === entity} timeout="auto" unmountOnExit>
                          <ExpandedRowContent
                            entity={entity}
                            racerType={racerType}
                            raceData={raceData}
                            isDark={isDark}
                          />
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
        </TableContainer>
    )
};

export default FightStatTable;
