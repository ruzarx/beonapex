import React, { useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import raceData from "../../data/data.json";
import {
  getAverageFeatureValue,
  getFeatureValue,
  getSeasonLabel,
} from "../../utils/raceUtils";
import DriverDetailsDrawer from "./DriverDetailsDrawer";

const DriverFantasyTable = ({
  drivers,
  raceDates,
  similarRaceDates,
  allRaceDates,
  currentSeasonDates,
  pastSeasonDates,
  feature,
  name,
}) => {
  const [excludePlayoffs, setExcludePlayoffs] = useState(false);
  const [excludeDnf, setExcludeDnf] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
  };

  const sortedDrivers = [...drivers].sort((a, b) => {
    const avgA = getAverageFeatureValue(raceData, a, raceDates, excludePlayoffs, excludeDnf, feature);
    const avgB = getAverageFeatureValue(raceData, b, raceDates, excludePlayoffs, excludeDnf, feature);
  
    // Move "-" values to the end
    const isInvalidA = avgA === "-" || isNaN(avgA);
    const isInvalidB = avgB === "-" || isNaN(avgB);
  
    if (isInvalidA && isInvalidB) return 0; // Keep order if both are "-"
    if (isInvalidA) return 1; // Move A to the end
    if (isInvalidB) return -1; // Move B to the end
  
    // Normal sorting for valid numbers
    if (feature === "race_pos" || feature === "quali_pos") {
      return avgA - avgB; // Lower is better
    } else {
      return avgB - avgA; // Higher is better
    }
  });
  

  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3, bgcolor: "background.paper" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={excludePlayoffs} onChange={() => setExcludePlayoffs(!excludePlayoffs)} />}
            label="Exclude Playoff Races"
          />

          {feature !== "quali_pos" && (
            <FormControlLabel
              control={<Checkbox checked={excludeDnf} onChange={() => setExcludeDnf(!excludeDnf)} />}
              label="Exclude DNFs"
            />
          )}
        </Box>

        {/* Right: Legend */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: "rgba(255, 0, 0, 0.2)",
              border: "1px solid red",
              borderRadius: 1,
              mr: 1,
            }}
          />
          <Typography variant="body2">Did Not Finish (DNF)</Typography>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 700, borderRadius: 2 }}>
        <Table stickyHeader>
          {/* Header - Unified Column */}
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", color: "black", px: 2 }}>
                Driver
              </TableCell>
              <TableCell colSpan={4} sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                Average {name}
              </TableCell>
              {raceDates.map((race, index) => (
                <TableCell key={index} rowSpan={2} sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  {getSeasonLabel(race)}
                </TableCell>
              ))}
            </TableRow>

            {/* Sub-Headers */}
            <TableRow sx={{ bgcolor: "primary.light" }}>
                <Tooltip title={`Average ${name.toLowerCase()} on this track`}>
                <TableCell sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  This Track
                </TableCell>
              </Tooltip>
              <Tooltip title={`Average ${name.toLowerCase()} on similar tracks`}>
                <TableCell sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  Similar Tracks
                </TableCell>
              </Tooltip>
              <Tooltip title={`Average ${name.toLowerCase()} on all tracks`}>
                <TableCell sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  All Tracks
                </TableCell>
              </Tooltip>
              <Tooltip title={`Average ${name.toLowerCase()} in the current season`}>
                <TableCell sx={{ fontWeight: "bold", color: "black", textAlign: "center" }}>
                  This Season
                </TableCell>
              </Tooltip>
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {sortedDrivers.map((driver, index) => (
              <TableRow
                key={index}
                sx={{
                  bgcolor: index % 2 === 0 ? "background.default" : "action.hover",
                  "&:hover": { bgcolor: "action.selected", transition: "all 0.3s ease" },
                }}
              >
                <TableCell 
                    sx={{ fontWeight: "bold", px: 2, cursor: "pointer" }}
                    onClick={() => handleDriverClick(driver)}
                  >
                    {driver}
                </TableCell>
                <Tooltip title={`Average ${name.toLowerCase()} on this track`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getAverageFeatureValue(raceData, driver, raceDates, excludePlayoffs, excludeDnf, feature)}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Average ${name.toLowerCase()} on similar tracks`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getAverageFeatureValue(raceData, driver, similarRaceDates, excludePlayoffs, excludeDnf, feature)}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Average ${name.toLowerCase()} on all tracks`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getAverageFeatureValue(raceData, driver, allRaceDates, excludePlayoffs, excludeDnf, feature)}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Average ${name.toLowerCase()} in the current season`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getAverageFeatureValue(raceData, driver, currentSeasonDates, excludePlayoffs, excludeDnf, feature)}
                  </TableCell>
                </Tooltip>
                {raceDates.map((race_date, idx) => {
                  const { value, status } = getFeatureValue(raceData, driver, race_date, excludePlayoffs, excludeDnf, feature);
                  return (
                    <Tooltip title={`${name} in this race`}>
                      <TableCell
                        key={idx}
                        sx={{
                          textAlign: "center",
                          bgcolor: status !== "finished" ? "rgba(255, 0, 0, 0.2)" : "inherit",
                          fontWeight: status !== "finished" ? "bold" : "normal",
                        }}
                      >
                        {value}
                      </TableCell>
                    </Tooltip>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedDriver && (
        <DriverDetailsDrawer
          driver={selectedDriver}
          drivers={drivers}
          raceDates={raceDates}
          pastSeasonDates={pastSeasonDates}
          currentSeasonDates={currentSeasonDates}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </Paper>
  );
};

export default DriverFantasyTable;
