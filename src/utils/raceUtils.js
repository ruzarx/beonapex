// 📌 Utility function to filter driver races based on playoffs
export const filterDriverRaces = (raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar) => {
    const groupType = useStar ? 'star_group' : 'open_group';
    return raceData.filter(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        raceDates.includes(entry.race_date) &&
        (!excludePlayoffs || entry.season_stage === "season") &&
        (!excludeDnf || entry.status === 'finished')
    );
    
  };

  // 📌 Utility function to calculate average finish position
  export const getAverageFeatureValue = (raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar, feature) => {
    console.log(raceDates);
    const driverRaces = filterDriverRaces(raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar);
    if (driverRaces.length === 0) return "-";
    const totalFeatureValue = driverRaces.reduce((sum, race) => sum + race[feature], 0);
    return (totalFeatureValue / driverRaces.length).toFixed(2);
  };
  
  // 📌 Utility function to get a driver's finish position in a specific race
  export const getFeatureValue = (raceData, driver, raceDate, group, track, excludePlayoffs, excludeDnf, useStar, feature) => {
    const groupType = useStar ? 'star_group' : 'open_group';
    const raceEntry = raceData.find(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        entry.race_date === raceDate &&
        entry.track_name === track &&
        (!excludePlayoffs || entry.season_stage === "season") &&
        (!excludeDnf || entry.status === 'finished')
    );
    console.log(group, raceEntry);
    // return raceEntry ? raceEntry[feature] : "-";
    if (!raceEntry) return { value: "-", status: "unknown" };
    return { value: raceEntry[feature], status: raceEntry.status };
  };

  export const getAverageSeasonFeatureValue = (raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar, feature) => {
    console.log(raceDates);
    const driverRaces = filterDriverRaces(raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar);
    if (driverRaces.length === 0) return "-";
    const totalFeatureValue = driverRaces.reduce((sum, race) => sum + race[feature], 0);
    return (totalFeatureValue / driverRaces.length).toFixed(2);
  };

  export const getFantasyPoints = (raceData, driver, raceDate, group, track, excludePlayoffs, excludeDnf, useStar) => {
    const groupType  = useStar ? 'star_group' : 'open_group';
    const raceEntry = raceData.find(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        entry.race_date === raceDate &&
        entry.track_name === track &&
        (!excludePlayoffs || entry.season_stage === "season") &&
        (!excludeDnf || entry.status === 'finished')
    );
    if (!raceEntry) return { value: "-", status: "unknown" };
    return { value: raceEntry.finish_position_points + raceEntry.stage_points, status: raceEntry.status };
    // return raceEntry ? raceEntry.finish_position_points + raceEntry.stage_points : "-";
  };

  export const getAverageFantasyPoints = (raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar) => {
    const driverRaces = filterDriverRaces(raceData, driver, group, raceDates, excludePlayoffs, excludeDnf, useStar);
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
  