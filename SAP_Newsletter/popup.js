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
  const jobTitleElements = document.querySelectorAll('a.jobTitle-link');
  const jobCategoryElements = document.querySelectorAll('span.jobLocation');

  console.log('Job Title Elements:', jobTitleElements);
  console.log('Job Category Elements:', jobCategoryElements);

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
    const jobLinkHtml = `
      <p>
        <a href="https://${domain}${link}">Internal link</a><br>
        <span>${jobTitles[index]}</span><br>
        <span>${jobLocations[index]}</span>
      </p>
    `;
    return jobLinkHtml;
  }).join('');

  const htmlTemplate = `
    <html>
    <body>
      <p>Job Links:</p>
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
