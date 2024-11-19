import matplotlib.pyplot as plt
import numpy as np
import cartopy.crs as ccrs
import cartopy.feature as cfeature

# Create a figure with a specific projection
fig = plt.figure(figsize=(10, 6))
ax = plt.axes(projection=ccrs.LambertConformal())

# Set up the map extent (bounding box)
ax.set_extent([-125, -66.5, 24, 49], ccrs.Geodetic())

# Add state boundaries
ax.add_feature(cfeature.STATES.with_scale('50m'), edgecolor='black')

# Generate some sample data for contours
lon = np.linspace(-125, -66.5, 50)
lat = np.linspace(24, 49, 50)
lon2d, lat2d = np.meshgrid(lon, lat)

# Sample function to generate contour data (e.g., some arbitrary elevation data)
data = np.sin(3 * np.pi * lon2d / 180) * np.cos(2 * np.pi * lat2d / 180)

# Plot contours
contour_levels = 5  # number of contour lines
contours = ax.contour(lon, lat, data, contour_levels, colors='blue',
                      transform=ccrs.PlateCarree())

# Add labels to contours
ax.clabel(contours, inline=True, fontsize=8)

# Add titles and labels if needed
ax.set_title('High-Level Contour Map of the United States')

# Show the plot
plt.show()