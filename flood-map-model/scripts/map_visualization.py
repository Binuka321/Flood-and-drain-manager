import pandas as pd
import geopandas as gpd
import folium
import requests

# Load dataset (YOU CREATED)
df = pd.read_csv("data/datasets/map_input.csv")

# Load shapefile
gdf = gpd.read_file("data/maps/sri_lanka_districts.shp")

# Call prediction API
def get_prediction(row):
    payload = {
        "features": {
            "rainfall": float(row["rainfall"]),
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "month": int(row["month"]),
            "flood_events": int(row["flood_events"])
        }
    }

    try:
        res = requests.post(
            "http://localhost:5000/api/ml/prediction/predict",
            json=payload
        )
        data = res.json()
        return data.get("prediction_label", "Unknown")
    except Exception as e:
        print("API Error:", e)
        return "Unknown"

print("🔮 Generating predictions...")
df["risk"] = df.apply(get_prediction, axis=1)

# 🔥 IMPORTANT: normalize names
df["location"] = df["location"].str.strip().str.title()
gdf["DISTRICT"] = gdf["DISTRICT"].str.strip().str.title()

# Merge
merged = gdf.merge(df, left_on="DISTRICT", right_on="location")

# Color logic
def get_color(risk):
    if "High" in risk:
        return "red"
    elif "Moderate" in risk:
        return "yellow"
    elif "Low" in risk:
        return "green"
    else:
        return "gray"

# Create map
m = folium.Map(location=[7.8, 80.7], zoom_start=7)

folium.GeoJson(
    merged,
    style_function=lambda feature: {
        "fillColor": get_color(feature["properties"]["risk"]),
        "color": "black",
        "weight": 1,
        "fillOpacity": 0.6
    },
    tooltip=folium.GeoJsonTooltip(
        fields=["location", "risk"],
        aliases=["District", "Flood Risk"]
    )
).add_to(m)

m.save("outputs/flood_map.html")

print("✅ Done! Open outputs/flood_map.html")