const fs = require('fs');

// Load the GADM data
const gadmData = JSON.parse(fs.readFileSync('./src/data/gadm41_LKA_2.json', 'utf8'));

// Group divisions by district name (NAME_1)
const districtMap = {};

gadmData.features.forEach(feature => {
  const districtName = feature.properties.NAME_1;
  
  if (!districtMap[districtName]) {
    districtMap[districtName] = [];
  }
  
  districtMap[districtName].push(feature);
});

// Create aggregated GeoJSON with one feature per district
const aggregatedFeatures = Object.entries(districtMap).map(([districtName, divisions]) => {
  // Collect all coordinates from all divisions
  const allCoordinates = [];
  
  divisions.forEach(division => {
    if (division.geometry.type === 'Polygon') {
      allCoordinates.push(division.geometry.coordinates);
    } else if (division.geometry.type === 'MultiPolygon') {
      allCoordinates.push(...division.geometry.coordinates);
    }
  });

  return {
    type: 'Feature',
    properties: {
      NAME_2: districtName
    },
    geometry: {
      type: allCoordinates.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: allCoordinates.length === 1 ? allCoordinates[0] : allCoordinates
    }
  };
});

const aggregatedGeoJSON = {
  type: 'FeatureCollection',
  features: aggregatedFeatures
};

// Write to file
fs.writeFileSync('./src/data/sri_lanka_districts.geojson', JSON.stringify(aggregatedGeoJSON, null, 0));

console.log(`Created ${aggregatedFeatures.length} districts`);
console.log('District names:', Object.keys(districtMap).sort());
