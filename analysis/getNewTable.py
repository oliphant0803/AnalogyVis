import pandas as pd
import re

def main():
    # Read the original CSV data
    data = pd.read_csv('76.csv')

    # Get the list of all column names
    cols = data.columns.tolist()

    # Patterns to match 'Timer 1_First Click' to 'Timer 8_First Click' and corresponding 'Timer 1_Last Click' to 'Timer 8_Last Click'
    pattern_first_click = re.compile(r'(?i)timer (\d+)[\s_]*_first click(?:\.(\d+))?$')
    pattern_last_click = re.compile(r'(?i)timer (\d+)[\s_]*_last click(?:\.(\d+))?$')

    # Initialize list to hold processed data
    processed_rows = []

    for index, row in data.iterrows():
        participant_id = row['PROLIFIC_PID']
        response_id = row['ResponseId']

        # Collect all 'First Click' and 'Last Click' columns for the participant
        first_click_cols = [col for col in cols if pattern_first_click.match(col)]
        last_click_cols = [col for col in cols if pattern_last_click.match(col)]

        # Group columns by their occurrence (suffix or lack thereof)
        first_click_sets = {}
        last_click_sets = {}

        for col in first_click_cols:
            match = pattern_first_click.match(col)
            question_num = match.group(1)
            suffix = match.group(2) or '0'
            if suffix not in first_click_sets:
                first_click_sets[suffix] = {}
            first_click_sets[suffix][question_num] = col

        for col in last_click_cols:
            match = pattern_last_click.match(col)
            question_num = match.group(1)
            suffix = match.group(2) or '0'
            if suffix not in last_click_sets:
                last_click_sets[suffix] = {}
            last_click_sets[suffix][question_num] = col
            

        # Identify the sets that have data for all questions from 1 to 8
        sets_with_data = []
        suffixes = sorted(first_click_sets.keys(), key=lambda x: int(x))
        # print(participant_id, suffixes)
        for suffix in suffixes:
            fc_set = first_click_sets[suffix]
            lc_set = last_click_sets.get(suffix, {})
            has_all_data = True
            time_spent = 0
            for q in range(1, 9):
                q_str = str(q)
                fc_col = fc_set.get(q_str)
                lc_col = lc_set.get(q_str)
                if fc_col and lc_col:
                    fc_value = row[fc_col]
                    lc_value = row[lc_col]
                    # print(fc_col, lc_col)
                    if pd.notna(fc_value) and pd.notna(lc_value):
                        try:
                            time_spent += float(lc_value) - float(fc_value)
                        except ValueError:
                            # has_all_data = False
                            break
                    else:
                        # has_all_data = False
                        break
                else:
                    # has_all_data = False
                    break
            if has_all_data:
                sets_with_data.append({
                    'suffix': suffix,
                    'time_spent': time_spent
                })
            # print(participant_id, sets_with_data)
            count = 0
            for data in sets_with_data:
                if data['time_spent'] > 900:
                    count += 1
            if count == 2:
                print(participant_id, sets_with_data)
                break  # Only need the first two sets with data

        if count < 2:
            print(f"Participant {participant_id} does not have two complete sets. Skipping.")
            continue

        # Assign techniques and orders (first occurrence is 'analogy', second is 'baseline')
        techniques = ['analogy', 'baseline']
        if row['Group'] == '1':
            orders = ['first', 'second']
        elif row['Group'] == '2':
            orders = ['second', 'first']

        for i in range(2):
            sets_with_nonzero_time_spent = [data for data in sets_with_data if data['time_spent'] != 0]
            time_spent = sets_with_nonzero_time_spent[i]['time_spent']
            technique = techniques[i]
            order = orders[i]

            # Calculate dominant VARK modality
            vark_types = ['V', 'A', 'R', 'K']
            vark_counts = {v: 0 for v in vark_types}
            for j in range(1, 17):
                vark_col = f'VARK {j}'
                if vark_col in row and pd.notna(row[vark_col]):
                    vark_values = str(row[vark_col]).split(',')
                    for v in vark_values:
                        v = v.strip()
                        if v in vark_types:
                            vark_counts[v] += 1
            max_count = max(vark_counts.values())
            dominant_varks = [v for v, count in vark_counts.items() if count == max_count]
            dominant_vark = ''
            for v in vark_types:
                if v in dominant_varks:
                    dominant_vark = v
                    break

            # Build the data entry
            data_entry = {
                'PROLIFIC_PID': participant_id,
                'ResponseId': response_id,
                'Order': order,
                'Technique': technique,
                'Time': time_spent,
                'PerformanceScore': '',
                'DescriptionScore': '',
                'ChartDifficulties': '',
                'VARK': dominant_vark
            }
            processed_rows.append(data_entry)

    # Build the result DataFrame
    result_df = pd.DataFrame(processed_rows)

    # Reorder the columns
    result_df = result_df[['PROLIFIC_PID', 'ResponseId', 'Order', 'Technique', 'Time',
                           'PerformanceScore', 'DescriptionScore', 'ChartDifficulties', 'VARK']]

    # Save to CSV
    result_df.to_csv('dataAnalysis.csv', index=False)
    print("dataAnalysis.csv has been created successfully.")

if __name__ == '__main__':
    main()