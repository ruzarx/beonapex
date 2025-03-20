import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Grid2,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import raceData from "../../data/data.json";
import { getAverageFeatureValue, getRankInGroup, getPreviousRaceResult } from "../../utils/raceUtils";

const DriverDetailsDrawer = ({ driver, drivers, raceDates, pastSeasonDates, currentSeasonDates, onClose }) => {
  if (!driver) return null; // Prevent rendering if no driver is selected

  const totalDrivers = drivers.length;

  // Fetch data
  const stats = {
    avgFinish: getAverageFeatureValue(raceData, driver, raceDates, false, false, "race_pos"),
    avgStart: getAverageFeatureValue(raceData, driver, raceDates, false, false, "quali_pos"),
    avgRating: getAverageFeatureValue(raceData, driver, raceDates, false, false, "driver_rating"),
    avgFantasy: getAverageFeatureValue(raceData, driver, raceDates, false, false, "fantasy_points"),
    finishRank: getRankInGroup(raceData, driver, drivers, "race_pos", raceDates),
    startRank: getRankInGroup(raceData, driver, drivers, "quali_pos", raceDates),
    ratingRank: getRankInGroup(raceData, driver, drivers, "driver_rating", raceDates),
    fantasyRank: getRankInGroup(raceData, driver, drivers, "fantasy_points", raceDates),
    seasonFinish: getAverageFeatureValue(raceData, driver, currentSeasonDates, false, false, "race_pos"),
    seasonStart: getAverageFeatureValue(raceData, driver, currentSeasonDates, false, false, "quali_pos"),
    seasonRating: getAverageFeatureValue(raceData, driver, currentSeasonDates, false, false, "driver_rating"),
    seasonFantasy: getAverageFeatureValue(raceData, driver, currentSeasonDates, false, false, "fantasy_points"),
    pastSeasonFinish: getAverageFeatureValue(raceData, driver, pastSeasonDates, false, false, "race_pos"),
    pastSeasonStart: getAverageFeatureValue(raceData, driver, pastSeasonDates, false, false, "quali_pos"),
    pastSeasonRating: getAverageFeatureValue(raceData, driver, pastSeasonDates, false, false, "driver_rating"),
    pastSeasonFantasy: getAverageFeatureValue(raceData, driver, pastSeasonDates, false, false, "fantasy_points"),
  };

  const pastRaces = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
    num: `Race -${num}`,
    finish: getPreviousRaceResult(raceData, driver, "race_pos", currentSeasonDates, num),
    start: getPreviousRaceResult(raceData, driver, "quali_pos", currentSeasonDates, num),
    rating: getPreviousRaceResult(raceData, driver, "driver_rating", currentSeasonDates, num),
    fantasy: getPreviousRaceResult(raceData, driver, "fantasy_points", currentSeasonDates, num),
    race_name: getPreviousRaceResult(raceData, driver, "track_name", currentSeasonDates, num),
  }));

  return (
    <Drawer anchor="right" open={Boolean(driver)} onClose={onClose}>
      <Box sx={{ width: "60vw", p: 3, bgcolor: "background.paper" }}>
        
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">{driver} - Driver Stats</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Stats Cards */}
        <Grid2 container spacing={2}>
          {[
            { title: "This Track", data: [
                { label: "Avg Finish", value: stats.avgFinish },
                { label: "Avg Start", value: stats.avgStart },
                { label: "Avg Rating", value: stats.avgRating },
                { label: "Avg Fantasy Pts", value: stats.avgFantasy }
              ] 
            },
            { title: "Rank in Group", data: [
                { label: "Finish Rank", value: stats.finishRank },
                { label: "Start Rank", value: stats.startRank },
                { label: "Rating Rank", value: stats.ratingRank },
                { label: "Fantasy Rank", value: stats.fantasyRank }
              ] 
            },
            { title: "This Season So Far", data: [
                { label: "Avg Finish", value: stats.seasonFinish },
                { label: "Avg Start", value: stats.seasonStart },
                { label: "Avg Rating", value: stats.seasonRating },
                { label: "Avg Fantasy Points", value: stats.seasonFantasy }
              ] 
            },
            { title: "Past Season To This Race", data: [
                { label: "Avg Finish", value: stats.pastSeasonFinish },
                { label: "Avg Start", value: stats.pastSeasonStart },
                { label: "Avg Rating", value: stats.pastSeasonRating },
                { label: "Avg Fantasy Points", value: stats.pastSeasonFantasy }
              ] 
            }
          ].map((section, index) => (
            <Grid2 item xs={3} key={index}>
              <Card elevation={3} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{section.title}</Typography>
                  {section.data.map((item, idx) => (
                    <Typography key={idx} sx={{ fontSize: 14 }}>
                      <strong>{item.label}:</strong> {item.value}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>

        <Divider sx={{ my: 3 }} />

        {/* Previous 4 Races Table */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Previous Races</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Race</strong></TableCell>
                <TableCell><strong>Finish</strong></TableCell>
                <TableCell><strong>Start</strong></TableCell>
                <TableCell><strong>Rating</strong></TableCell>
                <TableCell><strong>Fantasy Pts</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pastRaces.map((race, index) => (
                <TableRow key={index}>
                  <TableCell>{race.race_name}</TableCell>
                  <TableCell>{race.finish}</TableCell>
                  <TableCell>{race.start}</TableCell>
                  <TableCell>{race.rating}</TableCell>
                  <TableCell>{race.fantasy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Drawer>
  );
};

export default DriverDetailsDrawer;
