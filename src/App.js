import React, { useState } from "react";
import RaceSeriesMenu from "./components/RaceSeriesMenu";
import MainFantasyScreen from "./components/fantasy/MainFantasyScreen";
// import StatisticsScreen from "./components/nascar/StatisticsScreen";
// import FunScreen from "./components/nascar/FunScreen";

const App = () => {
  const [currentSeries, setCurrentSeries] = useState("NASCAR");
  const [currentNascarTab, setCurrentNascarTab] = useState("Fantasy"); // Default NASCAR sub-menu tab

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Top Menu for Series Selection + NASCAR Sub-Menu */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4">
        <RaceSeriesMenu onSeriesChange={setCurrentSeries} onNascarSubMenuChange={setCurrentNascarTab} />
      </div>

      {/* NASCAR Screens Based on Selection */}
      <div className="max-w-4xl mx-auto mt-4">
        {currentSeries === "NASCAR" && currentNascarTab === "Fantasy" && <MainFantasyScreen />}
        {/* Uncomment when adding Statistics and Fun tabs */}
        {/* {currentSeries === "NASCAR" && currentNascarTab === "Statistics" && <StatisticsScreen />} */}
        {/* {currentSeries === "NASCAR" && currentNascarTab === "Fun" && <FunScreen />} */}
      </div>

      {/* Placeholder for other series */}
      {currentSeries !== "NASCAR" && currentSeries !== "" && (
        <div className="text-center mt-4 text-lg font-semibold text-gray-700">
          {currentSeries} section coming soon!
        </div>
      )}
    </div>
  );
};

export default App;
