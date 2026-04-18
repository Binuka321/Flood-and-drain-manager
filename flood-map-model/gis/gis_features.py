import geopandas as gpd
from shapely.geometry import Point
import requests

rivers = gpd.read_file("data/maps/lka_rapidsl_rvr_250k_sdlka.shp").to_crs(epsg=4326)
rivers_proj = rivers.to_crs(epsg=3857)

def get_distance_to_river(lat, lon):
    point = Point(lon, lat)
    point_proj = gpd.GeoSeries([point], crs="EPSG:4326").to_crs(epsg=3857)[0]
    return rivers_proj.distance(point_proj).min()

def get_elevation(lat, lon):
    try:
        url = f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}"
        return requests.get(url).json()['results'][0]['elevation']
    except:
        return 0

def enrich_dataframe(df):

    df["distance_to_river"] = df.apply(
        lambda row: get_distance_to_river(row["latitude"], row["longitude"]), axis=1
    )

    df["elevation"] = df.apply(
    lambda r: get_elevation(r["latitude"], r["longitude"]),
    axis=1
)

    df["water_level"] = df["rainfall"] / 50
    df["soil_moisture"] = df["rainfall"] / 2

    return df