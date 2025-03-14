import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DriverPerformanceChart = ({ raceData, drivers }) => {
    const [selectedDrivers, setSelectedDrivers] = useState(["Tyler Reddick", "William Byron", "Christopher Bell"]);

    useEffect(() => {
        // Reset selected drivers when driver list changes (i.e., group selection changes)
        if (drivers.length > 0) {
            setSelectedDrivers([drivers[0], drivers[1], drivers[2]]);
        }
    }, [drivers]);


    const handleChange = (event) => {
        const value = event.target.value;
        setSelectedDrivers(value.slice(0, 3)); // Limit selection to 3 drivers
    };

    // Get current season year
    const currentSeasonYear = Math.max(...raceData.map(race => race.season_year));
    
    // Filter races for the current season
    const seasonRaces = raceData.filter(race => race.season_year === currentSeasonYear);
    const raceLabels = Array.from(new Set(seasonRaces.map(race => race.track_name)));

    const getDriverData = (driver) => {
        const driverRaces = seasonRaces.filter(race => race.driver_name === driver);
        const positions = driverRaces.map(race => race.race_pos);
        const avgPosition = positions.length ? (positions.reduce((a, b) => a + b, 0) / positions.length) : null;

        return { positions, avgPosition };
    };

    const colors = ["red", "blue", "green"];

    const chartData = {
        labels: raceLabels, // Track names instead of dates
        datasets: selectedDrivers.map((driver, index) => {
            const { positions, avgPosition } = getDriverData(driver);
            const color = colors[index % colors.length];
            return [
                {
                    label: `${driver} Positions`,
                    data: positions,
                    borderColor: color,
                    backgroundColor: color,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                },
                {
                    label: `${driver} Avg Position`,
                    data: Array(positions.length).fill(avgPosition),
                    borderColor: color,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.2,
                }
            ];
        }).flat()
    };

    const chartOptions = {
        scales: {
            y: {
                reverse: true, // Reverse Y-axis so position 1 is at the top
                beginAtZero: false,
                ticks: {
                    stepSize: 1, // Ensure step size is 1 for race positions
                }
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div style={{ height: "400px" }}> {/* Reduce chart height */}
            <FormControl fullWidth>
                {/* <InputLabel>Select Drivers</InputLabel> */}
                <Select
                    multiple
                    value={selectedDrivers}
                    onChange={handleChange}
                    renderValue={(selected) => selected.join(", ")}
                >
                    {drivers.map(driver => (
                        <MenuItem key={driver} value={driver}>{driver}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};

export default DriverPerformanceChart;
