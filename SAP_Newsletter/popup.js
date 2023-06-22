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
  const jobTitleElements = document.querySelectorAll('.a.jobTitle-link');
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
    <strong><span style="margin-right: 5px; color: #000000;">&#9642;</span> <span style="${jobTitlesStyle}">${jobTitles[index]}</span> - 
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
    p.positions {
      font-size: 16px;
      color: #008FD3;
    }
    /* Font Definitions */
    @font-face {
      font-family: Wingdings;
      panose-1: 5 0 0 0 0 0 0 0 0 0;
    }

    @font-face {
      font-family: "Cambria Math";
      panose-1: 2 4 5 3 5 4 6 3 2 4;
    }

    @font-face {
      font-family: Calibri;
      panose-1: 2 15 5 2 2 2 4 3 2 4;
    }

    /* Style Definitions */
    p.MsoNormal,
    li.MsoNormal,
    div.MsoNormal {
      margin: 0cm;
      font-size: 12.0pt;
      font-family: "Times New Roman", serif;
      color: #222222;
    }

    a:link,
    span.MsoHyperlink {
      mso-style-priority: 99;
      color: #0563C1;
      text-decoration: underline;
    }

    span.MsoSmartlink {
      mso-style-priority: 99;
      color: blue;
      background: #F3F2F1;
      text-decoration: underline;
    }

    p.boxbullet,
    li.boxbullet,
    div.boxbullet {
      mso-style-name: boxbullet;
      mso-style-priority: 99;
      margin-top: 3.75pt;
      margin-right: 0cm;
      margin-bottom: 3.75pt;
      margin-left: 0cm;
      line-height: 15.75pt;
      font-size: 12.0pt;
      font-family: "Times New Roman", serif;
      color: #666666;
    }

    p.header,
    li.header,
    div.header {
      mso-style-name: header;
      mso-style-priority: 99;
      margin-top: 0cm;
      margin-right: 0cm;
      margin-bottom: 3.75pt;
      margin-left: 0cm;
      mso-line-height-alt: 17.25pt;
      font-size: 18.0pt;
      font-family: "Arial", sans-serif;
      color: black;
      font-weight: bold;
    }

    p.subheader,
    li.subheader,
    div.subheader {
      mso-style-name: subheader;
      mso-style-priority: 99;
      margin-top: 3.75pt;
      margin-right: 0cm;
      margin-bottom: 3.75pt;
      margin-left: 0cm;
      line-height: 15.0pt;
      font-size: 15.0pt;
      font-family: "Arial", sans-serif;
      color: black;
    }

    p.footer,
    li.footer,
    div.footer {
      mso-style-name: footer;
      mso-style-priority: 99;
      mso-margin-top-alt: auto;
      margin-right: 0cm;
      mso-margin-bottom-alt: auto;
      margin-left: 0cm;
      line-height: 9.0pt;
      font-size: 7.5pt;
      font-family: "Arial", sans-serif;
      color: #666666;
    }

    p.headline1,
    li.headline1,
    div.headline1 {
      mso-style-name: headline_1;
      mso-style-priority: 99;
      margin-top: 18.75pt;
      margin-right: 0cm;
      mso-margin-bottom-alt: auto;
      margin-left: 0cm;
      line-height: 14.25pt;
      font-size: 12.0pt;
      font-family: "Arial", sans-serif;
      color: #222222;
      text-transform: uppercase;
      font-weight: bold;
    }

    p.headline3,
    li.headline3,
    div.headline3 {
      mso-style-name: headline_3;
      mso-style-priority: 99;
      margin-top: 30.0pt;
      margin-right: 0cm;
      mso-margin-bottom-alt: auto;
      margin-left: 0cm;
      line-height: 12.75pt;
      font-size: 11.5pt;
      font-family: "Arial", sans-serif;
      color: #222222;
      font-weight: bold;
    }

    p.edition,
    li.edition,
    div.edition {
      mso-style-name: edition;
      mso-style-priority: 99;
      mso-margin-top-alt: auto;
      margin-right: 0cm;
      margin-bottom: 12.0pt;
      margin-left: 0cm;
      line-height: 12.0pt;
      font-size: 12.0pt;
      font-family: "Arial", sans-serif;
      color: #008FD3;
      font-weight: bold;
    }

    span.internal1 {
      mso-style-name: internal1;
      font-family: "Arial", sans-serif;
      color: black;
      font-weight: normal;
      font-style: normal;
    }

    span.disclaimer1 {
      mso-style-name: disclaimer1;
      font-family: "Arial", sans-serif;
      color: #555555;
      font-weight: normal;
      font-style: normal;
      text-decoration: none none;
    }

    span.EmailStyle31 {
      mso-style-type: personal-compose;
      font-family: "Calibri", sans-serif;
      color: windowtext;
    }

    .MsoChpDefault {
      mso-style-type: export-only;
      font-size: 10.0pt;
    }

    @page WordSection1 {
      size: 595.3pt 841.9pt;
      margin: 70.85pt 70.85pt 2.0cm 70.85pt;
    }

    div.WordSection1 {
      page: WordSection1;
    }

    /* List Definitions */
    @list l0 {
      mso-list-id: 399408308;
      mso-list-template-ids: -1723044772;
    }

    @list l0:level1 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 36.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l0:level2 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 72.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l0:level3 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 108.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l0:level4 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 144.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l0:level5 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 180.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l0:level6 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 216.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l0:level7 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 252.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l0:level8 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 288.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l0:level9 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 324.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l1 {
      mso-list-id: 439419506;
      mso-list-type: hybrid;
      mso-list-template-ids: 613342150 -1800359268 134807555 134807557 134807553 134807555 134807557 134807553 134807555 134807557;
    }

    @list l1:level1 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 18.0pt;
      text-indent: -18.0pt;
      mso-ansi-font-size: 11.0pt;
      mso-bidi-font-size: 11.0pt;
      font-family: Wingdings;
      color: black;
      mso-style-textfill-fill-color: black;
      mso-style-textfill-fill-alpha: 100.0%;
    }

    @list l1:level2 {
      mso-level-number-format: bullet;
      mso-level-text: o;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 54.0pt;
      text-indent: -18.0pt;
      font-family: "Courier New";
    }

    @list l1:level3 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 90.0pt;
      text-indent: -18.0pt;
      font-family: Wingdings;
    }

    @list l1:level4 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 126.0pt;
      text-indent: -18.0pt;
      font-family: Symbol;
    }

    @list l1:level5 {
      mso-level-number-format: bullet;
      mso-level-text: o;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 162.0pt;
      text-indent: -18.0pt;
      font-family: "Courier New";
    }

    @list l1:level6 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 198.0pt;
      text-indent: -18.0pt;
      font-family: Wingdings;
    }

    @list l1:level7 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 234.0pt;
      text-indent: -18.0pt;
      font-family: Symbol;
    }

    @list l1:level8 {
      mso-level-number-format: bullet;
      mso-level-text: o;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 270.0pt;
      text-indent: -18.0pt;
      font-family: "Courier New";
    }

    @list l1:level9 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 306.0pt;
      text-indent: -18.0pt;
      font-family: Wingdings;
    }

    @list l2 {
      mso-list-id: 468326012;
      mso-list-template-ids: -2119267704;
    }

    @list l2:level1 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 36.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l2:level2 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 72.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l2:level3 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 108.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l2:level4 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 144.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l2:level5 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 180.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l2:level6 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 216.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l2:level7 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 252.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l2:level8 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 288.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l2:level9 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 324.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3 {
      mso-list-id: 1150559387;
      mso-list-template-ids: 826322272;
    }

    @list l3:level1 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 36.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3:level2 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 72.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3:level3 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 108.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3:level4 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 144.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3:level5 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 180.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3:level6 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 216.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3:level7 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 252.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3:level8 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 288.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l3:level9 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 324.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4 {
      mso-list-id: 1661618737;
      mso-list-template-ids: 275396984;
    }

    @list l4:level1 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 36.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4:level2 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 72.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4:level3 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 108.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4:level4 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 144.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4:level5 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 180.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4:level6 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 216.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4:level7 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 252.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4:level8 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 288.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l4:level9 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: 324.0pt;
      mso-level-number-position: left;
      text-indent: -18.0pt;
      mso-ansi-font-size: 10.0pt;
      font-family: Wingdings;
    }

    @list l5 {
      mso-list-id: 2123258811;
      mso-list-type: hybrid;
      mso-list-template-ids: -372069392 -1800359268 134807555 134807557 134807553 134807555 134807557 134807553 134807555 134807557;
    }

    @list l5:level1 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 18.0pt;
      text-indent: -18.0pt;
      mso-ansi-font-size: 11.0pt;
      mso-bidi-font-size: 11.0pt;
      font-family: Wingdings;
      color: black;
      mso-style-textfill-fill-color: black;
      mso-style-textfill-fill-alpha: 100.0%;
    }

    @list l5:level2 {
      mso-level-number-format: bullet;
      mso-level-text: o;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 54.0pt;
      text-indent: -18.0pt;
      font-family: "Courier New";
    }

    @list l5:level3 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 90.0pt;
      text-indent: -18.0pt;
      font-family: Wingdings;
    }

    @list l5:level4 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 126.0pt;
      text-indent: -18.0pt;
      font-family: Symbol;
    }

    @list l5:level5 {
      mso-level-number-format: bullet;
      mso-level-text: o;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 162.0pt;
      text-indent: -18.0pt;
      font-family: "Courier New";
    }

    @list l5:level6 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 198.0pt;
      text-indent: -18.0pt;
      font-family: Wingdings;
    }

    @list l5:level7 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 234.0pt;
      text-indent: -18.0pt;
      font-family: Symbol;
    }

    @list l5:level8 {
      mso-level-number-format: bullet;
      mso-level-text: o;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 270.0pt;
      text-indent: -18.0pt;
      font-family: "Courier New";
    }

    @list l5:level9 {
      mso-level-number-format: bullet;
      mso-level-text: ;
      mso-level-tab-stop: none;
      mso-level-number-position: left;
      margin-left: 306.0pt;
      text-indent: -18.0pt;
      font-family: Wingdings;
    }

    ol {
      margin-bottom: 0cm;
    }

    ul {
      margin-bottom: 0cm;
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
