import os
import pandas as pd
from PIL import Image
import requests
from io import BytesIO

chart_folder_mapping = {
    'bar': ['BarActual', 'BarAnalogy'],
    'heatmap': ['HeatmapActual', 'HeatmapAnalogy'],
    'sunburst': ['Sunburst Draw', 'SunburstAnalogy'],
    'histogram': ['HistogramActual', 'HistogramAnalogy'],
    'bubble': ['BubbleActual', 'BubbleAnalogy'],
    'waterfall': ['WaterfallActual', 'WaterfallAnalogy'],
    'butterfly': ['ButterflyActual', 'ButterflyAnalogy'],
    'stackedArea': ['StackedAreaBaseline', 'StackedAreaAnalogy']
}

# Overlay function
def overlay_images(chart_background_url, annotation_image_path, output_image_path):
    """
    Overlays a transparent annotation image onto a chart background image.
    
    Parameters:
    chart_background_url (str): URL to the chart background image.
    annotation_image_path (str): File path to the transparent annotation image.
    output_image_path (str): File path to save the resulting composite image.
    """
    try:
        # Load the chart background from URL
        response = requests.get(chart_background_url)
        chart = Image.open(BytesIO(response.content)).convert("RGBA")
        
        # Load the annotation image
        annotation = Image.open(annotation_image_path).convert("RGBA")
        
        # Resize the annotation image to match the chart's dimensions
        annotation = annotation.resize(chart.size, Image.Resampling.LANCZOS)
        
        # Composite the annotation onto the chart
        composite = Image.alpha_composite(chart, annotation)
        
        # Save the result
        composite.save(output_image_path, format="PNG")
        print(f"Saved composite image: {output_image_path}")
        return output_image_path  # Return the path to store in CSV
    except Exception as e:
        print(f"An error occurred: {e}")
        return None  # Return None if overlay fails

# Paths and data
filtered_pilot_csv = "/Users/h2o/Documents/Projects/AnalogyVis/analysis/filtered_pilot.csv"
output_dir = "/Users/h2o/Documents/Projects/AnalogyVis/analysis/annotations"
#charts for tasks:
background_charts = {
    "stackedArea": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/stackedArea/actual.png", "https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/stackedArea/StackedArea.png"],
    "waterfall": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/waterfall/actualTask.png", "https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/waterfall/WaterfallTask.png"],
    "butterfly": ["https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/butterfly/actualTask.png?raw=true","https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/butterfly/ButterflyTask.png?raw=true"],
    "bubble": ["https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/bubble/Scatter.png?raw=true", "https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/bubble/actual.png"],
    "histogram": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/histogram/actual.png", "https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/histogram/histogram.png"],
    "bar": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/bar/actualTask.png","https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/bar/Bar_Graph_Analogy_Task%202.png"],
    "heatmap": ["https://raw.githubusercontent.com/oliphant0803/AnalogyVis/refs/heads/main/analogyCharts/heatmap/actual.png", "https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/heatmap/heatmap.png?raw=true"],
    "sunburst": ["https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/sunburst/ActualTask.png?raw=true","https://github.com/oliphant0803/AnalogyVis/blob/main/analogyCharts/sunburst/SunburstTask.png?raw=true"]
}

# Read the filtered pilot CSV
data = pd.read_csv(filtered_pilot_csv)

# Add columns for overlay paths
data["actualOverlay"] = None
data["analogyOverlay"] = None

# Process each chart type
for chart_type, backgrounds in background_charts.items():
    # Create output folder for the chart type
    chart_output_dir = os.path.join(output_dir, chart_type)
    os.makedirs(chart_output_dir, exist_ok=True)
    
    # Extract rows corresponding to the chart type
    filtered_rows = data[data["ChartType"].str.contains(chart_type, case=False)]
    
    for index, row in filtered_rows.iterrows():
        # Get the paths for actual and analogy images
        actual_path = row["actual"]
        analogy_path = row["analogy"]
        
        # Define output paths
        actual_output = os.path.join(chart_output_dir, f"{os.path.basename(actual_path)}_actual_composite.png")
        analogy_output = os.path.join(chart_output_dir, f"{os.path.basename(analogy_path)}_analogy_composite.png")
        
        # Apply the overlay function
        print(f"Processing row {index} for chart type: {chart_type}")
        actual_overlay_path = overlay_images(backgrounds[0], actual_path, actual_output)  # Actual chart
        analogy_overlay_path = overlay_images(backgrounds[1], analogy_path, analogy_output)  # Analogy chart
        
        # Update the CSV with overlay paths
        if actual_overlay_path:
            data.at[index, "actualOverlay"] = actual_overlay_path
        if analogy_overlay_path:
            data.at[index, "analogyOverlay"] = analogy_overlay_path

# Save the updated CSV
data.to_csv(filtered_pilot_csv, index=False)
print(f"Updated CSV saved at {filtered_pilot_csv}")