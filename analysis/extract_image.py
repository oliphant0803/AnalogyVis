import csv
import os
import re

# Define the input and output file paths
input_file = './pilot.csv'
output_file = 'filtered_pilot.csv'

# Define the columns we want to extract
required_columns = ['ResponseId', 'PROLIFIC_PID', 'ChartType']

# Open the input CSV file and read the rows
with open(input_file, mode='r', newline='', encoding='utf-8') as infile:
    csv_reader = csv.DictReader(infile)
    
    # Create a list to store the filtered rows
    filtered_rows = []

    # Iterate over the rows and extract the required columns
    for row in csv_reader:
        filtered_row = {col: row[col] for col in required_columns if col in row}
        if filtered_row:
            filtered_rows.append(filtered_row)

# Write the filtered rows to the output CSV file
with open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
    # Specify the fieldnames (columns) for the new CSV
    writer = csv.DictWriter(outfile, fieldnames=required_columns)
    
    # Write the header (column names) to the new file
    writer.writeheader()
    
    # Write the filtered rows
    writer.writerows(filtered_rows)

print(f"Filtered CSV has been saved to: {output_file}")

#the sketches are stored in /Users/h2o/Desktop/pilotSketches


# Define the input and output file paths
input_file = 'filtered_pilot.csv'
output_file = 'filtered_pilot.csv'

# Define the sketches base directory
sketches_dir = '/Users/h2o/Desktop/pilotSketches'

# Define the chart type to folder mapping (chart type keywords)
chart_folder_mapping = {
    'bar': ['BarActual', 'BarAnalogy'],
    'heatmap': ['HeatmapActual', 'HeatmapAnalogy'],
    'sunburst': ['Sunburst Draw', 'SunburstAnalogy'],
    'histogram': ['HistogramActual', 'HistogramAnalogy'],
    'treemap': ['TreemapActual', 'TreemapAnalogy'],
    'bubble': ['BubbleActual', 'BubbleAnalogy'],
    'waterfall': ['WaterfallActual', 'WaterfallAnalogy'],
    'butterfly': ['ButterflyActual', 'ButterflyAnalogy'],
    'sankey': ['Sankey Draw', 'SankeyAnalogy'],
}


# Normalize function to make comparison case-insensitive and ignore non-alphabet characters
def normalize_string(s):
    # Remove non-alphabet characters and convert to lowercase
    return re.sub(r'[^a-zA-Z]', '', s).lower()

# Read the filtered CSV file and add the sketch paths
with open(input_file, mode='r', newline='', encoding='utf-8') as infile:
    csv_reader = csv.DictReader(infile)
    
    # Create a list to store the updated rows
    updated_rows = []

    # Iterate over the rows
    for row in csv_reader:
        chart_type = row['ChartType']  # Get the chart type
        response_id = row['ResponseId']  # Get the response ID
        
        # Normalize the chart type
        normalized_chart_type = normalize_string(chart_type)
        
        actual_folder, analogy_folder = None, None
        for keyword, folders in chart_folder_mapping.items():
            # Normalize folder names and check if the normalized chart type matches
            if normalize_string(keyword) in normalized_chart_type:
                actual_folder, analogy_folder = folders
                break

        if actual_folder and analogy_folder:
            # Construct the absolute paths for the actual and analogy sketches
            actual_path = os.path.join(sketches_dir, actual_folder, f"{response_id}_signature.png")
            analogy_path = os.path.join(sketches_dir, analogy_folder, f"{response_id}_signature.png")
            
            # Add the actual and analogy paths to the row
            row['actual'] = actual_path if os.path.exists(actual_path) else None
            row['analogy'] = analogy_path if os.path.exists(analogy_path) else None
            
            if(analogy_folder == "WaterfallAnalogy"):
                if row['analogy'] == None:
                    row['analogy'] = os.path.join(sketches_dir, "WaterfallAnalogy", f"{response_id}_signature.png")
        else:
            row['actual'] = None
            row['analogy'] = None
            
        # print(f"ChartType: {chart_type}, Normalized: {normalized_chart_type}")
        # print(f"Checking folders: {actual_folder}, {analogy_folder}")
        
        # Append the updated row to the list
        updated_rows.append(row)

# Write the updated rows to the output CSV file
with open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
    # Define the fieldnames, including the new columns
    fieldnames = csv_reader.fieldnames + ['actual', 'analogy']
    
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    
    # Write the header (column names)
    writer.writeheader()
    
    # Write the updated rows
    writer.writerows(updated_rows)

print(f"Updated CSV has been saved to: {output_file}")



#charts for tasks:
background_charts = {
    "stackedArea": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/stackedArea/actual.png, https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/stackedArea/StackedArea.png"],
    "waterfall": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/waterfall/actualTask.png", "https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/waterfall/WaterfallTask.png"],
    "butterfly": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/butterfly/Screenshot%202024-11-27%20at%207.16.59%20PM.png","https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/butterfly/ButterflyTask.png?raw=true"],
    "bubble": ["https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/bubble/Scatter.png?raw=true", "https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/bubble/actual.png"],
    "histogram": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/histogram/actual.png", "https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/histogram/Histogram_Grade_Analogy%202.png"],
    "treemap": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/treemap/actual.png", "https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/treemap/Treemap.png?raw=true"],
    "bar": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/bar/actualTask.png","https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/bar/Bar_Graph_Analogy_Task%202.png"],
    "heatmap": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/heatmap/actual.png", "https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/heatmap/heatmap.png?raw=true"],
    "sankey": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/sankey/actual.png", "https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/sankey/SankeyTask.png?raw=true"],
    "sunburst": ["https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/sunburst/ActualTask.png?raw=true","https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/sunburst/SunburstTask.png?raw=true"]
}