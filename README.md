# Exoplanet Scout 🔭

An interactive web application for collecting and analyzing exoplanet data using the transit method. Built for astronomers and citizen scientists to manually enter data points or import datasets for comprehensive exoplanet research.

## Features

### 🌟 Core Functionality
- **Manual Data Entry**: Add exoplanet transit data through an intuitive form interface
- **Data Import/Export**: Import CSV files or export your data for backup and sharing
- **Interactive Visualizations**: Scatter plots and histograms to analyze relationships in your data
- **Comprehensive Data Management**: Sort, filter, and search through your exoplanet database
- **AI Integration**: Connect your trained AI models for advanced analysis and predictions

### 📊 Data Fields Supported
- **Orbital Properties**:
  - Orbital Period (days)
  - Transit Depth (parts per million)
  - Transit Duration (hours)
  - Signal-to-Noise Ratio

- **Stellar Properties**:
  - Stellar Radius (Solar Radii)
  - Stellar Temperature (Kelvin)
  - Stellar Magnitude

- **Metadata**:
  - Planet Name
  - Date Added
  - Notes

### 🎯 Key Features
- **Real-time Validation**: Form validation ensures data quality
- **Local Storage**: Data persists in your browser
- **Responsive Design**: Works on desktop and mobile devices
- **CSV Template**: Download a template file for easy data import
- **Column Visibility**: Show/hide table columns based on your needs
- **Advanced Sorting**: Sort by any column with visual indicators
- **AI Model Integration**: Connect REST APIs, cloud services, or local models
- **Multiple Analysis Types**: Classification, prediction, anomaly detection, and habitability assessment

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm (included with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   cd exoplanet-scout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Adding Exoplanet Data

1. Navigate to the **"Add Data"** tab
2. Fill in the required fields:
   - Planet name (required)
   - Orbital period in days
   - Transit depth in parts per million (ppm)
   - Transit duration in hours
   - Signal-to-noise ratio
   - Stellar radius in solar radii
   - Stellar temperature in Kelvin
   - Stellar magnitude
3. Optionally add notes
4. Click **"Add Exoplanet"**

### Viewing and Managing Data

1. Navigate to the **"View Data"** tab
2. Use the search box to find specific planets
3. Toggle column visibility using the eye icons
4. Click column headers to sort data
5. Use the trash icon to delete entries

### Importing Data

1. Navigate to the **"Import/Export"** tab
2. Download the CSV template to see the required format
3. Prepare your CSV file with the following columns:
   - Name, Orbital Period (days), Transit Depth (ppm), Transit Duration (hours), Signal-to-Noise Ratio, Stellar Radius (Solar Radii), Stellar Temperature (K), Stellar Magnitude, Date Added, Notes
4. Click **"Select CSV File"** and choose your file
5. Review the import results and fix any errors if needed

### Visualizing Data

1. Navigate to the **"Visualize"** tab
2. Choose between scatter plots and histograms
3. For scatter plots, select X and Y axes from available parameters
4. For histograms, select the field to analyze
5. Hover over data points for detailed information

### AI Analysis

1. Navigate to the **"AI Analysis"** tab
2. Configure your AI model endpoint:
   - Enter your model's API endpoint URL
   - Add API key if required
   - Set model name and timeout
3. Test the connection to ensure your model is accessible
4. Select analysis type (classification, prediction, anomaly detection, etc.)
5. Run analysis on your exoplanet data
6. Review insights, recommendations, and detected anomalies

For detailed AI integration instructions, see [AI_INTEGRATION.md](AI_INTEGRATION.md).

## Data Validation

The application includes comprehensive validation:
- All numeric fields must be valid numbers
- Most fields must be positive values
- Planet names are required
- Import validation shows detailed error messages for problematic rows

## CSV Format

The CSV import expects the following format:

```csv
Name,Orbital Period (days),Transit Depth (ppm),Transit Duration (hours),Signal-to-Noise Ratio,Stellar Radius (Solar Radii),Stellar Temperature (K),Stellar Magnitude,Date Added,Notes
Kepler-442b,112.3,850.2,6.25,15.8,1.2,5770,13.2,2024-01-01T00:00:00.000Z,Example exoplanet data
```

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **File Operations**: FileSaver.js

## Project Structure

```
src/
├── components/          # React components
│   ├── ExoplanetForm.tsx       # Data entry form
│   ├── ExoplanetTable.tsx      # Data display table
│   ├── DataImportExport.tsx    # Import/export functionality
│   └── DataVisualization.tsx   # Charts and graphs
├── types/               # TypeScript type definitions
│   └── exoplanet.ts
├── utils/               # Utility functions
│   └── dataManager.ts   # Data management logic
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Data Sources

This tool is designed to work with data from:
- Kepler Space Telescope
- TESS (Transiting Exoplanet Survey Satellite)
- Ground-based surveys
- Citizen science projects
- Manual observations

## License

This project is open source and available under the TSP License.

## Support

For questions, issues, or feature requests, please open an issue in the project repository.

---

**Happy planet hunting! 🌌**
