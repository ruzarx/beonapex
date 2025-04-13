import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Grid,
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
import { loadJsonData } from "../utils/dataLoader";
import { getRankInGroup, getPreviousRaceResult, filterDriverRaces, getCleanAverageFeatureValue } from "../utils/raceUtils";

const raceData = loadJsonData("data.json");

const FantasyDriverDetailsDrawer = ({ driver, groupDrivers, raceDates, pastSeasonDates, currentSeasonDates, onClose }) => {
  if (!driver) return null; // Prevent rendering if no driver is selected

  // const totalDrivers = groupDrivers.length;

  const trackRaces = filterDriverRaces(raceData, driver, raceDates, false, false);
  const seasonRaces = filterDriverRaces(raceData, driver, currentSeasonDates, false, false);
  const pastSeasonRaces = filterDriverRaces(raceData, driver, pastSeasonDates, false, false);
  const groupDriverAverages = groupDrivers.map(driver => {
    const driverRaces = raceData.filter(race => (race.driver_name === driver && raceDates.includes(race.race_date)));
    return {
      driver,
      race_pos: getCleanAverageFeatureValue("race_pos", driverRaces),
      quali_pos: getCleanAverageFeatureValue("quali_pos", driverRaces),
      driver_rating: getCleanAverageFeatureValue("driver_rating", driverRaces),
      fantasy_points: getCleanAverageFeatureValue("fantasy_points", driverRaces),
    };
  });

  const stats = {
    avgFinish: getCleanAverageFeatureValue("race_pos", trackRaces),
    avgStart: getCleanAverageFeatureValue("quali_pos", trackRaces),
    avgRating: getCleanAverageFeatureValue("driver_rating", trackRaces),
    avgFantasy: getCleanAverageFeatureValue("fantasy_points", trackRaces),
    finishRank: getRankInGroup("race_pos", driver, groupDriverAverages),
    startRank: getRankInGroup("quali_pos", driver, groupDriverAverages),
    ratingRank: getRankInGroup("driver_rating", driver, groupDriverAverages),
    fantasyRank: getRankInGroup("fantasy_points", driver, groupDriverAverages),
    seasonFinish: getCleanAverageFeatureValue("race_pos", seasonRaces),
    seasonStart: getCleanAverageFeatureValue("quali_pos", seasonRaces),
    seasonRating: getCleanAverageFeatureValue("driver_rating", seasonRaces),
    seasonFantasy: getCleanAverageFeatureValue("fantasy_points", seasonRaces),
    pastSeasonFinish: getCleanAverageFeatureValue("race_pos", pastSeasonRaces),
    pastSeasonStart: getCleanAverageFeatureValue("quali_pos", pastSeasonRaces),
    pastSeasonRating: getCleanAverageFeatureValue("driver_rating", pastSeasonRaces),
    pastSeasonFantasy: getCleanAverageFeatureValue("fantasy_points", pastSeasonRaces),
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
          <Typography variant="h5" fontWeight="bold">{driver}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Stats Cards */}
        <Grid container spacing={2}>
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
            <Grid item xs={3} key={index}>
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
            </Grid>
          ))}
        </Grid>

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

export default FantasyDriverDetailsDrawer;
