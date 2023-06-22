let scrapeLinks = document.getElementById('scrapeLinks');

scrapeLinks.addEventListener("click", async () => {
  // Get the current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute a script to scrape the job links, titles, and categories from the page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeLinksFromPage,
  }, (results) => {
    // Handle the results returned by the content script
    if (results && results.length > 0 && results[0].result) {
      const { jobLinks, jobTitles, jobLocations } = results[0].result;

      // Create the EML file with the job links, titles, and categories
      const emlData = createEML(jobLinks, jobTitles, jobLocations);

      // Download the EML file
      downloadFile(emlData, 'SAP_Newsletter.eml');
    }
  });
});

// Function to scrape links, titles, and categories from the web page
function scrapeLinksFromPage() {
  const linkRegEx = /href="(\/job\/[\w-]+\/\d+\/)"/g;
  const jobTitleElements = document.querySelectorAll('.colTitle');
  const jobCategoryElements = document.querySelectorAll('.colLocation');
  const links = Array.from(document.body.innerHTML.matchAll(linkRegEx)).map(match => `${match[1]}`);
  const jobTitles = Array.from(jobTitleElements).map(element => element.innerText);
  const jobLocations = Array.from(jobCategoryElements).map(element => element.innerText);
  /* const domain = 'jobs.sap.com'; */

  return { jobLinks: links, jobTitles, jobLocations };
}

// Function to create an EML file with the job links, titles, and categories
function createEML(jobLinks, jobTitles, jobLocations) {
  const domain = 'jobs.sap.com';

  // Replace placeholders in the template with the job links, titles, and categories
  const emailBody = jobLinks.map((link, index) => {
    const jobTitlesStyle = 'font-size: 13.3333px; color: #000000; text-decoration: none solid rgb(0, 0, 0); font-family: Arial, sans-serif;';
    const jobLocationStyle = 'font-size: 10.6667px; color: #A5A5A5; text-decoration: none solid rgb(165, 165, 165); font-family: Arial, sans-serif;';
    const jobLinkHtml = `
    <p style="font-size: 13.3333px; color: #0563C1; text-decoration: none solid rgb(5, 99, 193); font-family: Arial, sans-serif;">
      <strong><span style="margin-right: 5px;">&#9642;</span> <span style="${jobTitlesStyle}">${jobTitles[index]}</span> - 
      <span style="${jobLocationStyle}">${jobLocations[index]}</span> - 
      <a href="https://${domain}${link}">Internal link</a>
    </p>
    `;
    return jobLinkHtml;
  }).join('');

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
    <style>
    .positions {
      font-size: 17px;
      color: #008FD3;
    }
    </style>
    </head>
    <body>
    <p class="positions">(INTERNAL / EXTERNAL) POSITIONS:</p>
      ${emailBody}
    </body>
  </html>
`;

  const emlData = `From: me@example.com
To: you@example.com
Subject: Job Links
Content-Type: text/html; charset=UTF-8

${htmlTemplate}`;

  return emlData;
}

// Function to download a file
function downloadFile(data, filename) {
  const blob = new Blob([data], { type: 'text/plain' });

  // Create a link and click it to initiate the download
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
