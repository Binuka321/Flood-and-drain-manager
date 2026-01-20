import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/*
  All 25 Districts of Sri Lanka with elevation data
*/
const DISTRICTS = {
  Ampara: { elevation: 30 },
  Anuradhapura: { elevation: 81 },
  Badulla: { elevation: 670 },
  Batticaloa: { elevation: 5 },
  Colombo: { elevation: 5 },
  Galle: { elevation: 13 },
  Gampaha: { elevation: 30 },
  Hambantota: { elevation: 25 },
  Jaffna: { elevation: 5 },
  Kalutara: { elevation: 10 },
  Kandy: { elevation: 465 },
  Kegalle: { elevation: 180 },
  Kilinochchi: { elevation: 15 },
  Kurunegala: { elevation: 116 },
  Mannar: { elevation: 10 },
  Matale: { elevation: 364 },
  Matara: { elevation: 15 },
  Moneragala: { elevation: 300 },
  Mullaitivu: { elevation: 20 },
  NuwaraEliya: { elevation: 1868 },
  Polonnaruwa: { elevation: 58 },
  Puttalam: { elevation: 10 },
  Ratnapura: { elevation: 34 },
  Trincomalee: { elevation: 15 },
  Vavuniya: { elevation: 90 }
};

export default function FloodMapApp() {
  const [rainfall, setRainfall] = useState(0);
  const [riskMap, setRiskMap] = useState({});
  const [selectedDistricts, setSelectedDistricts] = useState({});
  const [districts, setDistricts] = useState(null);

  useEffect(() => {
    fetch('/src/data/sri_lanka_districts.geojson')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  const toggleDistrict = (district) => {
    setSelectedDistricts(prev => ({
      ...prev,
      [district]: !prev[district]
    }));
  };

  const selectAll = () => {
    const all = {};
    Object.keys(DISTRICTS).forEach(d => {
      all[d] = true;
    });
    setSelectedDistricts(all);
  };

  const deselectAll = () => {
    setSelectedDistricts({});
  };

  const calculateRisk = () => {
    const updated = {};

    Object.entries(DISTRICTS).forEach(([district, data]) => {
      if (!selectedDistricts[district]) return;

      const elevation = data.elevation;
      let level = "LOW";
      let color = "green";

      if (elevation < 20 && rainfall > 120) {
        level = "HIGH";
        color = "red";
      } else if (elevation < 100 && rainfall > 80) {
        level = "MODERATE";
        color = "orange";
      }

      updated[district] = { level, color };
    });

    setRiskMap(updated);
  };

  const styleDistrict = feature => {
    const name = feature.properties.NAME_2;
    const risk = riskMap[name];
    const isSelected = selectedDistricts[name];

    return {
      color: risk ? risk.color : isSelected ? "blue" : "lightgray",
      fillOpacity: risk ? 0.6 : isSelected ? 0.3 : 0.2,
      weight: risk ? 2.5 : isSelected ? 2 : 1
    };
  };

  const onEachDistrict = (feature, layer) => {
    const name = feature.properties.NAME_2;
    const elevation = DISTRICTS[name]?.elevation;
    const risk = riskMap[name];

    layer.bindPopup(`
      <b>${name} District</b><br/>
      Elevation: ${elevation ?? "N/A"} m<br/>
      Risk Level: ${risk?.level ?? "Not calculated"}
    `);

    layer.on('click', () => {
      toggleDistrict(name);
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "30%", padding: 20, background: "#f5f5f5", overflowY: "auto" }}>
        <h2 style={{color:"black"}}>Sri Lanka Flood Risk Map</h2>
        <p style={{ color: "#666", fontSize: "14px" }}>Click districts on map or select below</p>

        <div style={{ marginBottom: "15px" }}>
          <label style={{color:"black"}}><b>Select Districts</b></label>
          <div style={{ marginTop: "8px", marginBottom: "10px" }}>
            <button 
              onClick={selectAll}
              style={{
                padding: "6px 12px",
                marginRight: "8px",
                background: "#4CAF50",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Select All
            </button>
            <button 
              onClick={deselectAll}
              style={{
                padding: "6px 12px",
                background: "#f44336",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Deselect All
            </button>
          </div>
          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "4px", 
            padding: "10px",
            maxHeight: "280px",
            overflowY: "auto",
            background: "white"
          }}>
            {Object.keys(DISTRICTS).map(district => (
              <div key={district} style={{ marginBottom: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedDistricts[district] || false}
                    onChange={() => toggleDistrict(district)}
                    style={{ marginRight: "8px", cursor: "pointer" }}
                  />
                  <span style={{ color:"black",fontSize: "14px" }}>{district}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <label style={{color:"black"}}><b>Rainfall (mm)</b></label><br />
        <input
          type="number"
          value={rainfall}
          onChange={e => setRainfall(+e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "5px", boxSizing: "border-box" }}
        />

        <br /><br />

        <button 
          onClick={calculateRisk}
          style={{
            width: "100%",
            padding: "10px",
            background: "#2196F3",
            color: "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          Generate Flood Zones
        </button>

        <div style={{ marginTop: 20, fontSize: "13px" }}>
          <h4 style={{color:"black"}}>Risk Color Legend</h4>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ display: "inline-block", width: "20px", height: "20px", background: "blue", marginRight: "10px", borderRadius: "3px" }}></span>
            <b style={{color:"black"}}>SELECTED</b> - District selected
          </div>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ display: "inline-block", width: "20px", height: "20px", background: "green", marginRight: "10px", borderRadius: "3px" }}></span>
            <b style={{color:"black"}}>LOW</b> - Elevation ≥ 100m or rainfall ≤ 80mm
          </div>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ display: "inline-block", width: "20px", height: "20px", background: "orange", marginRight: "10px", borderRadius: "3px" }}></span>
            <b style={{color:"black"}}>MODERATE</b> - 20-100m elevation, rainfall 80-120mm
          </div>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ display: "inline-block", width: "20px", height: "20px", background: "red", marginRight: "10px", borderRadius: "3px" }}></span>
            <b style={{color:"black"}}>HIGH</b> - Below 20m elevation, rainfall 120mm
          </div>
        </div>
        
        <p style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
          Selected: <b>{Object.values(selectedDistricts).filter(Boolean).length}/25</b> districts
        </p>
      </div>

      {/* Map */}
      {districts ? (
      <MapContainer
        center={[7.8731, 80.7718]}
        zoom={7.5}
        style={{ flex: 1 }}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <GeoJSON
          data={districts}
          style={styleDistrict}
          onEachFeature={onEachDistrict}
        />
      </MapContainer>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
}
