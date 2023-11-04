const fs = require('fs');

// Read the JSON data from the file
const jsonFile = 'file_data.json';

fs.readFile(jsonFile, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading ${jsonFile}: ${err}`);
    return;
  }

  const jsonData = JSON.parse(data);
  const filteredData = {};

  let totalFilteredFiles = 0;
  let totalSizeKB = 0;

  // Iterate over the years in the JSON data
  for (const year in jsonData) {
    if (jsonData.hasOwnProperty(year)) {
      const files = jsonData[year];

      // Filter files with fileSizeKB above 99.99
      const filteredFiles = files.filter(file => parseFloat(file.fileSizeKB) > 99.99);

      // Update the filtered data for the current year
      if (filteredFiles.length > 0) {
        filteredData[year] = filteredFiles;
        totalFilteredFiles += filteredFiles.length;

        // Calculate the total size in KB
        filteredFiles.forEach(file => {
          totalSizeKB += parseFloat(file.fileSizeKB);
        });
      }
    }
  }

  // Calculate the total size in MB
  const totalSizeMB = totalSizeKB / 1024;

  // Save the filtered data to big_files.json
  fs.writeFile('big_files.json', JSON.stringify(filteredData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(`Error writing to big_files.json: ${err}`);
    } else {
      console.log(`Filtered data saved to big_files.json`);
    }
  });

  // Log the count of filtered files and total size in MB
  console.log(`Total filtered files: ${totalFilteredFiles}`);
  console.log(`Total size of big files (MB): ${totalSizeMB.toFixed(2)} MB`);
});
