import React, { useState, useMemo } from "react";
import {
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  Box, Typography, IconButton, Collapse
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  getAvgValue,
  getSumValue,
  compareAvgToPrevSeason,
  getEntities,
} from "../../utils/statsCalculations";

// Add ExpandedRowContent component
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
        .slice(0, 10)
        .map(race => ({
          ...race,
          pct_top_15: ((race.top_15_laps / race.total_laps) * 100).toFixed(1),
          pct_laps_led: ((race.laps_led / race.total_laps) * 100).toFixed(1)
        }));
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
            race_positions: [],
            quali_positions: [],
            avg_positions: [],
            top_15_laps: 0,
            total_laps: 0,
            laps_led: 0,
            total_cars: 0,
          });
        }
        
        const raceData = raceMap.get(raceKey);
        raceData.race_positions.push(race.race_pos);
        raceData.quali_positions.push(race.quali_pos);
        raceData.avg_positions.push(race.avg_pos);
        raceData.top_15_laps += race.top_15_laps || 0;
        raceData.total_laps += race.total_laps || 0;
        raceData.laps_led += race.laps_led || 0;
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
          race_pos: (race.race_positions.reduce((a, b) => a + b, 0) / race.race_positions.length).toFixed(1),
          quali_pos: (race.quali_positions.reduce((a, b) => a + b, 0) / race.quali_positions.length).toFixed(1),
          avg_pos: (race.avg_positions.reduce((a, b) => a + b, 0) / race.avg_positions.length).toFixed(1),
          pct_top_15: ((race.top_15_laps / race.total_laps) * 100).toFixed(1),
          pct_laps_led: ((race.laps_led / race.total_laps) * 100).toFixed(1)
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
            <TableCell>
              {racerType === "driver" ? "Finish" : "Avg Finish"}
            </TableCell>
            <TableCell>
              {racerType === "driver" ? "Start" : "Avg Start"}
            </TableCell>
            <TableCell>
              {racerType === "driver" ? "Avg Position" : "Avg Running Pos"}
            </TableCell>
            <TableCell>
              {racerType === "driver" ? "Top-15 Laps" : "Total Top-15 Laps"}
            </TableCell>
            <TableCell>% Top-15 Laps</TableCell>
            <TableCell>
              {racerType === "driver" ? "Laps Led" : "Total Laps Led"}
            </TableCell>
            <TableCell>% Laps Led</TableCell>
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
              <TableCell>{race.race_pos}</TableCell>
              <TableCell>{race.quali_pos}</TableCell>
              <TableCell>{race.avg_pos}</TableCell>
              <TableCell>
                {racerType === "driver" ? race.top_15_laps : race.top_15_laps}
              </TableCell>
              <TableCell>{race.pct_top_15}%</TableCell>
              <TableCell>
                {racerType === "driver" ? race.laps_led : race.laps_led}
              </TableCell>
              <TableCell>{race.pct_laps_led}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

// First, add a helper function to get the number of completed races in current season
const getCurrentSeasonRaceCount = (data, year) => {
  return data.filter(r => r.season_year === year).length;
};

const PositionStatTable = ({
  racerType,
  lastRaceData,
  raceData,
  seasonYear,
  prevSeasonData,
  isDark,
  showAllYears,
}) => {
  const [sortKey, setSortKey] = useState("race_pos");
  const [sortDirection, setSortDirection] = useState("asc");
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
    : seasonYear.toString();

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const rawEntities = getEntities(
    raceData, 
    racerType, 
    showAllYears ? null : seasonYear,
    "avg_pos", 
    true
  );

  const entities = useMemo(() => {
    const getValue = (entity) => {
      if (sortKey === "top_15_laps" || sortKey === "laps_led") {
        return getSumValue(raceData, entity, sortKey, racerType);
      } else if (sortKey === "avg_pos_diff_prev") {
        // Get the number of races completed in current season
        const currentSeasonRaces = getCurrentSeasonRaceCount(raceData, seasonYear);
        
        // Filter current season data
        const currentSeasonData = raceData
          .filter(r => r.season_year === seasonYear)
          .sort((a, b) => a.race_number - b.race_number);

        // Filter previous season data and take only the same number of races
        const prevSeasonLimitedData = prevSeasonData
          .filter(r => r.season_year === seasonYear - 1)
          .sort((a, b) => a.race_number - b.race_number)
          .slice(0, currentSeasonRaces);

        return compareAvgToPrevSeason(
          currentSeasonData, 
          prevSeasonLimitedData, 
          entity, 
          "avg_pos", 
          racerType
        );
      } else {
        return getAvgValue(raceData, entity, sortKey, racerType);
      }
    };

    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [rawEntities, raceData, prevSeasonData, racerType, sortKey, sortDirection, seasonYear]);

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;

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
                {racerType === "driver" && <TableCell>{entity}</TableCell>}
                {racerType === "driver" && (
                  <TableCell sx={{ ...cellStyle }}>
                    {(lastRaceData.length > 0 
                      ? lastRaceData.find((r) => r.driver_name === entity)?.car_number
                      : getLatestDriverInfo(entity)?.car_number
                    )}
                  </TableCell>
                )}
                {racerType === "driver" && (
                  <TableCell>
                    {(lastRaceData.length > 0 
                      ? lastRaceData.find((r) => r.driver_name === entity)?.team_name
                      : getLatestDriverInfo(entity)?.team_name
                    )}
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
              <TableRow>
                <TableCell 
                  style={{ paddingBottom: 0, paddingTop: 0 }} 
                  colSpan={
                    racerType === "driver" 
                      ? 13  // 1 (expand) + 1 (driver) + 1 (#) + 1 (team) + 8 (stats) + 1 (diff)
                      : 11  // 1 (expand) + 1 (name) + 8 (stats) + 1 (diff)
                  }
                >
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
  );
};

export default PositionStatTable;
