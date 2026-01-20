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

// Create district-level GeoJSON with simplified coordinates
const simplifyCoords = (coords, depth = 0) => {
  if (depth === 0) return coords.map(c => simplifyCoords(c, 1));
  if (depth === 1) return coords.map(c => simplifyCoords(c, 2));
  if (depth === 2) return coords.map(c => simplifyCoords(c, 3));
  if (depth === 3) {
    return coords.filter((_, i) => i % 5 === 0).map(c => [
      Math.round(c[0] * 10000) / 10000,
      Math.round(c[1] * 10000) / 10000
    ]);
  }
};

const districtFeatures = Object.entries(districtMap).map(([name, features]) => {
  const coords = features.map(f => {
    if (f.geometry.type === 'MultiPolygon') {
      return f.geometry.coordinates;
    } else if (f.geometry.type === 'Polygon') {
      return [f.geometry.coordinates];
    }
    return [];
  }).flat();
  
  const simplified = simplifyCoords(coords);
  
  return {
    type: 'Feature',
    properties: { NAME_2: name },
    geometry: {
      type: 'MultiPolygon',
      coordinates: simplified
    }
  };
});

const result = {
  type: 'FeatureCollection',
  features: districtFeatures
};

fs.writeFileSync('sri_lanka_districts.geojson', JSON.stringify(result, null, 2));
console.log('Created ' + districtFeatures.length + ' districts');
districtFeatures.forEach(f => console.log('  - ' + f.properties.NAME_2));
