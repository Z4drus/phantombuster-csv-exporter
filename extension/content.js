// content.js

// Listen to messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractTable') {
      const data = extractTableData();
      const cityName = extractCityName();
      // Apply deduplication
      const deduplicatedData = removeDuplicates(data);
      sendResponse({ data: deduplicatedData, cityName, originalCount: data.length, deduplicatedCount: deduplicatedData.length });
    } else if (request.action === 'extractTableWithPagination') {
      extractTableWithPagination().then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('Error during pagination extraction:', error);
        sendResponse({ data: null, cityName: null, error: error.message });
      });
    }
    // Return true to indicate asynchronous response
    return true;
  });

  /**
   * Removes duplicates/triplicates based on Title or Phone Number fields
   * @param {Array<Array<string>>} data Table data (including headers)
   * @returns {Array<Array<string>>} Data without duplicates
   */
  function removeDuplicates(data) {
    if (!data || data.length <= 1) {
      return data; // No data or only headers
    }

    const headers = data[0];
    const rows = data.slice(1);
    
    if (rows.length === 0) {
      return data; // Only headers
    }

    // Find indices of Title and Phone Number columns
    const titleIndex = findColumnIndex(headers, ['title', 'nom', 'name', 'business name', 'establishment']);
    const phoneIndex = findColumnIndex(headers, ['phone', 'telephone', 'tel', 'number', 'numéro', 'téléphone']);
    
    console.log(`Found indices - Title: ${titleIndex}, Phone: ${phoneIndex}`);
    console.log(`Available headers:`, headers);

    // If no reference column is found, return data without modification
    if (titleIndex === -1 && phoneIndex === -1) {
      console.warn('No Title or Phone Number column found for deduplication');
      return data;
    }

    // Create a Set to store unique keys
    const seenKeys = new Set();
    const uniqueRows = [];

    rows.forEach((row, index) => {
      const keys = [];
      
      // Create key based on Title and/or Phone Number
      if (titleIndex !== -1 && row[titleIndex]) {
        const title = normalizeText(row[titleIndex]);
        if (title) keys.push(`title:${title}`);
      }
      
      if (phoneIndex !== -1 && row[phoneIndex]) {
        const phone = normalizePhone(row[phoneIndex]);
        if (phone) keys.push(`phone:${phone}`);
      }

      // If no key is generated, keep the row (incomplete data)
      if (keys.length === 0) {
        uniqueRows.push(row);
        return;
      }

      // Check if we've already seen this combination
      const hasMatch = keys.some(key => seenKeys.has(key));
      
      if (!hasMatch) {
        // New, add it
        keys.forEach(key => seenKeys.add(key));
        uniqueRows.push(row);
      } else {
        console.log(`Duplicate detected at row ${index + 2}:`, keys);
      }
    });

    console.log(`Deduplication completed: ${rows.length} → ${uniqueRows.length} rows (${rows.length - uniqueRows.length} duplicates removed)`);
    
    return [headers, ...uniqueRows];
  }

  /**
   * Finds column index based on possible keywords
   * @param {Array<string>} headers Table headers
   * @param {Array<string>} keywords Keywords to search for
   * @returns {number} Column index or -1 if not found
   */
  function findColumnIndex(headers, keywords) {
    for (let i = 0; i < headers.length; i++) {
      const headerText = headers[i].toLowerCase().trim();
      for (const keyword of keywords) {
        if (headerText.includes(keyword.toLowerCase())) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * Normalizes text for comparison (removes spaces, punctuation, case)
   * @param {string} text Text to normalize
   * @returns {string} Normalized text
   */
  function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .toLowerCase()
      .trim()
      // Remove common punctuation
      .replace(/[.,;:!?'"()[\]{}\-_]/g, '')
      // Normalize multiple spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing spaces
      .trim()
      // Remove short non-significant words
      .replace(/\b(the|le|la|les|un|une|des|and|et|&|of|de|du|des)\b/g, '')
      // Clean spaces again
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalizes phone number for comparison
   * @param {string} phone Phone number to normalize
   * @returns {string} Normalized number
   */
  function normalizePhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    
    // Keep only digits and + sign
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // If number starts with 00, replace with +
    if (normalized.startsWith('00')) {
      normalized = '+' + normalized.substring(2);
    }
    
    // If number doesn't start with + and has more than 10 digits, add + at beginning
    if (!normalized.startsWith('+') && normalized.length > 10) {
      normalized = '+' + normalized;
    }
    
    // Remove numbers too short (less than 8 significant digits)
    const digitsOnly = normalized.replace(/[^\d]/g, '');
    if (digitsOnly.length < 8) {
      return '';
    }
    
    return normalized;
  }

  /**
   * Extracts city name from the page
   * @returns {string|null} City name or null if not found
   */
  function extractCityName() {
    // Method 1: Look for element with id "agent-name"
    const agentNameElement = document.getElementById('agent-name');
    if (agentNameElement) {
      const cityName = agentNameElement.textContent?.trim();
      if (cityName) {
        console.log(`City name found via agent-name: ${cityName}`);
        return cityName;
      }
    }

    // Method 2: Look in elements with specific classes
    const headingSelectors = [
      'h1.text-heading-primary',
      'h2.text-heading-primary', 
      'h3.text-heading-primary',
      '.text-heading-m',
      '.font-bold.text-heading-m'
    ];

    for (const selector of headingSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent?.trim();
        // Verify it's not a generic title
        if (text && text.length > 2 && text.length < 50 && 
            !text.toLowerCase().includes('phantom') &&
            !text.toLowerCase().includes('google') &&
            !text.toLowerCase().includes('maps') &&
            !text.toLowerCase().includes('export')) {
          console.log(`City name found via selector ${selector}: ${text}`);
          return text;
        }
      }
    }

    // Method 3: Look in navigation or breadcrumb elements
    const breadcrumbSelectors = [
      '[role="navigation"] span',
      '.breadcrumb span',
      'nav span',
      '.location-name',
      '.city-name'
    ];

    for (const selector of breadcrumbSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent?.trim();
        if (text && text.length > 2 && text.length < 50) {
          console.log(`City name found via breadcrumb ${selector}: ${text}`);
          return text;
        }
      }
    }

    console.log('No city name found');
    return null;
  }

  /**
   * Extracts all tables from all pagination pages
   * @returns {Promise<Object>} All combined data with city name
   */
  async function extractTableWithPagination() {
    const allData = [];
    let headers = null;
    let currentPage = 1;
    let hasMorePages = true;

    // Function to wait for delay
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Extract city name once at the beginning
    const cityName = extractCityName();

    // Detect total number of pages if possible
    const totalPages = detectTotalPages();
    console.log(`Total pages detected: ${totalPages || 'unknown'}`);

    try {
      while (hasMorePages) {
        console.log(`Extracting page ${currentPage}${totalPages ? ` of ${totalPages}` : ''}...`);
        
        // Extract data from current page
        const pageData = extractTableData();
        
        if (pageData && pageData.length > 0) {
          if (currentPage === 1) {
            // First page: keep headers and all data
            headers = pageData[0];
            allData.push(...pageData);
          } else {
            // Following pages: ignore headers (first line) and add only data
            if (pageData.length > 1) {
              allData.push(...pageData.slice(1));
            }
          }
        }

        // Check if we've reached total number of pages
        if (totalPages && currentPage >= totalPages) {
          hasMorePages = false;
          console.log(`All pages have been processed (${totalPages} pages)`);
          break;
        }

        // Look for next page button
        const nextPageButton = findNextPageButton(currentPage + 1);
        
        if (nextPageButton && !nextPageButton.disabled) {
          // Click next button
          console.log(`Clicking on page ${currentPage + 1}`);
          nextPageButton.click();
          
          // Wait for page to load
          await wait(2000);
          
          // Wait for table to update
          await waitForTableUpdate();
          
          currentPage++;
        } else {
          hasMorePages = false;
          console.log(`No next page found after page ${currentPage}`);
        }
      }

      console.log(`Extraction completed. Total of ${allData.length} rows from ${currentPage} pages.`);
      
      // Apply deduplication on all data
      const originalCount = allData.length;
      const deduplicatedData = removeDuplicates(allData);
      const deduplicatedCount = deduplicatedData.length;
      
      console.log(`Deduplication applied on all pages: ${originalCount} → ${deduplicatedCount} rows`);
      
      return { 
        data: deduplicatedData, 
        cityName, 
        originalCount, 
        deduplicatedCount, 
        pagesProcessed: currentPage 
      };

    } catch (error) {
      console.error('Error during pagination extraction:', error);
      throw error;
    }
  }

  /**
   * Automatically detects total number of available pages
   * @returns {number|null} Total number of pages or null if not detectable
   */
  function detectTotalPages() {
    // Method 1: Look for pagination buttons and find highest number
    const paginationButtons = document.querySelectorAll('button[analyticsid="CsvInteractiveTablePaginationButton"]');
    let maxPage = 0;
    
    for (const button of paginationButtons) {
      const analyticsVal = button.getAttribute('analyticsval1');
      const labelVal = button.getAttribute('label');
      const spanText = button.querySelector('span')?.textContent?.trim();
      
      const pageNum = parseInt(analyticsVal || labelVal || spanText || '0');
      if (pageNum > maxPage) {
        maxPage = pageNum;
      }
    }
    
    if (maxPage > 0) {
      return maxPage;
    }
    
    // Method 2: Look in all numeric buttons
    const allButtons = document.querySelectorAll('button');
    maxPage = 0;
    
    for (const button of allButtons) {
      const buttonText = button.textContent?.trim();
      const pageNum = parseInt(buttonText || '0');
      
      // Verify it's actually a page number (between 1 and 1000 for example)
      if (pageNum > 0 && pageNum <= 1000 && pageNum > maxPage) {
        // Verify the button seems to be a pagination button
        const buttonClasses = button.className || '';
        if (buttonClasses.includes('pagination') || 
            buttonClasses.includes('page') ||
            button.parentElement?.className?.includes('pagination') ||
            button.parentElement?.className?.includes('page') ||
            button.getAttribute('analyticsid')?.includes('Pagination')) {
          maxPage = pageNum;
        }
      }
    }
    
    // Method 3: Look for text indicators like "Page 1 of 5"
    const pageIndicators = document.querySelectorAll('*');
    for (const element of pageIndicators) {
      const text = element.textContent?.trim() || '';
      const match = text.match(/(?:page\s+\d+\s+(?:sur|of|\/)\s+(\d+))|(?:(\d+)\s+pages?)/i);
      if (match) {
        const totalFromMatch = parseInt(match[1] || match[2]);
        if (totalFromMatch > maxPage) {
          maxPage = totalFromMatch;
        }
      }
    }
    
    return maxPage > 0 ? maxPage : null;
  }

  /**
   * Finds pagination button for a specific page
   * @param {number} pageNumber Page number to search for
   * @returns {HTMLElement|null} Found button or null
   */
  function findNextPageButton(pageNumber) {
    // Method 1: Look for buttons with analyticsid="CsvInteractiveTablePaginationButton"
    let paginationButtons = document.querySelectorAll('button[analyticsid="CsvInteractiveTablePaginationButton"]');
    
    for (const button of paginationButtons) {
      // Check analyticsval1 or label attribute
      const analyticsVal = button.getAttribute('analyticsval1');
      const labelVal = button.getAttribute('label');
      const spanText = button.querySelector('span')?.textContent?.trim();
      
      if (analyticsVal === pageNumber.toString() || 
          labelVal === pageNumber.toString() || 
          spanText === pageNumber.toString()) {
        return button;
      }
    }
    
    // Method 2: Look among all buttons containing page number
    paginationButtons = document.querySelectorAll('button');
    
    for (const button of paginationButtons) {
      const buttonText = button.textContent?.trim();
      const spanText = button.querySelector('span')?.textContent?.trim();
      
      // Check if button contains page number
      if (buttonText === pageNumber.toString() || spanText === pageNumber.toString()) {
        // Verify it's actually a pagination button (not something else)
        const buttonClasses = button.className || '';
        const isDisabled = button.disabled || buttonClasses.includes('disabled');
        
        // If button is not disabled and seems to be a pagination button
        if (!isDisabled && (
          buttonClasses.includes('pagination') ||
          buttonClasses.includes('page') ||
          button.parentElement?.className?.includes('pagination') ||
          button.parentElement?.className?.includes('page') ||
          button.getAttribute('analyticsid')?.includes('Pagination') ||
          button.getAttribute('role') === 'button'
        )) {
          return button;
        }
      }
    }
    
    // Method 3: Look with more generic selectors
    const commonSelectors = [
      `[data-page="${pageNumber}"]`,
      `[data-page-number="${pageNumber}"]`,
      `[aria-label*="${pageNumber}"]`,
      `.page-${pageNumber}`,
      `.pagination button:contains("${pageNumber}")`,
      `button[title="${pageNumber}"]`
    ];
    
    for (const selector of commonSelectors) {
      try {
        const button = document.querySelector(selector);
        if (button && !button.disabled) {
          return button;
        }
      } catch (e) {
        // Ignore selector errors
        continue;
      }
    }
    
    return null;
  }

  /**
   * Waits for table to update after page change
   * @returns {Promise<void>}
   */
  async function waitForTableUpdate() {
    const maxWaitTime = 1000; // 10 seconds max
    const checkInterval = 100; // Check every 100ms
    let waited = 0;
    
    // Get reference to current table
    const table = document.querySelector('table');
    if (!table) return;
    
    const initialTableHTML = table.innerHTML;
    
    while (waited < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
      
      const currentTable = document.querySelector('table');
      if (currentTable && currentTable.innerHTML !== initialTableHTML) {
        // Table has changed, wait a bit more to ensure loading is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
    }
    
    console.warn('Table does not seem to have updated in time');
  }
  
  /**
   * Extracts HTML table (first <table> in DOM) as array of arrays.
   * - Gets headers (thead > th).
   * - Gets each row from tbody > tr, then each cell (td).
   * - If cell contains <a>, takes href attribute. Otherwise takes raw text (textContent).
   */
  function extractTableData() {
    const table = document.querySelector('table');
    if (!table) {
      return [];
    }

    // 1. Headers
    const headers = [];
    const thList = table.querySelectorAll('thead th');
    if (thList.length) {
      thList.forEach(th => {
        const span = th.querySelector('span') || th;
        headers.push((span.textContent || '').trim());
      });
    }

    // 2. Body rows
    const rows = [];
    const trList = table.querySelectorAll('tbody tr');
    trList.forEach(tr => {
      const rowData = [];
      const tdList = tr.querySelectorAll('td');
      tdList.forEach(td => {
        // If cell contains link <a>, take href, otherwise text
        const a = td.querySelector('a');
        if (a && a.href) {
          rowData.push(a.href.trim());
        } else {
          rowData.push((td.textContent || '').trim());
        }
      });
      // If row is not empty, add it
      if (rowData.length) {
        rows.push(rowData);
      }
    });

    // If we have headers, place them as first line
    if (headers.length) {
      return [headers, ...rows];
    } else {
      // Otherwise, just return rows
      return rows;
    }
  }
  