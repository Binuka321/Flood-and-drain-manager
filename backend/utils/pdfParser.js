import fs from 'fs';
import pdf from 'pdf-parse';

export async function parseRainfallPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    const text = data.text;
    console.log('Extracted PDF text:', text.substring(0, 500)); // Debug log

    // Parse the text to extract district data
    const districtData = extractDistrictData(text);

    return districtData;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF: ' + error.message);
  } finally {
    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup file:', cleanupError);
    }
  }
}

function extractDistrictData(text) {
  console.log('Parsing district data from text...');

  // Look for district name (case insensitive, more flexible patterns)
  // Prioritize explicit district labels, then look for location/area patterns
  let districtMatch = text.match(/(?:district|districts?)\s*[:\-]?\s*([A-Za-z\s]{2,50}(?=\n|$|Latitude|Longitude|Lat|Lon|°))/i);

  if (!districtMatch) {
    // Look for location/area patterns
    districtMatch = text.match(/(?:location|area)\s*[:\-]?\s*([A-Za-z\s]{2,50})/i);
  }

  if (!districtMatch) {
    // Look for standalone district names at the beginning, but exclude coordinate lines
    const lines = text.split(/\r?\n/);
    for (const line of lines.slice(0, 3)) { // Check first few lines
      if (!line.match(/\d/) && !line.match(/(?:lat|lon|latitude|longitude)/i) && line.trim().length > 2) {
        districtMatch = line.match(/^([A-Za-z\s]{3,50})$/);
        if (districtMatch) break;
      }
    }
  }

  if (!districtMatch) {
    // Look for "X District" pattern
    districtMatch = text.match(/([A-Za-z\s]{3,50})\s+(?:district|area)/i);
  }

  let district = null;
  if (districtMatch) {
    district = districtMatch[1].trim();
    // Clean up common prefixes/suffixes and coordinates
    district = district.replace(/^(the|district of|area of|location of)\s+/i, '')
                      .replace(/\s+(district|area|location)$/i, '')
                      .replace(/\s*(?:lat|lon|latitude|longitude)[:\-]?\s*\d.*/i, '')
                      .trim();
    console.log('Found district:', district);
  }

  // Look for latitude and longitude (more flexible patterns)
  const latMatch = text.match(/latitude?\s*[:\-]?\s*([+-]?\d+(?:\.\d+)?)/i) ||
                   text.match(/lat\.?\s*[:\-]?\s*([+-]?\d+(?:\.\d+)?)/i) ||
                   text.match(/([+-]?\d+(?:\.\d+)?)\s*(?:°|deg|degrees?)\s*(?:N|north|N\.)/i) ||
                   text.match(/([+-]?\d+(?:\.\d+)?)\s*N/i);

  const lonMatch = text.match(/longitude?\s*[:\-]?\s*([+-]?\d+(?:\.\d+)?)/i) ||
                   text.match(/lon\.?\s*[:\-]?\s*([+-]?\d+(?:\.\d+)?)/i) ||
                   text.match(/([+-]?\d+(?:\.\d+)?)\s*(?:°|deg|degrees?)\s*(?:E|east|E\.)/i) ||
                   text.match(/([+-]?\d+(?:\.\d+)?)\s*E/i);

  let latitude = null;
  let longitude = null;

  if (latMatch) {
    latitude = parseFloat(latMatch[1]);
    console.log('Found latitude:', latitude);
  }

  if (lonMatch) {
    longitude = parseFloat(lonMatch[1]);
    console.log('Found longitude:', longitude);
  }

  // Extract monthly rainfall data
  const monthlyData = extractMonthlyData(text);
  console.log('Found monthly data for', monthlyData.length, 'months');

  // If we don't have all required data, provide helpful error
  if (!district) {
    throw new Error('Could not find district/area name in PDF. Please ensure the PDF contains text like "District: Colombo" or "Colombo District"');
  }

  if (!latitude || !longitude) {
    throw new Error('Could not find latitude and longitude in PDF. Please ensure the PDF contains coordinates like "Latitude: 6.9271, Longitude: 79.8612"');
  }

  if (monthlyData.length === 0) {
    throw new Error('Could not find monthly rainfall data in PDF. Please ensure the PDF contains monthly rainfall values');
  }

  return {
    district,
    latitude,
    longitude,
    monthlyData
  };
}

function extractMonthlyData(text) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyData = [];

  // Look for rainfall data in various formats
  for (const month of monthNames) {
    // Try different patterns for rainfall values
    const patterns = [
      new RegExp(`${month}\\s*:?\\s*(\\d+(?:\\.\\d+)?)`, 'i'),
      new RegExp(`${month.substring(0, 3)}\\s*:?\\s*(\\d+(?:\\.\\d+)?)`, 'i'),
      new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${month}`, 'i'),
      new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${month.substring(0, 3)}`, 'i')
    ];

    let rainfall = null;
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        rainfall = parseFloat(match[1]);
        break;
      }
    }

    if (rainfall !== null) {
      monthlyData.push({
        month,
        avgRainfall: rainfall
      });
    }
  }

  // If we didn't find all months, try to find tabular data
  if (monthlyData.length < 12) {
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      // Look for lines that might contain monthly data
      const monthData = extractFromLine(line, monthNames);
      if (monthData) {
        // Check if we already have this month
        const existingIndex = monthlyData.findIndex(m => m.month === monthData.month);
        if (existingIndex === -1) {
          monthlyData.push(monthData);
        }
      }
    }
  }

  // Sort by month order and return up to 12 months
  const monthOrder = monthNames.reduce((acc, month, index) => {
    acc[month] = index;
    return acc;
  }, {});

  return monthlyData
    .sort((a, b) => monthOrder[a.month] - monthOrder[b.month])
    .slice(0, 12);
}

function extractFromLine(line, monthNames) {
  for (const month of monthNames) {
    const monthRegex = new RegExp(`\\b${month}\\b`, 'i');
    if (monthRegex.test(line)) {
      // Look for numbers in the same line
      const numbers = line.match(/\d+(?:\.\d+)?/g);
      if (numbers && numbers.length > 0) {
        return {
          month,
          avgRainfall: parseFloat(numbers[0])
        };
      }
    }
  }
  return null;
}