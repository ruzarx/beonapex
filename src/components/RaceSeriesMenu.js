import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";

const RaceSeriesMenu = ({ onSeriesChange, onNascarSubMenuChange }) => {
  const [selectedSeries, setSelectedSeries] = useState("NASCAR");
  const [selectedNascarTab, setSelectedNascarTab] = useState("Fantasy"); // Default NASCAR tab

  const handleChange = (event, newValue) => {
    setSelectedSeries(newValue);
    onSeriesChange(newValue);

    // If NASCAR is selected, notify App.js of the default sub-menu
    if (newValue === "NASCAR") {
      onNascarSubMenuChange("Fantasy");
    }
  };

  const handleNascarTabChange = (event, newValue) => {
    setSelectedNascarTab(newValue);
    onNascarSubMenuChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      {/* Top-Level Menu */}
      <Tabs value={selectedSeries} onChange={handleChange} centered>
        <Tab label="NASCAR" value="NASCAR" />
        <Tab label="Formula 1" value="Formula 1" />
        <Tab label="Supercars" value="Supercars" />
      </Tabs>

      {/* Sub-Menu for NASCAR */}
      {selectedSeries === "NASCAR" && (
        <Box sx={{ mt: 1, borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={selectedNascarTab} onChange={handleNascarTabChange} centered>
            <Tab label="Fantasy" value="Fantasy" />
            <Tab label="Statistics" value="Statistics" />
            <Tab label="Fun" value="Fun" />
          </Tabs>
        </Box>
      )}
    </Box>
  );
};

export default RaceSeriesMenu;
