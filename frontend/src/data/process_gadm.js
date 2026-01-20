const fs = require('fs');
const gadm = JSON.parse(fs.readFileSync('./gadm41_LKA_2.json', 'utf8'));

// Group features by NAME_1 (district)
const districtMap = {};
gadm.features.forEach(feature => {
  const district = feature.properties.NAME_1;
  if (!districtMap[district]) {
    districtMap[district] = [];
  }
  districtMap[district].push(feature);
});

// Create district-level GeoJSON
const districtFeatures = Object.entries(districtMap).map(([name, features]) => {
  const coords = features.map(f => {
    if (f.geometry.type === 'MultiPolygon') {
      return f.geometry.coordinates;
    } else if (f.geometry.type === 'Polygon') {
      return [f.geometry.coordinates];
    }
    return [];
  }).flat();
  
  return {
    type: 'Feature',
    properties: { NAME_2: name },
    geometry: {
      type: 'MultiPolygon',
      coordinates: coords
    }
  };
});

const result = {
  type: 'FeatureCollection',
  features: districtFeatures
};

fs.writeFileSync('sri_lanka_districts.geojson', JSON.stringify(result, null, 2));
console.log('Created district GeoJSON with ' + districtFeatures.length + ' districts');
