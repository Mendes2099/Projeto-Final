document.addEventListener('DOMContentLoaded', function() {
  // Add a click event listener to the "Scrape Links" button
  const scrapeLinksButton = document.getElementById('scrapeLinks');
  scrapeLinksButton.addEventListener('click', scrapeLinksFromPage);

  // Add a click event listener to the "Download as PDF" button
  const downloadPDFButton = document.getElementById('downloadPDF');
  downloadPDFButton.addEventListener('click', downloadPDF);
});
//l-bljb-<ljs.jlbv-slzjcvb-sljdbg

function downloadPDF() {
  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
    const tab = tabs[0];

    // Execute a script to scrape the job links from the page
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeLinksFromPage,
    }, function(results) {
      // Handle the results returned by the content script
      if (results && results.length > 0 && results[0].result) {
        const jobLinks = results[0].result;

        // Generate the PDF document with the job links
        const pdfData = createPDF(jobLinks);

        // Download the PDF file
        downloadFile(pdfData, 'job-links.pdf', 'application/pdf');
      }
    });
  });
}

function createPDF(jobLinks) {
  // Create a new jsPDF instance
  const doc = new jsPDF();

  // Set the font size
  doc.setFontSize(12);

  // Set the initial y position
  let yPos = 20;

  // Iterate over the job links and add them to the PDF document
  jobLinks.forEach(link => {
    doc.text(link, 20, yPos);
    yPos += 10;
  });

  // Return the PDF document as data
  return doc.output('arraybuffer');
}

//**************************************************************************** */

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
  const htmlTemplatePath = './template.html'

  const templateContent = fs.readFileSync(htmlTemplatePath, 'utf8');


  let emailBody = jobLinks.map(link => `<a href="https://${domain}${link}">https://${domain}${link}</a>`).join('<br>');
  const renderedTemplate = templateContent.replace('{{jobLinks}}', emailBody);


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