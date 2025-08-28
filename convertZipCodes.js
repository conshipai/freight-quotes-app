// convertZipCodes.js - Put this in your project root
const fs = require('fs');
const csv = require('csv-parser');

const results = [];

// It looks for the CSV file in: ./data/zipcodes.csv
fs.createReadStream('./data/zipcodes.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push({
      zip: data.zip,
      type: data.type,
      primary_city: data.primary_city,
      acceptable_cities: data.acceptable_cities || '',
      state: data.state,
      county: data.county || '',
      timezone: data.timezone || '',
      area_codes: data.area_codes || '',
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      decommissioned: data.decommissioned || '0'
    });
  })
  .on('end', () => {
    // Creates the JSON file in: ./src/data/zipcodes.json
    fs.mkdirSync('./src/data', { recursive: true });
    fs.writeFileSync('./src/data/zipcodes.json', JSON.stringify(results, null, 2));
    console.log(`✅ Converted ${results.length} ZIP codes!`);
  })
  .on('error', (err) => {
    console.error('❌ Error:', err);
  });
