const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const cheerio = require('cheerio');
const mkdir = util.promisify(fs.mkdir);

async function saveHTMLPages() {
  for (let year = 2022; year <= 2023; year++) {
    const yearFolder = `data/${year}`;
    await createFolder(yearFolder);

    let page = 1;
    let consecutiveErrors = 0;

    while (consecutiveErrors < 2) {
      const link = `https://www.legislation.gov.uk/ukpga/${year}/${page}/enacted/data.xht?view=snippet&wrap=true`;

      try {
        const response = await fetch(link);

        if (response.status === 200) {
          const htmlContent = await response.text();
          const $ = cheerio.load(htmlContent);
          const title = $('title').text();
          const filename = `${yearFolder}/${title}.html`;
          await writeFile(filename, htmlContent, 'utf8');
          console.log(`Saved ${filename}`);
          consecutiveErrors = 0; // Reset consecutive error counter
          page++;
        } else {
          console.error(`Failed to fetch ${link} - Status: ${response.status}`);
          consecutiveErrors++;
        }
      } catch (err) {
        console.error(`Error while fetching ${link}: ${err}`);
        consecutiveErrors++;
      }

      // You can add a delay here if needed.
      await delay(1000);
    }
  }
}

async function createFolder(folderPath) {
  try {
    await mkdir(folderPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`Error creating folder ${folderPath}: ${err}`);
    }
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

saveHTMLPages();
