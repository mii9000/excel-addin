# Excel OCR Add-in

This Excel Add-in allows users to import documents, extract text using OCR (Optical Character Recognition), and search through the extracted content directly within Excel.

## Features

1. **File Import & OCR Processing**
   - Import multiple documents (PDF, PNG, JPG, JPEG, TIFF)
   - Process files using Tesseract.js OCR engine
   - View processing status and results

2. **Document Management**
   - View list of imported documents with metadata
   - Remove processed documents

3. **Search Functionality**
   - Search through extracted text
   - View matching text snippets and source documents
   - Highlight matched text

## Setup and Development

### Prerequisites

- Node.js version 16.x or higher (recommended version: 18.x LTS)
- npm version 8.x or higher
- Excel (desktop or online)
- For macOS: Safari or Edge browser for debugging
- For development: Visual Studio Code (recommended)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

### Local Development and Debugging

#### Setting up SSL Certificate (macOS)
When developing locally, you'll need to trust the development SSL certificate:

1. Start the development server:
   ```bash
   npm start
   ```
2. When prompted about the SSL certificate, choose to trust it
3. If not prompted automatically:
   - Open Safari and navigate to `https://localhost:3000`
   - Click "Show Certificate" when warned about the certificate
   - Choose "Always Trust" for the certificate
   - Enter your system password when prompted

#### Debugging in Excel Online
1. Open Excel Online (www.office.com)
2. Create a new workbook or open an existing one
3. Go to **Insert** > **Office Add-ins** > **Upload My Add-in**
4. Browse to your project folder and select the `manifest.xml` file
5. The add-in will appear in the ribbon under the Home tab
6. To debug:
   - Open browser Developer Tools (F12 or Right Click > Inspect)
   - Navigate to the Console tab to view logs
   - Set breakpoints in the Sources tab under the localhost domain
   - Use the React Developer Tools browser extension for component debugging

#### Debugging in Excel for Mac
1. Open Excel for Mac
2. Go to **Insert** > **Add-ins** > **My Add-ins** (Drop-down) > **Upload My Add-in**
3. Browse to your project folder and select the `manifest.xml` file
4. To debug:
   - Open Safari's Web Inspector
   - Enable the Develop menu in Safari:
     - Go to Safari > Preferences > Advanced
     - Check "Show Develop menu in menu bar"
   - In Excel, start your add-in
   - In Safari: Develop > [Your Computer Name] > localhost:3000
   - Use the Web Inspector to view console logs and set breakpoints

### Common Development Tasks

#### Updating the Add-in
1. Make your code changes
2. The dev server will automatically rebuild
3. In Excel:
   - Online: Refresh the browser page
   - Desktop: Close and reopen the task pane

#### Testing File Processing
1. Prepare test files in various formats (PDF, PNG, JPG)
2. Keep file sizes reasonable (< 5MB) for optimal performance
3. Test both successful and error scenarios
4. Monitor the console for OCR processing logs

#### Troubleshooting
- If the add-in doesn't load:
  - Check the console for errors
  - Verify the dev server is running (`npm start`)
  - Ensure the SSL certificate is trusted
  - Clear browser cache and reload
- If OCR fails:
  - Check file format compatibility
  - Verify file isn't corrupted
  - Monitor memory usage for large files

### Sideloading the Add-in

#### In Excel Desktop (macOS):
1. Open Excel
2. Go to the **Insert** tab > **Add-ins** > **My Add-ins**
3. Click on **Upload My Add-in**
4. Browse to the manifest.xml file in the project directory and select it
5. The add-in should now appear in the ribbon under the Home tab

#### In Excel Online:
1. Open Excel Online
2. Go to **Insert** > **Office Add-ins**
3. Select **Upload My Add-in** and upload the manifest.xml file
4. The add-in will be available in the ribbon

## Technical Details

- **Frontend**: React.js with TypeScript
- **UI Framework**: Fluent UI (formerly Office UI Fabric)
- **OCR Library**: Tesseract.js
- **Office Integration**: Office.js API

## Building for Production

To create a production build:

```
npm run build
```

The build files will be in the `dist` directory, which you can then host on a web server.

## License

MIT 