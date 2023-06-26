let scrapeLinks = document.getElementById('scrapeLinks');

scrapeLinks.addEventListener("click", async () => {
  // Get the current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute a script to scrape the job links, titles, and categories from the page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeLinksFromPage,
  }, async (results) => {
    // Handle the results returned by the content script
    if (results && results.length > 0 && results[0].result) {
      const { jobLinks, jobTitles, jobLocations } = results[0].result;

      // Scrape the departments from each job page
      const departments = await scrapeDepartmentsFromPages(jobLinks);

      // Create the EML file with the job links, titles, departments, and categories
      const emlData = createEML(jobLinks, jobTitles, jobLocations, departments);

      // Download the EML file
      downloadFile(emlData, 'SAP_Newsletter.eml');
    }
  });
});

// Function to scrape links, titles, and categories from the web page
function scrapeLinksFromPage() {
  const jobLinkElements = document.querySelectorAll('a.jobTitle-link');
  const visibleJobLinkElements = Array.from(jobLinkElements).filter(element => {
    // Check if the element or any of its parents is hidden
    return !element.offsetParent || !element.closest(':not([style*="display:none"])');
  });

  const links = visibleJobLinkElements.map(element => element.href);
  const jobTitles = visibleJobLinkElements.map(element => element.innerText);

  const jobLocationElements = document.querySelectorAll('span.jobLocation');
  const visibleJobLocationElements = Array.from(jobLocationElements).filter(element => {
    // Check if the element or any of its parents is hidden
    return !element.offsetParent || !element.closest(':not([style*="display:none"])');
  });
  const jobLocations = visibleJobLocationElements.map(element => element.innerText);

  return { jobLinks: links, jobTitles, jobLocations };
}

// Function to scrape departments from job pages
async function scrapeDepartmentsFromPages(jobLinks) {
    const departments = [];
    for (let i = 0; i < jobLinks.length; i++) {
      const jobPageResponse = await fetch(jobLinks[i]);
      const jobPageText = await jobPageResponse.text();
      const department = extractDepartmentFromPage(jobPageText);
      departments.push(department);
    }
    return departments;
  }
  
  // Function to extract department from a job page
  function extractDepartmentFromPage(pageText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageText, 'text/html');
  
    // Use appropriate logic to extract the department information from the parsed HTML document
    const departmentElement = doc.querySelector('span[data-careersite-propertyid="department"]');
  
    return departmentElement ? departmentElement.innerText.trim() : '';
  }
  
  

// Function to create an EML file with the job links, titles, departments, and categories
function createEML(jobLinks, jobTitles, jobLocations, departments) {
    const emailHeaders = [
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'From: me@example.com',
      'To: you@example.com',
      'Subject: Job Links',
    ].join('\r\n');
  
    const emailBody = jobLinks
      .map((link, index) => {
        const jobTitlesStyle = 'font-size: 13.3333px; color: #000000; text-decoration: none solid rgb(0, 0, 0); font-family: Arial, sans-serif;';
        const jobLocationStyle = 'font-size: 10.6667px; color: #A5A5A5; text-decoration: none solid rgb(165, 165, 165); font-family: Arial, sans-serif;';
        const jobDepartmentStyle = 'font-size: 10.6667px; color: #808080; text-decoration: none solid rgb(128, 128, 128); font-family: Arial, sans-serif;';
  
        const department = departments[index] ? departments[index] : 'N/A';
  
        const jobLinkHtml = `
          <p style="font-size: 13.3333px; color: #0563C1; text-decoration: none solid rgb(5, 99, 193); font-family: Arial, sans-serif;">
            <strong><span style="margin-right: 5px; color: #000000;">&#9642;</span> <span style="${jobTitlesStyle}">${jobTitles[index]}</span> - 
            <span style="${jobLocationStyle}">${jobLocations[index]}</span> - 
            <span style="${jobDepartmentStyle}">${department}</span> -
            <a href="${link}">Internal link</a>
          </p>
        `;
        return jobLinkHtml;
      })
      .join('');

      const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
        <link rel="stylesheet" type="text/css" href="style.css">
        </head>
        <body>
        <p class="positions">(INTERNAL / EXTERNAL) POSITIONS:</p>
          ${emailBody}
        </body>
      </html>
    `;    
  
    const emlData = `${emailHeaders}\r\n\r\n${emailBody}
    
    ${htmlTemplate}`;
  
    return emlData;
  }
  
  

// Function to download a file
function downloadFile(data, filename) {
    const blob = new Blob([data], { type: 'message/rfc822' });
  
    // Create a temporary anchor element
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
  
    // Programmatically click the anchor element to initiate the download
    anchor.click();
  
    // Clean up the object URL
    URL.revokeObjectURL(anchor.href);
  }
  
  
  
  
