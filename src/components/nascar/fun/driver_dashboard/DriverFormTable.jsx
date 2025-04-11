import React from "react";
import { Box, Paper, Typography, Chip, Stack } from "@mui/material";

// Dummy with playoff and performance variation
const dummyTrackData = [
  { track: "Martinsville Speedway", date: "March 2024", race_pos: 3, quali_pos: 8, avg_pos: 5.1, isPlayoff: true },
  { track: "Phoenix Raceway", date: "November 2023", race_pos: 9, quali_pos: 5, avg_pos: 6.8, isPlayoff: false },
  { track: "New Hampshire", date: "September 2023", race_pos: 13, quali_pos: 10, avg_pos: 9.4, isPlayoff: false },
  { track: "Richmond Raceway", date: "July 2023", race_pos: 7, quali_pos: 4, avg_pos: 5.0, isPlayoff: true },
  { track: "Bristol", date: "April 2023", race_pos: 17, quali_pos: 12, avg_pos: 14.2, isPlayoff: false },
];

const getChipColor = (val) => {
  if (val <= 5) return "success";
  if (val <= 10) return "warning";
  return "default";
};

const DriverFormTable = ({ summaryData }) => {
    return (
      <Stack spacing={1}>
        {summaryData.map((race, i) => (
          <Paper
            key={`${race.track}-${race.date}`}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              background: race.isPlayoff
                ? "rgba(255,215,0,0.08)"
                : i % 2 === 0
                ? "rgba(255,255,255,0.015)"
                : "rgba(255,255,255,0.03)",
              border: race.isPlayoff
                ? "1px solid gold"
                : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight="bold">{race.track}</Typography>
                <Typography variant="caption" color="text.secondary">{race.date}</Typography>
              </Box>
  
              <Stack direction="row" spacing={1}>
                <Chip label={`🚦 ${race.quali_pos}`} color="default" size="small" />
                <Chip label={`🏁 ${race.race_pos}`} color="default" size="small" />
                <Chip label={`📈 ${race.avg_pos.toFixed(1)}`} color="default" size="small" />
                {race.isPlayoff && <Chip label="🏆 Playoff" size="small" variant="outlined" color="warning" />}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    );
  };
  

export default DriverFormTable;
