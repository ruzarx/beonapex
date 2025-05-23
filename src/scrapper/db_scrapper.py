import os
import csv
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import re
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def scrap_race(season: int, race_number: int) -> bool:
    url_race_number = str(race_number) if len(str(race_number)) == 2 else f"0{race_number}"
    url = f'https://www.racing-reference.info/race/{season}-{url_race_number}/W'
    url_loop = f'https://www.racing-reference.info/loopdata/{season}-{url_race_number}/W'
    print(url)
    print(url_loop)
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--remote-debugging-port=9222")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        wait = WebDriverWait(driver, 10)

        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')

        try:
            race_meta_info = soup.find(class_='raceMetaInfo')
            name_of_the_race = race_meta_info.find('h1').text.strip().replace('/', '').replace('  ', ' ')
            print(name_of_the_race)
            splitted_name = [x.strip() for x in name_of_the_race.split(' ')]
            if len(splitted_name) == 1:
                return False
            race_year = splitted_name[0]
            folder_name = str(race_number)
            if not os.path.exists('data'):
                os.makedirs('data')
            if not os.path.exists(f'data/{race_year}'):
                os.makedirs(f'data/{race_year}')
            b_tags = soup.find_all('b')
            date = ""
            location = ""

            for b_tag in b_tags:
                if 'race number' in b_tag.text:
                    date_tag = b_tag.find_next('a')
                    if date_tag:
                        date = date_tag.text.strip()
                        location_tag = date_tag.find_next('a')
                        if location_tag:
                            location = location_tag.text.strip()
                            location_sibling = location_tag.next_sibling
                            if location_sibling:
                                location += location_sibling.strip()
                    break

        except AttributeError as e:
            logging.error(f"Error extracting race information: {e}")
            raise

        try:
            folder_name = f"data/{race_year}/{folder_name}"
            if not os.path.exists(folder_name):
                os.makedirs(folder_name)
        except OSError as e:
            logging.error(f"Error creating directory: {e}")
            raise

        try:
            race_file_path = os.path.join(folder_name, f"race_info.csv")
            with open(race_file_path, 'w', newline='', encoding='utf-8') as csvfile:
                csv_writer = csv.writer(csvfile)
                csv_writer.writerow(['Name of the race', 'Date', 'Location'])
                csv_writer.writerow([name_of_the_race, date, location])
        except IOError as e:
            logging.error(f"Error saving race info: {e}")
            raise

        try:
            results_table = soup.find('table', class_='tb race-results-tbl')
            if results_table:
                filename = os.path.join(folder_name, "race_results.csv")
                with open(filename, mode='w', newline='', encoding='utf-8') as csv_file:
                    writer = csv.writer(csv_file)
                    headers = ["Pos", "St", "#", "Driver", "Sponsor / Owner", "Car", "Laps", "Status", "Led", "Pts", "PPts"]
                    writer.writerow(headers)
                    rows = results_table.find_all('tr')[1:]
                    if len(rows) < 2:
                        return False
                    for row in rows:
                        cells = row.find_all('td')
                        row_data = []
                        for cell in cells:
                            cell_text = re.sub(r'\xa0', ' ', cell.text.strip())
                            row_data.append(cell_text)
                        writer.writerow(row_data)
            else:
                logging.warning("Race results table not found")
        except Exception as e:
            logging.error(f"Error extracting or saving race results: {e}")

        try:
            top_10_stage1 = soup.find('b', string='Top 10 in Stage 1:')
            top_10_stage2 = soup.find('b', string='Top 10 in Stage 2:')
            top_10_stage3 = soup.find('b', string='Top 10 in Stage 3:')
            stage1_info = []
            stage2_info = []
            stage3_info = []

            if top_10_stage1:
                stage1_info = top_10_stage1.next_sibling.strip().split(', ')
            else:
                logging.warning("Top 10 in Stage 1 not found")

            if top_10_stage2:
                stage2_info = top_10_stage2.next_sibling.strip().split(', ')
            else:
                logging.warning("Top 10 in Stage 2 not found")

            if top_10_stage3:
                stage3_info = top_10_stage3.next_sibling.strip().split(', ')
            else:
                logging.warning("Top 10 in Stage 3 not found")

            top10_file_path = os.path.join(folder_name, 'top_10s.csv')
            with open(top10_file_path, 'w', newline='', encoding='utf-8') as csvfile:
                csv_writer = csv.writer(csvfile)
                csv_writer.writerow(['Top 10 in Stage 1:', 'Top 10 in Stage 2:', 'Top 10 in Stage 3:'])
                for i in range(max(len(stage1_info), len(stage2_info))):
                    row = [
                        stage1_info[i] if i < len(stage1_info) else '',
                        stage2_info[i] if i < len(stage2_info) else '',
                        stage3_info[i] if i < len(stage3_info) else ''
                    ]
                    csv_writer.writerow(row)
        except Exception as e:
            logging.error(f"Error extracting or saving top 10 stage info: {e}")

        try:
            caution_table = None
            tables = soup.find_all('table', class_='tb')
            for table in tables:
                header = table.find('td', class_='newhead')
                if header and 'Caution flag breakdown' in header.text:
                    caution_table = table
                    break

            if caution_table:
                caution_file_path = os.path.join(folder_name, 'caution_flags.csv')
                with open(caution_file_path, mode='w', newline='', encoding='utf-8') as csv_file:
                    writer = csv.writer(csv_file)
                    headers = ["Condition", "From Lap", "To Lap", "# Of Laps", "Reason", "Free Pass"]
                    writer.writerow(headers)
                    rows = caution_table.find_all('tr')[2:]
                    for row in rows:
                        cells = row.find_all('td')
                        row_data = []
                        for cell in cells:
                            if cell.find('img'):
                                img_src = cell.find('img')['src']
                                condition = img_src.split('/')[-1].split('.')[0]
                                row_data.append(condition)
                            else:
                                cell_text = re.sub(r'\xa0', ' ', cell.text.strip())
                                row_data.append(cell_text)
                        writer.writerow(row_data)
            else:
                logging.warning("Caution flag table not found")
        except Exception as e:
            logging.error(f"Error extracting or saving caution flag info: {e}")

        try:
            tables = soup.find_all('table', class_='tb')
            for table in tables:
                if table.find('td', class_='newhead') and 'Lap leader breakdown:' in table.find('td',
                                                                                                class_='newhead').text:
                    lap_leader_file_path = os.path.join(folder_name, 'lap_leaders.csv')
                    with open(lap_leader_file_path, 'w', newline='', encoding='utf-8') as csvfile:
                        csv_writer = csv.writer(csvfile)
                        csv_writer.writerow(['Leader', 'From Lap', 'To Lap', '# Of Laps'])
                        rows = table.find_all('tr')[2:]
                        for row in rows:
                            cells = row.find_all('td')
                            row_data = [cell.text.strip() for cell in cells]
                            csv_writer.writerow(row_data)
                    break
        except Exception as e:
            logging.error(f"Error extracting or saving lap leader info: {e}")

        try:
            tables = soup.find_all('table', class_='tb')
            for table in tables:
                if table.find('td', class_='newhead'):
                    if 'Points Standings after this race:' in table.find('td', class_='newhead').text:
                        points_standings_file_path = os.path.join(folder_name, 'points_standings.csv')
                        with open(points_standings_file_path, 'w', newline='', encoding='utf-8') as csvfile:
                            csv_writer = csv.writer(csvfile)
                            csv_writer.writerow(['Rank', 'Driver', 'Points', 'Diff'])
                            rows = table.find_all('tr')[2:]
                            for row in rows:
                                cells = row.find_all('td')
                                row_data = [cell.text.strip() for cell in cells]
                                csv_writer.writerow(row_data)
                        break
        except Exception as e:
            logging.error(f"Error extracting or saving points standings info: {e}")

        try:
            tables = soup.find_all('table', class_='tb')
            for table in tables:
                if table.find('td', class_='newhead'):
                    if 'Playoff standings after this race:' in table.find('td', class_='newhead').text:
                        playoff_standings_file_path = os.path.join(folder_name, 'playoff_standings.csv')
                        with open(playoff_standings_file_path, 'w', newline='', encoding='utf-8') as csvfile:
                            csv_writer = csv.writer(csvfile)
                            csv_writer.writerow(['Rank', 'Driver', 'Wins', 'Points'])
                            rows = table.find_all('tr')[2:]
                            for row in rows:
                                cells = row.find_all('td')
                                row_data = [cell.text.strip() for cell in cells]
                                csv_writer.writerow(row_data)
                        break
        except Exception as e:
            logging.error(f"Error extracting or saving playoff standings info: {e}")

    finally:
        driver.quit()
        logging.info("Driver quit successfully")

    driver = webdriver.Chrome(options=options)
    try:
        driver.get(url_loop)
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')

        try:
            results_table = soup.find('table', class_='tb loopData')
            if results_table:
                filename = os.path.join(folder_name, "loop_data.csv")
                with open(filename, mode='w', newline='', encoding='utf-8') as csv_file:
                    writer = csv.writer(csv_file)
                    headers = ["driver_name",
                            "start_pos",
                            "mid_race_pos",
                            "finish_pos",
                            "highest_pos",
                            "lowest_pos",
                            "avg_pos",
                            "pass_diff",
                            "green_flag_passes",
                            "green_flag_times_passed",
                            "quality_passes",
                            "pct_quality_passes",
                            "fastest_lap",
                            "top_15_laps",
                            "pct_top_15_laps",
                            "laps_led",
                            "pct_laps_led",
                            "total_laps",
                            "driver_rating"]
                    writer.writerow(headers)
                    rows = results_table.find_all('tr')[3:]
                    for row in rows:
                        cells = row.find_all('td')
                        row_data = []
                        for cell in cells:
                            cell_text = re.sub(r'\xa0', ' ', cell.text.strip())
                            row_data.append(cell_text)
                        writer.writerow(row_data)
            else:
                logging.warning("Race results table not found")
        except Exception as e:
            logging.error(f"Error extracting or saving race results: {e}")

    finally:
        driver.quit()
        logging.info("Driver quit successfully")
    return True
