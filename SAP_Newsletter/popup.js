let scrapeLinks = document.getElementById('scrapeLinks');

scrapeLinks.addEventListener("click", async () => {
  // Get the current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute a script to scrape the job links from the page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeLinksFromPage,
  }, (results) => {
    // Handle the results returned by the content script
    if (results && results.length > 0 && results[0].result) {
      const jobLinks = results[0].result;

      // Read the template links asynchronously
      readTemplateLinks((templateLinks) => {
        // Create the EML file with the job links
        const emlData = createEML(jobLinks, templateLinks);

        // Download the EML file
        downloadFile(emlData, 'job-links.eml');
      });
    }
  });
});

// Function to scrape links from the web page
function scrapeLinksFromPage() {
  const linkRegEx = /href="(\/job\/[\w-]+\/\d+\/)"/g;
  const links = Array.from(document.body.innerHTML.matchAll(linkRegEx)).map(match => `${match[1]}`);

  return links;
}

// Function to read the links from the template file asynchronously
function readTemplateLinks(callback) {
  // Use fetch or XMLHttpRequest to retrieve the template content asynchronously
  fetch('./template.html')
    .then(response => response.text())
    .then(templateContent => {
      const linkRegEx = /href="([^"]+)"/g;
      const links = Array.from(templateContent.matchAll(linkRegEx)).map(match => `${match[1]}`);
      callback(links);
    })
    .catch(error => {
      console.error('Error reading template links:', error);
      callback([]);
    });
}

// Function to create an EML file with the job links and template links
function createEML(jobLinks, templateLinks) {
  const domain = 'jobs.sap.com';

  let emailBody = jobLinks.map(link => `<a href="https://${domain}${link}">https://${domain}${link}</a>`).join('<br>');
  const renderedTemplate = templateLinks.map(link => `<a href="${link}">${link}</a>`).join('<br>');

  let emlData = `From: me@example.com
  To: you@example.com
  Subject: Job Links
  Content-Type: text/html; charset=UTF-8

  <html>
  <body>
  <p>Job Links:</p>
  ${emailBody}
  ${renderedTemplate}
  </body>
  </html>`;

  return emlData;
}

// Function to download a file
function downloadFile(data, filename) {
  const blob = new Blob([data], { type: 'text/html; charset=UTF-8' });
  const url = URL.createObjectURL(blob);

  // Create a link and click it to initiate the download
  let link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Clean up the URL object
  URL.revokeObjectURL(url);
}