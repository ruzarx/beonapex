import React, { useState } from "react";
import {
    Paper, Box, Typography,
    ToggleButtonGroup, ToggleButton, FormControl, InputLabel, Select, MenuItem
  } from "@mui/material";
import rawData from "../../data/data.json";
import OverviewStatTable from "./OverviewStatTable";
import PointsStatTable from "./PointsStatTable";
import PositionStatTable from "./PositionStatTable";
import FightStatTable from "./FightStatTable";


const DetailedStats = ({ seasonYear, currentRace, themeMode, onDriverClick }) => {
    const [tableMode, setTableMode] = useState("overview"); // options: points, positions, fight
    const [statsLevel, setStatsLevel] = useState("driver"); // options: driver, team, manufacturer

    const isDark = themeMode["themeMode"] === "dark";
    const raceData = rawData.filter(r => (r.season_year === seasonYear) && (r.race_number <= currentRace));
    const prevSeasonData = rawData.filter(r => (r.season_year === seasonYear - 1) && (r.race_number <= currentRace));
    const lastRaceData = raceData.filter(r => r.race_number === currentRace);

    return (
        <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
                <ToggleButtonGroup
                        value={tableMode}
                        exclusive
                        onChange={(e, newMode) => newMode && setTableMode(newMode)}
                        size="small"
                        sx={{ mt: 1 }}
                        >
                    <ToggleButton value="overview">Overview</ToggleButton>
                    <ToggleButton value="points">Points</ToggleButton>
                    <ToggleButton value="positions">Positions</ToggleButton>
                    <ToggleButton value="fight">Fight</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="stats-level-label">Stats Type</InputLabel>
                <Select
                labelId="stats-level-label"
                value={statsLevel}
                label="Stats Type"
                onChange={(e) => setStatsLevel(e.target.value)}
                >
                <MenuItem value="driver">Driver</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="manufacturer">Manufacturer</MenuItem>
                </Select>
            </FormControl>
            </Box>

    
            { tableMode === "overview" &&
                <OverviewStatTable
                    racerType={statsLevel}
                    lastRaceData={lastRaceData}
                    raceData={raceData}
                    seasonYear={seasonYear}
                    isDark={isDark}
                />
            }
            { tableMode === "points" &&
                <PointsStatTable
                    racerType={statsLevel}
                    lastRaceData={lastRaceData}
                    raceData={raceData}
                    seasonYear={seasonYear}
                    prevSeasonData={prevSeasonData}
                    isDark={isDark}  
                />                 
            }
            { tableMode === "positions" &&
                <PositionStatTable
                    racerType={statsLevel}
                    lastRaceData={lastRaceData}
                    raceData={raceData}
                    seasonYear={seasonYear}
                    prevSeasonData={prevSeasonData}
                    isDark={isDark}  
                />                 
            }
            { tableMode === "fight" &&
                <FightStatTable
                    racerType={statsLevel}
                    lastRaceData={lastRaceData}
                    raceData={raceData}
                    seasonYear={seasonYear}
                    prevSeasonData={prevSeasonData}
                    isDark={isDark}  
                />                 
            }
            </Paper>
    )           
};


export default DetailedStats;
