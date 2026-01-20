const fs = require('fs');
const geojson = JSON.parse(fs.readFileSync('sri_lanka_districts.geojson', 'utf8'));

// Simplify coordinates - every 5th point and round
const simplify = (coords, depth = 0) => {
  if (depth === 0) return coords.map(c => simplify(c, 1));
  if (depth === 1) return coords.map(c => simplify(c, 2));
  if (depth === 2) return coords.map(c => simplify(c, 3));
  if (depth === 3) {
    return coords.filter((_, i) => i % 5 === 0).map(c => [
      Math.round(c[0] * 10000) / 10000,
      Math.round(c[1] * 10000) / 10000
    ]);
  }
};

const simplified = {
  type: geojson.type,
  features: geojson.features.map(f => ({
    type: f.type,
    properties: f.properties,
    geometry: {
      type: f.geometry.type,
      coordinates: simplify(f.geometry.coordinates)
    }
  }))
};

const beforeSize = fs.statSync('sri_lanka_districts.geojson').size / 1024;
fs.writeFileSync('sri_lanka_districts.geojson', JSON.stringify(simplified));
const afterSize = fs.statSync('sri_lanka_districts.geojson').size / 1024;
console.log('Optimized: ' + Math.round(beforeSize) + ' KB -> ' + Math.round(afterSize) + ' KB');
