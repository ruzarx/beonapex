import pandas as pd
from typing import Tuple, Any
import json

import data_processing
from process_data import FeatureProcessor
from entry_list import drivers_2025


class DataProcessor:
    def update_data(self):
        df, (next_race_data, last_race_data) = self.get_stats()
        with open('data/next_race_data.json', 'w') as file:
            json.dump(next_race_data, file)
        with open('../data/next_race_data.json', 'w') as file:
            json.dump(next_race_data, file)
        with open('data/last_race_data.json', 'w') as file:
            json.dump(last_race_data, file)
        standings = pd.DataFrame()
        for season_year in range(2025, int(last_race_data['last_race_season']) + 1):
            season_standings = pd.DataFrame()
            for race_number in range(1, 37):
                if (season_year == int(last_race_data['last_race_season'])) & (race_number > int(last_race_data['last_race_number'])):
                    break
                current_standings = pd.DataFrame(self.get_standings(season_year, race_number))
                season_standings = pd.concat([season_standings, current_standings])
            car_numbers = df[df['season_year'] == season_year][['driver_name', 'car_number']].drop_duplicates()
            season_standings = season_standings.merge(car_numbers, on='driver_name')
            standings = pd.concat([standings, season_standings])
        standings = standings.merge(df[['season_year', 'race_number', 'race_date']].drop_duplicates(), on=['season_year', 'race_number'])
        standings.to_json('../data/standings.json', orient='records')
        groups = self.make_fantasy_groups(standings)
        df = df.merge(groups, on='driver_name', how='left')
        df.to_json('../data/data.json', orient='records')
        return

    def get_stats(self) -> Tuple[pd.DataFrame, Tuple[Any]]:
        feature_processor = FeatureProcessor()
        df = feature_processor.prepare_dataset()
        next_race_data = feature_processor.next_race_data
        last_race_data = feature_processor.last_race_data
        return df, (next_race_data, last_race_data)

    def get_standings(self, season_year: int, race_number: int) -> pd.DataFrame:
        raw_data = pd.read_csv('data/standings.csv')
        race_res = pd.read_csv('data/race_results.csv', usecols=['driver_name', 'season_year', 'race_number', 'race_pos'])
        raw_data = raw_data.merge(race_res, on=['driver_name', 'season_year', 'race_number'])
        raw_data = raw_data[raw_data['season_year'] == season_year].reset_index(drop=True)
        raw_standings_data = []
        for result in raw_data.iterrows():
            current_row = {
                        "driver_name": result[1]['driver_name'],
                        "wins": result[1]['wins'],
                        "stage_wins": result[1]['stage_wins'],
                        "race_stage_points": result[1]['race_stage_points'],
                        "race_finish_points": result[1]['race_finish_points'],
                        "race_season_points": result[1]['race_season_points'],
                        "race_playoff_points": result[1]['race_playoff_points'],
                        "race_number": result[1]['race_number'],
                        "season_year": int(season_year),
                        "race_pos": result[1]['race_pos'],
                     }
            raw_standings_data.append(current_row)
        season_standings_data = data_processing.compose_season_standings_data(raw_standings_data,
                                                                              race_number,
                                                                              season_year)
        return season_standings_data
    
    def make_fantasy_groups(self, standings: pd.DataFrame) -> pd.DataFrame:
        standings = standings[standings['driver_name'].isin(drivers_2025)].reset_index(drop=True)
        standings = standings.sort_values('car_position', ascending=True)
        standings['open_group'] = 'I-II'
        standings.loc[standings['car_position'] > 16, 'open_group'] = 'III'
        standings.loc[standings['car_position'] > 28, 'open_group'] = 'IV'

        standings['star_group'] = 'I'
        standings.loc[standings['car_position'] > 10, 'star_group'] = 'II'
        standings.loc[standings['car_position'] > 20, 'star_group'] = 'III'
        standings.loc[standings['car_position'] > 30, 'star_group'] = 'IV'
        return standings[['driver_name', 'open_group', 'star_group']]
    
if __name__ == "__main__":
    updater = DataProcessor()
    updater.update_data()