import React, { useState, useMemo } from "react";
import {
  Card, Typography, Stack, ToggleButton, ToggleButtonGroup, Box
} from "@mui/material";
import { motion } from "framer-motion";
import DriverFormChart from "./DriverFormChart";
import DriverFormTable from "./DriverFormTable";
import { loadJsonData } from "../../utils/dataLoader";

const raceData = loadJsonData("data.json");
const calendar = loadJsonData("calendar.json");
const trackSimilarity = loadJsonData("track_similarity.json");
const nextRaceData = loadJsonData("next_race_data.json");

const RecentFormPanel = () => {
  const [metric, setMetric] = useState("race_pos");
  const [tableScope, setTableScope] = useState("recent");
  const driverName = "Ross Chastain";

  const seasonYear = nextRaceData.next_race_season;
  const currentRaceNumber = nextRaceData.next_race_number;
  const trackName = nextRaceData.next_race_track;
  const similarTracks = trackSimilarity[trackName]?.filter(t => t !== trackName) || [];

  const calendarMap = useMemo(() => {
    const map = {};
    calendar.forEach(r => {
      map[`${r.season_year}-${r.race_number}`] = r;
    });
    return map;
  }, []);

  const summarize = (races) => {
    return races
      .sort((a, b) => b.race_date - a.race_date)
      .slice(0, 5)
      .map(r => {
        const cal = calendarMap[`${r.season_year}-${r.race_number}`];
        const isPlayoff = cal?.stage?.includes("playoff");
        const date = new Date(r.race_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        });

        return {
          track: r.track_name,
          date,
          race_pos: r.race_pos,
          quali_pos: r.quali_pos,
          avg_pos: r.avg_pos,
          isPlayoff
        };
      });
  };

  const filteredSeasonRaces = useMemo(() => {
    return raceData.filter(r =>
      r.driver_name === driverName &&
      r.season_year === seasonYear &&
      r.race_number < currentRaceNumber
    );
  }, [seasonYear, currentRaceNumber]);

  const recentRacesSummary = useMemo(() => {
    const recent = raceData.filter(r =>
      r.driver_name === driverName &&
      !(r.season_year === seasonYear && r.race_number >= currentRaceNumber)
    );
    return summarize(recent);
  }, [driverName, seasonYear, currentRaceNumber]);

  const sameTrackSummary = useMemo(() => {
    const races = raceData.filter(r =>
      r.driver_name === driverName &&
      r.track_name === trackName
    );
    return summarize(races);
  }, [driverName, trackName]);

  const similarTrackSummary = useMemo(() => {
    const races = raceData.filter(r =>
      r.driver_name === driverName &&
      similarTracks.includes(r.track_name)
    );
    return summarize(races);
  }, [driverName, similarTracks]);

  const getCurrentTable = () => {
    if (tableScope === "recent") return recentRacesSummary;
    if (tableScope === "same_track") return sameTrackSummary;
    if (tableScope === "track_type") return similarTrackSummary;
    return [];
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card
        elevation={0}
        sx={{
          backdropFilter: "blur(10px)",
          background: "linear-gradient(135deg, rgba(128,0,255,0.15), rgba(255,255,255,0.05))",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
          p: 3,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              RECENT FORM TREND
            </Typography>
            <Box display="flex" justifyContent="center" mt={1}>
              <ToggleButtonGroup
                value={metric}
                exclusive
                onChange={(e, newMetric) => {
                  if (newMetric !== null && newMetric !== metric) {
                    setMetric(newMetric);
                  }
                }}
                size="small"
                color="primary"
                sx={{
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.04)",
                  px: 1,
                }}
              >
                <ToggleButton value="race_pos">Finish Pos</ToggleButton>
                <ToggleButton value="quali_pos">Start Pos</ToggleButton>
                <ToggleButton value="avg_pos">Avg Running Pos</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          <DriverFormChart metric={metric} seasonRaceData={filteredSeasonRaces} />

          <Box>
            <ToggleButtonGroup
              value={tableScope}
              exclusive
              onChange={(e, newScope) => {
                if (newScope !== null && newScope !== tableScope) {
                  setTableScope(newScope);
                }
              }}
              size="small"
              color="primary"
              fullWidth
              sx={{
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.04)",
                px: 1,
                justifyContent: "center"
              }}
            >
              <ToggleButton value="recent">Recent</ToggleButton>
              <ToggleButton value="same_track">This Track</ToggleButton>
              <ToggleButton value="track_type">Similar Tracks</ToggleButton>
            </ToggleButtonGroup>

            <Box mt={2}>
              <DriverFormTable summaryData={getCurrentTable()} />
            </Box>
          </Box>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default RecentFormPanel;
