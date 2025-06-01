// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportBtn');
    const exportAllBtn = document.getElementById('exportAllBtn');
    const statusDiv = document.getElementById('status');
  
    // Simple export (existing function)
    exportBtn.addEventListener('click', () => {
      statusDiv.textContent = 'Extracting data…';
      // 1. Get the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs.length) {
          statusDiv.textContent = 'No active tab found.';
          return;
        }
        const activeTabId = tabs[0].id;
        // 2. Send message to content script to extract table
        chrome.tabs.sendMessage(
          activeTabId,
          { action: 'extractTable' },
          response => {
            if (!response || !response.data) {
              statusDiv.textContent = 'No table found on this page.';
              return;
            }
            const tableData = response.data; // Array<Array<string>>
            const cityName = response.cityName; // string|null
            
            if (!tableData.length) {
              statusDiv.textContent = 'Table is empty or not found.';
              return;
            }
            // 3. Generate CSV
            const csvContent = arrayToCSV(tableData);
            // 4. Trigger download with city name
            const filename = generateFilename(cityName, false);
            downloadCSV(csvContent, filename);
            
            // Display deduplication statistics
            let statusMessage = 'Export completed!';
            if (response.originalCount && response.deduplicatedCount && response.originalCount !== response.deduplicatedCount) {
              const duplicatesRemoved = response.originalCount - response.deduplicatedCount;
              statusMessage += ` ${response.deduplicatedCount} rows exported (${duplicatesRemoved} duplicates removed).`;
            } else {
              statusMessage += ` ${tableData.length} rows exported.`;
            }
            statusDiv.textContent = statusMessage;
          }
        );
      });
    });

    // Export with automatic pagination (new function)
    exportAllBtn.addEventListener('click', () => {
      statusDiv.textContent = 'Extracting data from all pages…';
      exportAllBtn.disabled = true;
      exportBtn.disabled = true;
      
      // 1. Get the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs.length) {
          statusDiv.textContent = 'No active tab found.';
          exportAllBtn.disabled = false;
          exportBtn.disabled = false;
          return;
        }
        const activeTabId = tabs[0].id;
        
        // 2. Send message to content script to extract all pages
        chrome.tabs.sendMessage(
          activeTabId,
          { action: 'extractTableWithPagination' },
          response => {
            exportAllBtn.disabled = false;
            exportBtn.disabled = false;
            
            if (!response || !response.data) {
              if (response && response.error) {
                statusDiv.textContent = `Error: ${response.error}`;
              } else {
                statusDiv.textContent = 'No table found on this page.';
              }
              return;
            }
            
            const tableData = response.data; // Array<Array<string>>
            const cityName = response.cityName; // string|null
            
            if (!tableData.length) {
              statusDiv.textContent = 'Table is empty or not found.';
              return;
            }
            
            // 3. Generate CSV
            const csvContent = arrayToCSV(tableData);
            // 4. Trigger download with city name
            const filename = generateFilename(cityName, true);
            downloadCSV(csvContent, filename);
            
            // Display deduplication statistics
            let statusMessage = 'Export completed!';
            if (response.originalCount && response.deduplicatedCount && response.originalCount !== response.deduplicatedCount) {
              const duplicatesRemoved = response.originalCount - response.deduplicatedCount;
              statusMessage += ` ${response.deduplicatedCount} rows exported (${duplicatesRemoved} duplicates removed).`;
            } else {
              statusMessage += ` ${tableData.length} rows exported.`;
            }
            statusDiv.textContent = statusMessage;
          }
        );
      });
    });
  });

  /**
   * Generates a filename based on the city name
   * @param {string|null} cityName The city name
   * @param {boolean} isComplete Indicates if it's a complete export (all pages)
   * @returns {string} The filename
   */
  function generateFilename(cityName, isComplete = false) {
    const date = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    const type = isComplete ? 'complete' : 'page';
    
    // Clean city name for filename
    let cleanCityName = 'export';
    if (cityName) {
      cleanCityName = cityName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/-+/g, '_') // Replace dashes with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
      
      // Ensure name is not empty after cleaning
      if (!cleanCityName || cleanCityName.length === 0) {
        cleanCityName = 'export';
      }
    }
    
    return `${cleanCityName}_${type}_${date}.csv`;
  }
  
  /**
   * Converts a 2D array to CSV text.
   * - Handles quote escaping.
   * @param {Array<Array<string>>} data
   * @returns {string} CSV as string
   */
  function arrayToCSV(data) {
    return data
      .map(row => {
        return row
          .map(cell => {
            // Double quotes and surround field with quotes if necessary
            const cellText = cell.replace(/"/g, '""');
            // If cell contains comma, newline or quote, surround with quotes
            if (/[",\r\n]/.test(cellText)) {
              return `"${cellText}"`;
            }
            return cellText;
          })
          .join(',');
      })
      .join('\r\n');
  }
  
  /**
   * Creates a CSV blob and triggers download in the browser.
   * @param {string} csvContent
   * @param {string} filename
   */
  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    // Must add element to DOM for click() to work in Chrome
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  