// 📌 Utility function to filter driver races based on playoffs
export const filterDriverRaces = (raceData, driver, group, raceDates, excludePlayoffs, useStar) => {
    const groupType = useStar ? 'star_group' : 'open_group';
    return raceData.filter(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        raceDates.includes(entry.race_date) && // ✅ FIXED
        (!excludePlayoffs || entry.season_stage === "season") // Exclude playoffs if toggle is on
    );
    
  };

  // 📌 Utility function to calculate average finish position
  export const getAverageFeatureValue = (raceData, driver, group, raceDates, excludePlayoffs, useStar, feature) => {
    console.log(raceDates);
    const driverRaces = filterDriverRaces(raceData, driver, group, raceDates, excludePlayoffs, useStar);
    if (driverRaces.length === 0) return "-";
    const totalFeatureValue = driverRaces.reduce((sum, race) => sum + race[feature], 0);
    return (totalFeatureValue / driverRaces.length).toFixed(2);
  };
  
  // 📌 Utility function to get a driver's finish position in a specific race
  export const getFeatureValue = (raceData, driver, raceDate, group, track, excludePlayoffs, useStar, feature) => {
    const groupType = useStar ? 'star_group' : 'open_group';
    const raceEntry = raceData.find(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        entry.race_date === raceDate &&
        entry.track_name === track &&
        (!excludePlayoffs || entry.season_stage === "season")
    );
    console.log(group, raceEntry);
    return raceEntry ? raceEntry[feature] : "-";
  };

  export const getAverageSeasonFeatureValue = (raceData, driver, group, raceDates, excludePlayoffs, useStar, feature) => {
    console.log(raceDates);
    const driverRaces = filterDriverRaces(raceData, driver, group, raceDates, excludePlayoffs, useStar);
    if (driverRaces.length === 0) return "-";
    const totalFeatureValue = driverRaces.reduce((sum, race) => sum + race[feature], 0);
    return (totalFeatureValue / driverRaces.length).toFixed(2);
  };

  export const getFantasyPoints = (raceData, driver, raceDate, group, track, excludePlayoffs, useStar) => {
    const groupType  = useStar ? 'star_group' : 'open_group';
    const raceEntry = raceData.find(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        entry.race_date === raceDate &&
        entry.track_name === track &&
        (!excludePlayoffs || entry.season_stage === "season")
    );
    return raceEntry ? raceEntry.finish_position_points + raceEntry.stage_points : "-";
  };

  export const getAverageFantasyPoints = (raceData, driver, group, raceDates, excludePlayoffs, useStar) => {
    const driverRaces = filterDriverRaces(raceData, driver, group, raceDates, excludePlayoffs, useStar);
    if (driverRaces.length === 0) return "-";
    const totalFantasyPoints = driverRaces.reduce((sum, race) => sum + race.finish_position_points + race.stage_points, 0);
    return (totalFantasyPoints / driverRaces.length).toFixed(2);
  };
  
  // 📌 Utility function to format dates as "Spring/Fall YEAR"
  export const getSeasonLabel = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
  
    if (month < 6) return `Spring ${year}`;
    if (month < 9) return `Summer ${year}`;
    return `Fall ${year}`;
  };
  