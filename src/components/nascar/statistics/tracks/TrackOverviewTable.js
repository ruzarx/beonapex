import React, { useState, useMemo } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Collapse, IconButton, Box, Typography
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import calendar from "../../../../data/calendar.json";
import data from "../../../../data/data.json";


const applyZebraTint = (colorEven, colorOdd, index) =>
  index % 2 === 0 ? colorEven : colorOdd;

const playoffLabelMap = {
  playoff_16: 'Round 16',
  playoff_12: 'Round 12',
  playoff_8:  'Round 8',
  playoff_4:  'Final'
};

const getTrackStats = () => {
  const grouped = {};
  const racesByKey = {};

  data.forEach(row => {
    const raceKey = `${row.track_name}_${row.season_year}_${row.race_number}`;
    if (!racesByKey[raceKey]) racesByKey[raceKey] = [];
    racesByKey[raceKey].push(row);
  });

  Object.entries(racesByKey).forEach(([key, raceDrivers]) => {
    const { track_name } = raceDrivers[0];
    if (!grouped[track_name]) grouped[track_name] = [];

    const winner = raceDrivers.find(d => d.race_pos === 1);
    const nonFinishers = raceDrivers.filter(d => d.status !== "finished").length;
    const avgRating = raceDrivers.reduce((a, b) => a + (b.driver_rating || 0), 0) / raceDrivers.length;
    const avgGreenFlagPasses = raceDrivers.reduce((a, b) => a + (b.green_flag_passes || 0), 0) / raceDrivers.length;
    const avgQualityPasses = raceDrivers.reduce((a, b) => a + (b.quality_passes || 0), 0) / raceDrivers.length;

    grouped[track_name].push({
      season_year: raceDrivers[0].season_year,
      race_number: raceDrivers[0].race_number,
      race_date: raceDrivers[0].race_date,
      retirements: nonFinishers,
      cautions_number: winner?.cautions_number || 0,
      green_flag_percent: winner?.green_flag_percent || 0,
      average_green_flag_run_laps: winner?.average_green_flag_run_laps || 0,
      number_of_leaders: winner?.number_of_leaders || 0,
      average_leading_run_laps: winner?.average_leading_run_laps || 0,
      most_laps_led: winner?.most_laps_led || 0,
      most_laps_led_percent: winner?.most_laps_led_percent || 0,
      total_laps: winner?.total_laps || 0,
      driver_rating: avgRating,
      green_flag_passes: avgGreenFlagPasses,
      quality_passes: avgQualityPasses,
    });
  });

  return Object.entries(grouped).map(([track, races]) => {
    const avg = (key) => races.reduce((a, b) => a + (b[key] || 0), 0) / races.length;
    return {
      track_name: track,
      race_count: races.length,
      stats: {
        retirements: avg("retirements").toFixed(1),
        cautions_number: avg("cautions_number").toFixed(1),
        green_flag_percent: (avg("green_flag_percent") * 100).toFixed(1) + "%",
        average_green_flag_run_laps: avg("average_green_flag_run_laps").toFixed(1),
        number_of_leaders: avg("number_of_leaders").toFixed(1),
        average_leading_run_laps: avg("average_leading_run_laps").toFixed(1),
        most_laps_led: avg("most_laps_led").toFixed(1),
        most_laps_led_percent: (avg("most_laps_led_percent") * 100).toFixed(1) + "%",
        green_flag_passes: avg("green_flag_passes").toFixed(1),
        quality_passes: avg("quality_passes").toFixed(1),
        total_laps: avg("total_laps").toFixed(1),
        driver_rating: avg("driver_rating").toFixed(1),
      },
      recent_races: races
        .sort((a, b) => b.season_year - a.season_year || b.race_number - a.race_number)
        .slice(0, 10),
    };
  }).sort((a, b) => a.track_name.localeCompare(b.track_name));
};

const ExpandedTrackStats = ({ races, isDark }) => {
  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };
  const headerStyle = {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05rem",
    color: isDark ? "#dddddd" : "#333333",
    bgcolor: isDark ? "#111111" : "#f5f5f5",
    borderBottom: `2px solid ${isDark ? "#333" : "#ccc"}`,
    px: 1,
    py: 1
  };

  return (
    <Box sx={{ margin: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Last 10 Races
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerStyle}>Date</TableCell>
            <TableCell sx={headerStyle}>Retirements</TableCell>
            <TableCell sx={headerStyle}>Cautions</TableCell>
            <TableCell sx={headerStyle}>Green %</TableCell>
            <TableCell sx={headerStyle}>Avg Green Flag Run</TableCell>
            <TableCell sx={headerStyle}>Leaders</TableCell>
            <TableCell sx={headerStyle}>Lead Laps</TableCell>
            <TableCell sx={headerStyle}>Most Laps Led</TableCell>
            <TableCell sx={headerStyle}>Most Laps Led %</TableCell>
            <TableCell sx={headerStyle}>Passes</TableCell>
            <TableCell sx={headerStyle}>Top-15 Passes</TableCell>
            <TableCell sx={headerStyle}>Race Laps</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {races.map((r, index) => {
            const calendarRace = calendar.find(
              c => c.season_year === r.season_year && c.race_number === r.race_number
            );
            const monthLabel = calendarRace
              ? new Date(calendarRace.race_date).toLocaleString('en-US', { month: 'short' })
              : null;
            const playoffNote = calendarRace?.stage && calendarRace.stage !== 'season'
              ? playoffLabelMap[calendarRace.stage]
              : null;

            return (
              <TableRow key={index}
                sx={{
                  bgcolor: index % 2 === 0 
                    ? (isDark ? "#1e1e1e" : "#fff")
                    : (isDark ? "#2a2a2a" : "#f9f9f9")
                }}
              >
                <TableCell sx={{ ...cellStyle, textAlign: 'left' }}>
                  <span>{monthLabel} {r.season_year}</span>
                  {playoffNote && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: '0.75rem',
                      color: isDark ? '#ffa726' : '#d84315',
                      fontWeight: 500
                    }}>
                      – {playoffNote}
                    </span>
                  )}
                </TableCell>
                <TableCell sx={cellStyle}>{r.retirements}</TableCell>
                <TableCell sx={cellStyle}>{r.cautions_number}</TableCell>
                <TableCell sx={cellStyle}>{(r.green_flag_percent * 100).toFixed(1)}%</TableCell>
                <TableCell sx={cellStyle}>{r.average_green_flag_run_laps.toFixed(1)}</TableCell>
                <TableCell sx={cellStyle}>{r.number_of_leaders}</TableCell>
                <TableCell sx={cellStyle}>{r.average_leading_run_laps.toFixed(1)}</TableCell>
                <TableCell sx={cellStyle}>{r.most_laps_led}</TableCell>
                <TableCell sx={cellStyle}>{(r.most_laps_led_percent * 100).toFixed(1)}%</TableCell>
                <TableCell sx={cellStyle}>{r.green_flag_passes.toFixed(1)}</TableCell>
                <TableCell sx={cellStyle}>{r.quality_passes.toFixed(1)}</TableCell>
                <TableCell sx={cellStyle}>{r.total_laps}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

const TrackOverviewTable = ({ themeMode }) => {
  const isDark = themeMode["themeMode"] === "dark";
  const [expanded, setExpanded] = useState(null);
  const trackStats = useMemo(() => getTrackStats(data), [data]);

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };
  const headerStyle = {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05rem",
    color: isDark ? "#dddddd" : "#333333",
    bgcolor: isDark ? "#111111" : "#f5f5f5",
    borderBottom: `2px solid ${isDark ? "#333" : "#ccc"}`,
    px: 1,
    py: 1
  };

  return (
    <TableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerStyle}/>
            <TableCell sx={headerStyle}>Track</TableCell>
            <TableCell sx={headerStyle}>Avg Retires</TableCell>
            <TableCell sx={headerStyle}>Avg Cautions</TableCell>
            <TableCell sx={headerStyle}>Avg Green %</TableCell>
            <TableCell sx={headerStyle}>Avg Green Run</TableCell>
            <TableCell sx={headerStyle}>Avg Leaders</TableCell>
            <TableCell sx={headerStyle}>Avg Lead Run</TableCell>
            <TableCell sx={headerStyle}>Avg Most Laps Led</TableCell>
            <TableCell sx={headerStyle}>Avg Most Laps Led %</TableCell>
            <TableCell sx={headerStyle}>Avg Passes</TableCell>
            <TableCell sx={headerStyle}>Avg Top-15 Passes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trackStats.map((track, idx) => (
            <React.Fragment key={track.track_name}>
              <TableRow sx={{
                  bgcolor: applyZebraTint(
                    isDark ? "#1e1e1e" : "#fff",
                    isDark ? "#2a2a2a" : "#f9f9f9",
                    idx
                  ),
                  '& > *': { borderBottom: 'unset' },
                  cursor: 'pointer',
                }}>
                <TableCell>
                  <IconButton size="small" onClick={() => setExpanded(expanded === track.track_name ? null : track.track_name)}>
                    {expanded === track.track_name ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell sx={{ ...cellStyle, textAlign: "left" }}>{track.track_name}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.retirements}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.cautions_number}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.green_flag_percent}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.average_green_flag_run_laps}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.number_of_leaders}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.average_leading_run_laps}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.most_laps_led}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.most_laps_led_percent}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.green_flag_passes}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.quality_passes}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={14} sx={{ p: 0 }}>
                  <Collapse in={expanded === track.track_name} timeout="auto" unmountOnExit>
                    <ExpandedTrackStats races={track.recent_races} isDark={isDark} />
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

export default TrackOverviewTable;
