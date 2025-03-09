// 📌 Utility function to filter driver races based on playoffs
export const filterDriverRaces = (raceData, driver, group, track, excludePlayoffs, useStar) => {
    const groupType = useStar ? 'star_group' : 'open_group';
    return raceData.filter(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        entry.track_name === track &&
        (!excludePlayoffs || entry.season_stage === "season") // Exclude playoffs if toggle is on
    );
  };
  
  // 📌 Utility function to calculate average finish position
  export const getAverageFinishPosition = (raceData, driver, group, track, excludePlayoffs, useStar) => {
    const driverRaces = filterDriverRaces(raceData, driver, group, track, excludePlayoffs, useStar);
    if (driverRaces.length === 0) return "-";
    const totalFinishPositions = driverRaces.reduce((sum, race) => sum + race.race_pos, 0);
    return (totalFinishPositions / driverRaces.length).toFixed(2);
  };
  
  // 📌 Utility function to get a driver's finish position in a specific race
  export const getFinishPosition = (raceData, driver, raceDate, group, track, excludePlayoffs, useStar) => {
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
    return raceEntry ? raceEntry.race_pos : "-";
  };

  export const getAverageStartPosition = (raceData, driver, group, track, excludePlayoffs, useStar) => {
    const driverRaces = filterDriverRaces(raceData, driver, group, track, excludePlayoffs, useStar);
    if (driverRaces.length === 0) return "-";
    const totalStartPositions = driverRaces.reduce((sum, race) => sum + race.quali_pos, 0);
    return (totalStartPositions / driverRaces.length).toFixed(2);
  };
  
  // 📌 Utility function to get a driver's finish position in a specific race
  export const getStartPosition = (raceData, driver, raceDate, group, track, excludePlayoffs, useStar) => {
    const groupType = useStar ? 'star_group' : 'open_group';
    const raceEntry = raceData.find(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        entry.race_date === raceDate &&
        entry.track_name === track &&
        (!excludePlayoffs || entry.season_stage === "season")
    );
    return raceEntry ? raceEntry.quali_pos : "-";
  };

  export const getFantasyPoints = (raceData, driver, raceDate, group, track, excludePlayoffs, useStar) => {
    const groupType  = useStar ? 'star_group' : 'open_group';
    const raceEntry = raceData.find(
      (entry) =>
        entry.driver_name === driver &&
        entry[groupType] === group &&
        entry.race_date == raceDate &&
        entry.track_name === track &&
        (!excludePlayoffs || entry.season_stage === "season")
    );
    return raceEntry ? raceEntry.finish_position_points + raceEntry.stage_points : "-";
  };

  export const getAverageFantasyPoints = (raceData, driver, group, track, excludePlayoffs, useStar) => {
    const driverRaces = filterDriverRaces(raceData, driver, group, track, excludePlayoffs, useStar);
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
  