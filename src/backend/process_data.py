import pandas as pd
from datetime import datetime

from entry_list import drivers_2025

seasons = [2022, 2023, 2024, 2025]


class FeatureProcessor:

    def prepare_dataset(self) -> pd.DataFrame:
        data = self.load_data_csv()
        data = self.process_features(data)
        return data
    
    def load_data_csv(self) -> pd.DataFrame:
        res = pd.read_csv('data/race_results.csv')
        race_data = pd.read_csv('data/race_data.csv')
        race_data_cols = [col for col in race_data.columns if col not in ['race_name']]
        df = res.merge(race_data[race_data_cols], on=['season_year', 'race_number'], how='inner')

        track = pd.read_csv('data/track_data.csv')
        track_cols = ['track_name', 'track_type']
        df = df.merge(track[track_cols], on='track_name', how='left')

        standings = pd.read_csv('data/standings.csv')
        standings_cols = [col for col in standings.columns]
        df = df.merge(standings[standings_cols], on=['season_year', 'race_number', 'driver_name'], how='inner')
        df['race_date'] = pd.to_datetime(df['race_date'])
        df = df.sort_values(['driver_name', 'race_date'])
        calendar = pd.read_csv('data/calendar.csv')
        calendar['race_date'] = pd.to_datetime(calendar['race_date']).dt.date
        calendar['track_type'] = 'Superspeedway'
        df = df.merge(calendar[['season_year', 'race_number', 'season_stage']], on=['season_year', 'race_number'])
        df = df[df['driver_name'].isin(drivers_2025)].reset_index(drop=True)
        df = df[df['season_year'].isin(seasons)].reset_index(drop=True)
        self._get_next_race(calendar)
        return df
    
    def _get_next_race(self, track_data: pd.DataFrame) -> None:
        last_race_date = track_data[track_data['race_date'] < datetime.now().date()]['race_date'].max()
        next_race_date = track_data[track_data['race_date'] > last_race_date]['race_date'].min()
        next_race = track_data[track_data['race_date'] == next_race_date][['track_name', 'track_type', 'season_year', 'race_number']]
        last_race = track_data[track_data['race_date'] == last_race_date][['track_name', 'track_type', 'season_year', 'race_number']]
        self.next_race_data = {
            'next_race_date': next_race_date.strftime('%Y-%m-%d'),
            'next_race_season': int(next_race['season_year'].values[0]),
            'next_race_number': int(next_race['race_number'].values[0]),
            'next_race_track': next_race['track_name'].values[0],
            'next_race_track_type': next_race['track_type'].values[0],
        }
        self.last_race_data = {
            'last_race_date': last_race_date.strftime('%Y-%m-%d'),
            'last_race_season': int(last_race['season_year'].values[0]),
            'last_race_number': int(last_race['race_number'].values[0]),
            'last_race_track': last_race['track_name'].values[0],
            'last_race_track_type': last_race['track_type'].values[0],
        }
        return
    
    def process_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df = self.process_status(df)
        df = self.process_rare_tracks(df)
        # df = self.fill_stage_nan(df)
        df = self.stage_pos_to_points(df)
        return df

    def process_status(self, df: pd.DataFrame) -> pd.DataFrame:
        status_map = dict()
        for val in df['status'].values:
            if val == 'running':
                status_map[val] = 'finished'
            elif val == 'crash':
                status_map[val] = 'crash'
            elif val == 'disqualified':
                status_map[val] = 'dq'
            else:
                status_map[val] = 'failure'
        for status, new_status in status_map.items():
            df.loc[df['status'] == status, 'status'] = new_status
        return df
    
    def process_rare_tracks(self, df: pd.DataFrame) -> pd.DataFrame:
        track_types = {'Daytona Intl. Speedway Road Course': 'Road Course',
            'Bristol Motor Speedway Dirt Track': 'Short Track',
            'Dover International Speedway': 'Intermediate',
            'Indianapolis Grand Prix Circuit': 'Road Course'}
        for track_name, track_type in track_types.items():
            df.loc[df['track_name'] == track_name, 'track_type'] = track_type
        return df

    def fill_stage_nan(self, df: pd.DataFrame) -> pd.DataFrame:
        for col in ['stage_1_pos', 'stage_2_pos', 'stage_3_pos']:
            df.loc[df[col] == 0, col] = float('nan')
        return df
    
    def stage_pos_to_points(self, df: pd.DataFrame) -> pd.DataFrame:
        stage_points_map = {1: 10, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 0: 0}
        for col in ['stage_1_pos', 'stage_2_pos', 'stage_3_pos']:
            stage_points = [stage_points_map[int(pos)] for pos in df[col].values]
            new_col = '_'.join(col.split('_')[:2] + ['pts'])
            df[new_col] = stage_points
        return df
