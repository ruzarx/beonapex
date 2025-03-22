export const getStandings = (data, driver, feature) => {
    const driverRace = data.find((race) => race.driver_name === driver);
    if (!driverRace || !(feature in driverRace)) return "-";
    return driverRace[feature];
  };
  
  
  export const getBestFinish = (data, driver) => {
    const driverRaces = data.filter((race) => race.driver_name === driver);
    if (driverRaces.length === 0) return "-";
    return Math.min(...driverRaces.map((entry) => entry.best_position));
  };
  