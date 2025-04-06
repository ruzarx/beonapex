import React, { useState, useMemo } from "react";
import { 
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  Box, Typography, IconButton, Collapse 
} from "@mui/material";
import { getAvgValue, compareSumToPrevSeason, getStagePointsPercentage, getEntities, getSumValue } from "../../utils/statsCalculations";
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
            season_points: 0,
            playoff_points: 0,
            stage_points: 0,
            total_cars: 0,
          });
        }
        
        const raceData = raceMap.get(raceKey);
        raceData.season_points += race.season_points || 0;
        raceData.playoff_points += race.playoff_points || 0;
        raceData.stage_points += race.stage_points || 0;
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
          stage_points_pct: ((race.stage_points / (race.stage_points + race.season_points - race.playoff_points)) * 100).toFixed(1),
          avg_points: (race.season_points / race.total_cars).toFixed(1)
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
              {racerType === "driver" ? "Race Points" : "Total Race Points"}
            </TableCell>
            <TableCell>
              {racerType === "driver" ? "Playoff Points" : "Total Playoff Points"}
            </TableCell>
            <TableCell>
              {racerType === "driver" ? "Stage Points" : "Total Stage Points"}
            </TableCell>
            <TableCell>% Stage Points</TableCell>
            <TableCell>
              {racerType === "driver" ? "Points" : "Avg Points per Car"}
            </TableCell>
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
              <TableCell>{race.season_points}</TableCell>
              <TableCell>{race.playoff_points}</TableCell>
              <TableCell>{race.stage_points}</TableCell>
              <TableCell>{race.stage_points_pct}%</TableCell>
              <TableCell>
                {racerType === "driver" 
                  ? (race.season_points + race.playoff_points)
                  : race.avg_points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const getCurrentSeasonRaceCount = (data, year) => {
  return data.filter(r => r.season_year === year).length;
};

const PointsStatTable = ({racerType, lastRaceData, raceData, seasonYear, prevSeasonData, isDark}) => {
  const [sortKey, setSortKey] = useState("season_points");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const rawEntities = getEntities(raceData, racerType, seasonYear, "season_points", false);

  // Move getValue outside of useMemo
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

      return compareSumToPrevSeason(
        currentSeasonData, 
        prevSeasonLimitedData, 
        entity, 
        "season_points", 
        racerType
      );
    }
    return 0;
  };

  const entities = useMemo(() => {
    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [rawEntities, sortKey, sortDirection, raceData, racerType, prevSeasonData, seasonYear]);

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };

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

                <TableCell sx={{ ...cellStyle }}>{getValue(entity)}</TableCell>
                <TableCell sx={{ ...cellStyle }}>{getValue(entity)}</TableCell>
                <TableCell sx={{ ...cellStyle }}>{getValue(entity)}</TableCell>
                <TableCell sx={{ ...cellStyle }}>{getValue(entity)}%</TableCell>
                <TableCell sx={{ ...cellStyle }}>{(100 - getValue(entity)).toFixed(2)}%</TableCell>
                <TableCell sx={{ ...cellStyle }}>{getValue(entity)}</TableCell>
                <TableCell sx={{ ...cellStyle }}>
                  {sortKey === "diff_to_prev" ? (
                    getValue(entity)
                  ) : (
                    getValue(entity)
                  )}
                </TableCell>
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
  );
};

export default PointsStatTable;
