import requests
from bs4 import BeautifulSoup
import pandas as pd
import datetime
import os


class DataParser():

    """
    A class used to process races results parsing from the official Formula-1 web-site.

    ...

    Attributes
    ----------

    start_year : str, int
        a year, from which data parsing should be started
    save_path : str
        a relative path, to where parsed data should be saved (TO BE CORRECTED AFTER MIGRATION TO SQL)
    """

    def __init__(self, start_year=2025, save_path='Backend//Data_Extraction/data/'):

        """
        Parameters
        ----------
        start_year : str, int
            a year, from which data parsing should be started
        save_path : str
            a relative path, to where parsed data should be saved (TO BE CORRECTED AFTER MIGRATION TO SQL)
        """

        self.__current_year = datetime.datetime.now().year
        self.start_year = start_year if self.__year_checker(start_year) else 2015
        self.save_path = save_path
        # self.__directory_creator()
        self.__races_in_base = None
        self.__base_url = 'https://www.formula1.com/en/results/'
        self.race_list = self.__collect_races()
        self.__run_parser()

    def __year_checker(self, start_year):
        """
        A method to check correctness of start_year input

        Parameters
        ----------
        start_year : str, int
            a year, from which data parsing should be started

        Raises
        ------
        ValueError
            if start year input format is incorrect (not transformable to int or outside available years range - 1950 to current)

        Returns
        -------
        bool
            if input year is correct or not
        """
        try:
            start_year = int(start_year)
            return True if start_year in range(1950, self.__current_year + 1) else False
        except ValueError:
            print('Input year format is incorrect')
            return False

    def __collect_races(self):
        """
        A method to check if required data is already available and run race list collection process

        Returns
        -------
        list : 
            result of __race_list_collector method
        """
        races_in_net = self.__race_list_collector()
        if not self.__races_in_base:
            return races_in_net
        else:
            return [x for x in races_in_net if int(x[1]) not in range(self.__races_in_base[0], self.__races_in_base[1]+ 1)]

    def __race_list_collector(self):
        """
        A method to collect a list of races necessary for parsing within chosen years range

        Returns
        -------
        None
        """
        all_races = []
        for year in range(int(self.start_year), self.__current_year + 1):
            url = self.__base_url + str(year) + '/races'
            all_races.append(self.__links_list(self.__get_html(url)))
        return [f"{self.__base_url}{self.start_year}/{item}" for sublist in all_races for item in sublist]

    def __links_list(self, html):
        """
        A method to parse list of races, available on the F1 web, their locations and numbers

        Parameters
        ----------

        html : str
            an html page text of a chosen race result page

        Returns
        -------
        items : list
            list of the following structure [str: race year, str: race index number, str: race location]
        """
        soup = BeautifulSoup(html, 'lxml')
        pages = soup.find(
            'table',
            class_ = 'f1-table f1-table-with-data w-full'
            ).find_all(
                'a',
                class_ = 'underline underline-offset-normal decoration-1 decoration-greyLight hover:decoration-brand-primary')
        items = []
        for page in pages:
            values = page.get('href')
            items.append(values)
        return items

    def __get_html(self, url):
        """
        A method to get html page content from an url

        Parameters
        ----------
        url : str
            url of the target page
        
        Returns
        ------
        str :
            html page text contents
        """
        print('Getting page', url)
        r = requests.get(url)
        return r.text

    def __directory_creator(self):
        """
        A method to check if all necessary directories for data save exist.
        If not - creates them

        Returns
        -------
        None
        """
        if not os.path.exists(self.save_path): os.mkdir(self.save_path)
        for session_dir in ['practice-1', 'practice-2', 'practice-3', 'qualifying', 'race']:
            if not os.path.exists(self.save_path + session_dir): os.mkdir(self.save_path + session_dir)
        return

    def __get_page_data(self, html):
        """
        A method to parse one results page

        Parameters
        ---------
        html : str
            html page text containing results table

        Returns
        -------
        pd.DataFrame
            A dataframe with session results
        """
        soup = BeautifulSoup(html, 'lxml')
        table = soup.find('div', class_ = 'resultsarchive-col-right')

        soup = BeautifulSoup(str(table.contents), 'lxml')
        table = soup.find("table", attrs={"class":"resultsarchive-table"})

        # The first tr contains the field names.
        cols = [th.get_text().lower() for th in table.find("tr").find_all("th")]
        
        line = []
        for row in table.find_all("tr")[1:]:
            line.append([td.get_text() for td in row.find_all("td")])

        # Creating dataframe to manage the data    
        df = pd.DataFrame(line, columns=cols)

        df = self.__drop_columns(df)
        df['pos'] = self.__pos_processing(df['pos'].values)

        # Fixing drivers names as official abbreviations
        df['driver'] = [x.replace('\n', ' ')[-4:] for x in df['driver']]

        return df

    def __drop_columns(self, df, cols_to_drop=['no', 'pts', '']):
        """
        A method to drop unnecessary columns from the dataset

        Parameters
        ----------
        df : pd.DataFrame
            a dataframe to be cleaned
        cols_to_drop : list of str
            a list of columns to be dropped

        Returns
        -------
        pd.DataFrame
            cleaned dataset
        """
        for col in cols_to_drop:
            if col in df.columns:
                df = df.drop(col, axis=1)
        return df

    def __pos_processing(self, positions):
        """
        A method to transform positions column to integer, as non classified drivers are depicted as NC pr DNF

        Parameters
        ----------
        positions : np.array
            a list of positions values
        
        Returns
        -------
        np.array
            fixed array of positions with text values substituted by numbers
        """
        counter = 1
        for i in range(len(positions)):
            if positions[i] == '1':
                counter = 1
            if not positions[i].isdigit():
                positions[i] = counter
            counter += 1
        return positions.astype(int)

    def __run_parser(self):
        """
        A method to run parsing procedure

        Returns
        -------
        None
        """
        print('\nPARSING PRACTICES', end = '\n\n')
        self.__practice_parse()
        print('\nPARSING QUALIFICATIONS', end = '\n\n')
        self.__qualification_parse()
        print('\nPARSING RACES', end = '\n\n')
        self.__race_parse()
        print('\nParsing is done')
        return

    def __practice_parse(self):
        """
        A method to parse all practice sessions of all races within the list of necessary races.
        It runs through each race, parse separate tables for Practice 1, Practice 2 and Practice 3,
        enriches it with session name, year, race index and track location info and saves it to csv
        within self.__data_path/session/race.csv

        Returns
        None
        """

        for race in self.race_list:

            print('Practice', race[0], race[2])

            url = self.__base_url + race[0] + '/races/' + race[1] + '/' + race[2] + '/'
            
            # Parsing 3 practice sessions separately into tables
            for ses in ['practice-1', 'practice-2', 'practice-3']:

                # Check if file exists
                if os.path.isfile(self.save_path + ses + '/' + race[0] + '_' + race[1] + '_' + race[2] + '.csv'):
                    continue

                # If not, parse it
                url_gen = url + ses + '.html'
                html = self.__get_html(url_gen)
                df = self.__get_page_data(html)
                df['session'] = ses
                df['year'] = race[0]
                df['raceno'] = race[1]
                df['track'] = race[2]
                df['id'] = df['pos'].astype(str) + '-' + df['session'] + '-' + df['raceno']
                #df.to_csv(self.save_path + ses + '/' + race[0] + '_' + race[1] + '_' + race[2] + '.csv', index = False)
        return

    def __qualification_parse(self):
        """
        A method to parse all qualification sessions of all races within the list of necessary races.
        It runs through each race, parse separate tables each Qualifying session,
        enriches it with session name, year, race index and track location info and saves it to csv
        within self.__data_path/session/race.csv

        Returns
        None
        """

        for race in self.race_list:

            print('Qualification', race[0], race[2])

            url_gen = self.__base_url + race[0] + '/races/' + race[1] + '/' + race[2] + '/qualifying.html'

            # Check if file exists
            if os.path.isfile(self.save_path + 'qualifying/' + race[0] + '_' + race[1] + '_' + race[2] + '.csv'):
                continue

            # If not, parse it
            html = self.__get_html(url_gen)
            df = self.__get_page_data(html)
            df['year'] = race[0]
            df['raceno'] = race[1]
            df['track'] = race[2]
            df['id'] = df['pos'].astype(str) + '-qualification-' + df['raceno']
            #df.index = range(self.__qualy_primary_key, self.__qualy_primary_key + df.shape[0])
            #df.to_csv(self.save_path + 'qualifying/' + race[0] + '_' + race[1] + '_' + race[2] + '.csv', index = False)
        return

    def __race_parse(self):
        """
        A method to parse all race sessions of all races within the list of necessary races.
        It runs through each race, parse separate tables each Race session,
        enriches it with session name, year, race index and track location info and saves it to csv
        within self.__data_path/session/race.csv

        Returns
        None
        """

        for race in self.race_list:

            print('Race', race[0], race[2])

            url_gen = self.__base_url + race[0] + '/races/' + race[1] + '/' + race[2] + '/race_result.html'

            # Check if file exists
            if os.path.isfile(self.save_path + 'race/' + race[0] + '_' + race[1] + '_' + race[2] + '.csv'):
                continue

            html = self.__get_html(url_gen)
            df = self.__get_page_data(html)
            df['year'] = race[0]
            df['raceno'] = race[1]
            df['track'] = race[2]
            df = df.rename(columns={'time/retired': 'time'})
            df['id'] = df['pos'].astype(str) + '-race-' + df['raceno']
            #df.index = range(self.__race_primary_key, self.__race_primary_key + df.shape[0])
            #df.to_csv(self.save_path + 'race/' + race[0] + '_' + race[1] + '_' + race[2] + '.csv', index = False)
        return

if __name__ == '__main__':
    parser = DataParser()
    