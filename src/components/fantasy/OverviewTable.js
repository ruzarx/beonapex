import React, { useState, useMemo } from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, FormControlLabel, Box, Tooltip } from "@mui/material";
import raceData from "../../data/data.json"; 
import { getAverageFeatureValue } from "../../utils/raceUtils";
import DriverDetailsDrawer from "./FantasyDriverDetailsDrawer";

const OverviewTable = ({ groupDrivers, raceDates, pastSeasonDates, currentSeasonDates }) => {
  const [excludePlayoffs, setExcludePlayoffs] = useState(false);
  const [excludeDnf, setExcludeDnf] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
  };

  const driverCarNumbers = useMemo(() => {
    const driverMap = {};

    // Filter races that belong to the current season
    const currentSeasonRaces = raceData.filter((entry) =>
      currentSeasonDates.includes(entry.race_date)
    );

    // Loop through the data to map drivers to their latest car number
    currentSeasonRaces.forEach((entry) => {
      driverMap[entry.driver_name] = entry.car_number;
    });

    return driverMap; // Returns an object { driver_name: car_number }
  }, [raceData, currentSeasonDates]);

  const sortedDrivers = [...groupDrivers].sort((a, b) => {
    const avgA = getAverageFeatureValue(raceData, a, raceDates, excludePlayoffs, excludeDnf, "race_pos");
    const avgB = getAverageFeatureValue(raceData, b, raceDates, excludePlayoffs, excludeDnf, "race_pos");
    const isInvalidA = avgA === "-" || isNaN(avgA);
    const isInvalidB = avgB === "-" || isNaN(avgB);
    if (isInvalidA && isInvalidB) return 0;
    if (isInvalidA) return 1;
    if (isInvalidB) return -1;
    return avgA - avgB;
  });

  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={excludePlayoffs} onChange={() => setExcludePlayoffs(!excludePlayoffs)} />}
            label="Exclude Playoff Races"
          />

          <FormControlLabel
            control={<Checkbox checked={excludeDnf} onChange={() => setExcludeDnf(!excludeDnf)} />}
            label="Exclude DNFs"
          />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 700, borderRadius: 2 }}>
        <Table stickyHeader>
          {/* Header - Unified Column */}
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>
                #
              </TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>
                Driver
              </TableCell>
              <TableCell colSpan={4} sx={{ fontWeight: "bold", textAlign: "center" }}>
                Average values
              </TableCell>
            </TableRow>

            {/* Sub-Headers */}
            <TableRow sx={{ bgcolor: "primary.light" }}>
                <Tooltip title={`Average finish position`}>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Finish Position
                </TableCell>
              </Tooltip>
              <Tooltip title={`Average qualification position`}>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Start Position
                </TableCell>
              </Tooltip>
              <Tooltip title={`Average race rating`}>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Race Rating
                </TableCell>
              </Tooltip>
              <Tooltip title={`Average fantasy points earned`}>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Fantasy Points
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
                <TableCell sx={{ width: "40px", fontWeight: "bold", px: 2, cursor: "pointer" }}>
                    {driverCarNumbers[driver] || "-"}
                </TableCell>
                <TableCell 
                    sx={{ fontWeight: "bold", px: 2, cursor: "pointer" }}
                    onClick={() => handleDriverClick(driver)}
                  >
                    {driver}
                </TableCell>
                <Tooltip title={`Average finish position`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getAverageFeatureValue(raceData, driver, raceDates, excludePlayoffs, excludeDnf, "race_pos")}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Average qualification position`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getAverageFeatureValue(raceData, driver, raceDates, excludePlayoffs, excludeDnf, "quali_pos")}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Average race rating`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getAverageFeatureValue(raceData, driver, raceDates, excludePlayoffs, excludeDnf, "fantasy_points")}
                  </TableCell>
                </Tooltip>
                <Tooltip title={`Average fantasy points earned`}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getAverageFeatureValue(raceData, driver, raceDates, excludePlayoffs, excludeDnf, "driver_rating")}
                  </TableCell>
                </Tooltip>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedDriver && (
        <DriverDetailsDrawer
          driver={selectedDriver}
          groupDrivers={groupDrivers}
          raceDates={raceDates}
          pastSeasonDates={pastSeasonDates}
          currentSeasonDates={currentSeasonDates}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </Paper>
  );
};

export default OverviewTable;
