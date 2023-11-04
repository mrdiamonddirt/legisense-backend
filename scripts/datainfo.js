const fs = require('fs');
const path = require('path');

function getFileInfo(folderPath) {
  const result = {};

  // Read the contents of the folder
  const items = fs.readdirSync(folderPath);

  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // If it's a directory, recursively get file info in that directory
      const subFolderFiles = getFileInfo(itemPath);
      Object.assign(result, subFolderFiles);
    } else if (stats.isFile()) {
      const year = path.basename(folderPath);
      const fileSizeInKB = (stats.size / 1024).toFixed(2);

      if (!result[year]) {
        result[year] = [];
      }

      result[year].push({
        fileName: item,
        fileSizeKB: fileSizeInKB,
      });
    }
  }

  return result;
}

const dataFolderPath = './data';
const fileData = getFileInfo(dataFolderPath);

// Convert the fileData object to JSON and save it to a file
const outputFile = 'file_data.json';
fs.writeFileSync(outputFile, JSON.stringify(fileData, null, 2));
console.log(`File data has been saved to ${outputFile}`);
