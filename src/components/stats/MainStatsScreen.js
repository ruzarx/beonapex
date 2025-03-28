import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import StandingsPage from "../stats/StandingsPage";

const StatisticsScreen = ( themeMode ) => {
  const [selectedTab, setSelectedTab] = useState("standings");

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}>

      {/* Sub-tabs for different statistics */}
      <Tabs value={selectedTab} onChange={handleTabChange} centered>
        <Tab label="Standings" value="standings" />
        <Tab label="Stats" value="drivers" />
        <Tab label="Track" value="tracks" />
      </Tabs>

      {/* Render selected tab content */}
      <Box sx={{ mt: 3 }}>
        {selectedTab === "standings" && <StandingsPage themeMode={themeMode}/>}
        {selectedTab === "drivers" && (
          <Typography variant="body1">Driver standings and statistics will be displayed here.</Typography>
        )}
        {selectedTab === "tracks" && (
          <Typography variant="body1">Track standings and statistics will be displayed here.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default StatisticsScreen;
