import pandas as pd
from typing import Tuple, Any
import json

import data_processing
from process_data import FeatureProcessor


class DataProcessor:
    def update_data(self):
        df, (next_race_data, last_race_data) = self.get_stats()
        print(df)
        with open('data/next_race_data.json', 'w') as file:
            json.dump(next_race_data, file)
        with open('../data/next_race_data.json', 'w') as file:
            json.dump(next_race_data, file)
        with open('data/last_race_data.json', 'w') as file:
            json.dump(last_race_data, file)
        standings = pd.DataFrame(self.get_standings(
            last_race_data['last_race_season'],
            last_race_data['last_race_number']
        ))[['driver_name', 'position', 'race_season_points', 'race_playoff_points']]
        standings.to_json('../data/standings.json', orient='records')
        groups = self.make_fantasy_groups(standings)
        df = df.merge(groups, on='driver_name')
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
                     }
            raw_standings_data.append(current_row)
        print(race_number, season_year)
        season_standings_data = data_processing.compose_season_standings_data(raw_standings_data,
                                                                              race_number,
                                                                              season_year)
        return season_standings_data
    
    def make_fantasy_groups(self, standings: pd.DataFrame) -> pd.DataFrame:
        standings = standings.sort_values('position', ascending=True)
        standings['open_group'] = 'I-II'
        standings.loc[standings['position'] > 16, 'open_group'] = 'III'
        standings.loc[standings['position'] > 28, 'open_group'] = 'IV'

        standings['star_group'] = 'I'
        standings.loc[standings['position'] > 10, 'star_group'] = 'II'
        standings.loc[standings['position'] > 20, 'star_group'] = 'III'
        standings.loc[standings['position'] > 30, 'star_group'] = 'IV'
        return standings[['driver_name', 'open_group', 'star_group']]
    
if __name__ == "__main__":
    updater = DataProcessor()
    updater.update_data()