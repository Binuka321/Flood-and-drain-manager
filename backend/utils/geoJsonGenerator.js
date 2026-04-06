/**
 * GeoJSON Generator - Converts flood predictions to GeoJSON format for map visualization
 */

export class GeoJSONGenerator {
  /**
   * Generate GeoJSON from predictions
   * @param {Array} predictions - Array of prediction objects with location, latitude, longitude, etc.
   * @returns {Object} GeoJSON FeatureCollection
   */
  static generateFromPredictions(predictions) {
    const features = predictions.map(pred => this.createFeature(pred));

    return {
      type: 'FeatureCollection',
      features: features,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalFeatures: features.length,
        riskDistribution: this.calculateRiskDistribution(predictions)
      }
    };
  }

  /**
   * Create a single GeoJSON feature from a prediction
   */
  static createFeature(prediction) {
    const riskColor = this.getRiskColor(prediction.predictionLabel);
    const riskValue = this.getRiskValue(prediction.predictionLabel);

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [prediction.longitude, prediction.latitude]
      },
      properties: {
        location: prediction.location,
        riskLevel: prediction.predictionLabel,
        riskValue: riskValue,
        confidence: (prediction.confidence * 100).toFixed(2),
        rainfall: prediction.rainfall,
        waterLevel: prediction.waterLevel,
        timestamp: prediction.timestamp,
        color: riskColor,
        fillOpacity: prediction.confidence,
        radius: this.getRadiusFromRisk(riskValue),
        // For popup display
        popupText: `
          <strong>${prediction.location}</strong><br>
          Risk: ${prediction.predictionLabel}<br>
          Confidence: ${(prediction.confidence * 100).toFixed(1)}%<br>
          Rainfall: ${prediction.rainfall}mm<br>
          Water Level: ${prediction.waterLevel}m
        `
      }
    };
  }

  /**
   * Create a district-level feature (polygon)
   */
  static createDistrictFeature(district, predictions) {
    const districtPredictions = predictions.filter(p => p.location === district.name);
    
    if (districtPredictions.length === 0) {
      return null;
    }

    // Calculate aggregate risk for the district
    const avgRisk = districtPredictions.reduce((sum, p) => sum + this.getRiskValue(p.predictionLabel), 0) / districtPredictions.length;
    const avgConfidence = districtPredictions.reduce((sum, p) => sum + p.confidence, 0) / districtPredictions.length;
    const aggregateRiskLabel = this.getRiskLabelFromValue(Math.round(avgRisk));

    return {
      type: 'Feature',
      geometry: district.geometry,
      properties: {
        name: district.name,
        aggregateRiskLevel: aggregateRiskLabel,
        averageRiskValue: avgRisk,
        averageConfidence: (avgConfidence * 100).toFixed(2),
        affectedLocations: districtPredictions.length,
        color: this.getRiskColor(aggregateRiskLabel),
        fillOpacity: 0.6,
        popupText: `
          <strong>${district.name}</strong><br>
          Risk: ${aggregateRiskLabel}<br>
          Avg Confidence: ${(avgConfidence * 100).toFixed(1)}%<br>
          Affected Locations: ${districtPredictions.length}
        `
      }
    };
  }

  /**
   * Convert risk label to numeric value for calculations
   */
  static getRiskValue(riskLabel) {
    const riskMap = {
      'Low Risk': 1,
      'Moderate Risk': 2,
      'High Risk': 3,
      'Very High Risk': 4
    };
    return riskMap[riskLabel] || 1;
  }

  /**
   * Convert numeric value back to risk label
   */
  static getRiskLabelFromValue(value) {
    const labelMap = {
      1: 'Low Risk',
      2: 'Moderate Risk',
      3: 'High Risk',
      4: 'Very High Risk'
    };
    return labelMap[value] || 'Low Risk';
  }

  /**
   * Get color for risk level (for map visualization)
   */
  static getRiskColor(riskLabel) {
    const colorMap = {
      'Low Risk': '#27AE60',      // Green
      'Moderate Risk': '#F39C12',  // Orange
      'High Risk': '#E74C3C',      // Red
      'Very High Risk': '#8B0000'  // Dark Red
    };
    return colorMap[riskLabel] || '#95A5A6';
  }

  /**
   * Get marker radius based on risk
   */
  static getRadiusFromRisk(riskValue) {
    const radiusMap = {
      1: 8,
      2: 12,
      3: 16,
      4: 20
    };
    return radiusMap[riskValue] || 8;
  }

  /**
   * Calculate risk distribution statistics
   */
  static calculateRiskDistribution(predictions) {
    const distribution = {
      'Low Risk': 0,
      'Moderate Risk': 0,
      'High Risk': 0,
      'Very High Risk': 0
    };

    predictions.forEach(pred => {
      distribution[pred.predictionLabel]++;
    });

    return distribution;
  }

  /**
   * Generate heatmap layer data
   */
  static generateHeatmapData(predictions) {
    return predictions.map(pred => [
      pred.latitude,
      pred.longitude,
      this.getRiskValue(pred.predictionLabel) / 4  // Normalize to 0-1
    ]);
  }

  /**
   * Generate choropleth layer with districts
   */
  static generateChoroplethLayer(geoJsonData, predictions) {
    // Merge predictions into district GeoJSON
    const features = geoJsonData.features.map(feature => {
      const districtName = feature.properties.name;
      const districtPredictions = predictions.filter(p => p.location === districtName);

      if (districtPredictions.length > 0) {
        const avgRisk = districtPredictions.reduce((sum, p) => sum + this.getRiskValue(p.predictionLabel), 0) / districtPredictions.length;
        const avgConfidence = districtPredictions.reduce((sum, p) => sum + p.confidence, 0) / districtPredictions.length;
        const aggregateRiskLabel = this.getRiskLabelFromValue(Math.round(avgRisk));

        return {
          ...feature,
          properties: {
            ...feature.properties,
            riskLevel: aggregateRiskLabel,
            riskValue: avgRisk,
            confidence: avgConfidence,
            color: this.getRiskColor(aggregateRiskLabel)
          }
        };
      }

      return feature;
    });

    return {
      type: 'FeatureCollection',
      features: features
    };
  }

  /**
   * Generate summary statistics
   */
  static generateSummary(predictions) {
    const distribution = this.calculateRiskDistribution(predictions);
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    const highRiskLocations = predictions.filter(p => 
      p.predictionLabel === 'High Risk' || p.predictionLabel === 'Very High Risk'
    );

    return {
      totalLocations: predictions.length,
      averageConfidence: (avgConfidence * 100).toFixed(2),
      riskDistribution: distribution,
      highRiskLocations: highRiskLocations.map(p => ({
        location: p.location,
        riskLevel: p.predictionLabel,
        confidence: (p.confidence * 100).toFixed(2)
      })),
      generatedAt: new Date().toISOString()
    };
  }
}

export default GeoJSONGenerator;
