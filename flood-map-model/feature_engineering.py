import geopandas as gpd
from shapely.geometry import Point
import requests

# Load rivers
rivers = gpd.read_file("data/maps/lka_rapidsl_rvr_250k_sdlka.shp").to_crs(epsg=4326)
rivers_proj = rivers.to_crs(epsg=3857)

# Distance to river
def get_distance_to_river(lat, lon):
    point = Point(lon, lat)
    point_proj = gpd.GeoSeries([point], crs="EPSG:4326").to_crs(epsg=3857)[0]
    return rivers_proj.distance(point_proj).min()

# Elevation API
def get_elevation(lat, lon):
    try:
        url = f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}"
        return requests.get(url).json()['results'][0]['elevation']
    except:
        return 0

# Add all features
def enrich_dataframe(df):
    distances = []
    elevations = []

    for _, row in df.iterrows():
        lat = row["latitude"]
        lon = row["longitude"]

        distances.append(get_distance_to_river(lat, lon))
        elevations.append(get_elevation(lat, lon))

    df["distance_to_river"] = distances
    df["elevation"] = elevations

    # Derived features
    df["water_level"] = df["rainfall"] / 50
    df["soil_moisture"] = df["rainfall"] / 2

    return df