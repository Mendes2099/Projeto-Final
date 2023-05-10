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

      // Create the EML file with the job links
      const emlData = createEML(jobLinks);

      // Download the EML file
      downloadFile(emlData, 'job-links.eml');
    }
  });
});

// Function to scrape links from the web page
function scrapeLinksFromPage() {
  const linkRegEx = /href="(\/job\/[\w-]+\/\d+\/)"/g;
  /* const domain = 'jobs.sap.com'; */
  const links = Array.from(document.body.innerHTML.matchAll(linkRegEx)).map(match => `${match[1]}`);
  
  return links;
}

// Function to create an EML file with the job links
function createEML(jobLinks) {
  const domain = 'jobs.sap.com';
  let emailBody = jobLinks.map(link => `<a href="https://${domain}${link}">https://${domain}${link}</a>`).join('<br>');

  let emlData = `From: me@example.com
To: you@example.com
Subject: Job Links
Content-Type: text/html; charset=UTF-8

<html>
<body>
<p>Job Links:</p>
${emailBody}
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
