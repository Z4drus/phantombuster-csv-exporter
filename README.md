# PhantomBuster CSV Exporter - Advanced Table Data Extractor

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)
![Version](https://img.shields.io/badge/version-2.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

## 🚀 Extract Data from Any HTML Table to CSV with Automatic Deduplication

**PhantomBuster CSV Exporter** is a powerful Chrome/Brave browser extension designed for **data extraction**, **web scraping**, and **CSV export** from HTML tables. Perfect for extracting leads, business data, contact information, and any tabular data from websites with automatic pagination support and intelligent duplicate removal.

### 🔥 Key Features for Data Extraction

- ✅ **One-click CSV export** from any HTML table
- ✅ **Automatic pagination handling** - extract data from multiple pages
- ✅ **Smart duplicate detection** - removes duplicates based on Title/Phone Number fields
- ✅ **PhantomBuster compatible** - works perfectly with PhantomBuster scraped data
- ✅ **Lead generation friendly** - ideal for extracting business contacts and leads
- ✅ **Google Maps scraping support** - extract business listings efficiently
- ✅ **LinkedIn data export** - export LinkedIn search results and profiles
- ✅ **Yellow Pages extraction** - scrape business directories
- ✅ **Real estate data export** - extract property listings
- ✅ **E-commerce product extraction** - export product catalogs

## 🎯 Perfect for Data Scientists, Marketers & Lead Generators

Whether you're doing **lead generation**, **market research**, **competitive analysis**, or **data mining**, this extension streamlines your workflow by automating the tedious process of copying data from web tables.

### 🔍 SEO Keywords We Support
- PhantomBuster CSV export
- HTML table to CSV converter
- Web scraping Chrome extension
- Data extraction tool
- Lead generation CSV export
- Business directory scraper
- Contact list extractor
- Pagination data scraper
- Duplicate removal tool
- Table data exporter

## 📋 What Makes This Extension Unique

### 🧠 Intelligent Duplicate Detection
Our advanced deduplication algorithm automatically identifies and removes duplicates by comparing:
- **Business names/titles** (normalized for variations)
- **Phone numbers** (standardized international format)
- **Smart text normalization** (handles punctuation, spacing, case differences)

### 🔄 Automatic Pagination Support
- Automatically detects pagination buttons
- Extracts data from all pages in one operation
- Supports various pagination styles and frameworks
- Progress tracking with page count

### 📊 Export Statistics
- Shows original vs. deduplicated row counts
- Displays number of duplicates removed
- Tracks pages processed
- File naming with timestamps and location data

## 🛠️ Installation Guide

### For Chrome/Chromium Browsers:

1. **Download the Extension**
   ```
   git clone https://github.com/yourusername/phantombuster-csv-exporter.git
   cd phantombuster-csv-exporter
   ```

2. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" ON (top right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `extension` folder from this repository
   - The extension icon should appear in your browser toolbar

### For Brave Browser:
- Follow the same steps as Chrome (Brave uses Chromium engine)

### For Edge Browser:
- Go to `edge://extensions/`
- Follow the same process as Chrome

## 📖 How to Use

### Quick Export (Single Page)
1. Navigate to any webpage with an HTML table
2. Click the extension icon in your browser toolbar
3. Click "Export Current Page"
4. Your CSV file will download automatically

### Advanced Export (All Pages with Deduplication)
1. Navigate to a paginated table (e.g., search results)
2. Click the extension icon
3. Click "Export All Pages"
4. The extension will:
   - Automatically navigate through all pages
   - Extract data from each page
   - Remove duplicates intelligently
   - Download a single consolidated CSV file

### 📁 File Naming Convention
Files are automatically named based on:
- **Location/City name** (if detected)
- **Export type** (single page vs. complete)
- **Date** (YYYY-MM-DD format)

Example: `paris_complete_2024-01-15.csv`

## 🎯 Use Cases & Industries

### 🏢 Business & Lead Generation
- Extract business listings from directories
- Scrape Google Maps results for local businesses
- Export LinkedIn company/people search results
- Collect contact information from industry websites

### 🏠 Real Estate
- Extract property listings from real estate websites
- Scrape rental listings from apartment websites
- Export property details for market analysis

### 🛒 E-commerce & Retail
- Extract product catalogs from competitor websites
- Scrape pricing information for market research
- Export inventory data from supplier websites

### 📊 Market Research
- Collect data from review websites
- Extract survey results from online platforms
- Scrape social media mentions and engagement data

### 📈 SEO & Digital Marketing
- Extract search result data
- Scrape competitor backlink information
- Export keyword research data from tools

## 🔧 Technical Details

### Supported Table Formats
- Standard HTML `<table>` elements
- Tables with `<thead>` and `<tbody>`
- Dynamic tables loaded via JavaScript
- Tables with embedded links (extracts URLs)

### Pagination Detection
- Button-based pagination (`<button>` elements)
- Link-based pagination (`<a>` elements)
- Custom pagination with analytics attributes
- Numeric page indicators

### Data Processing
- **Text normalization**: Removes punctuation, standardizes spacing
- **Phone normalization**: Handles international formats, removes formatting
- **Link extraction**: Automatically extracts URLs from table cells
- **City detection**: Automatically detects location for file naming

## 🛡️ Privacy & Security

- **No data collection**: All processing happens locally in your browser
- **No external servers**: Data never leaves your device
- **Open source**: Full code transparency for security audits
- **No tracking**: We don't track your usage or data

## 🔧 Development & Customization

### File Structure
```
extension/
├── manifest.json       # Extension configuration
├── content.js         # Main extraction logic
├── popup.html         # User interface
├── popup.js           # UI interaction logic
└── README.md          # This file
```

### Customizing Duplicate Detection
You can modify the duplicate detection logic in `content.js`:
- Add new field types for comparison
- Adjust text normalization rules
- Customize phone number formatting

### Adding New Pagination Types
Extend the `findNextPageButton()` function to support additional pagination patterns.

## 🐛 Troubleshooting

### Common Issues

**Extension doesn't detect tables**
- Ensure the page has loaded completely
- Check if the table uses standard HTML `<table>` tags
- Some dynamic tables may need a page refresh

**Pagination not working**
- Verify the page uses standard pagination buttons
- Some custom pagination may require code modifications
- Check browser console for error messages

**Duplicates not being removed**
- Ensure your table has recognizable "Title" or "Phone" columns
- Check the browser console for column detection logs
- Column headers must contain keywords like "name", "title", "phone", "number"

## 📈 Changelog

### Version 2.1 (Latest)
- ✅ Added intelligent duplicate detection
- ✅ Improved pagination algorithm
- ✅ Enhanced file naming with location detection
- ✅ Better error handling and user feedback
- ✅ Comprehensive logging for debugging

### Version 2.0
- ✅ Added automatic pagination support
- ✅ Multi-page data extraction
- ✅ Progress tracking

### Version 1.0
- ✅ Basic table extraction
- ✅ CSV export functionality

## 🤝 Contributing

We welcome contributions! Please feel free to:
- Report bugs via GitHub Issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏷️ Tags & Keywords

`chrome-extension` `csv-export` `data-extraction` `web-scraping` `phantombuster` `lead-generation` `table-scraper` `pagination-scraper` `duplicate-removal` `data-mining` `business-intelligence` `market-research` `linkedin-scraper` `google-maps-scraper` `contact-extractor`

---

⭐ **Star this repository** if it helped you extract data more efficiently!

🔗 **Share with your team** - Help others streamline their data extraction workflow! 