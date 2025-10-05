<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Exoplanet Scout - Development Instructions

This is an interactive web application for exoplanet scouting using the transit method. The application allows users to manually add data points or import CSV files for comprehensive exoplanet data collection and analysis.

## Project Setup Complete ✅

- [x] Vite React TypeScript project successfully created
- [x] Interactive webapp for exoplanet scouting using transit method with React TypeScript  
- [x] All components and features implemented
- [x] Tailwind CSS configured and working
- [x] Project successfully compiled and running
- [x] Development server active at http://localhost:5173
- [x] Comprehensive README.md documentation created

## Key Features Implemented

### Data Management
- Manual data entry form with validation for all exoplanet parameters
- Data import/export functionality with CSV support
- Local storage persistence
- Data validation and error handling

### User Interface
- Responsive design with Tailwind CSS
- Tabbed navigation (Add Data, View Data, Import/Export, Visualize)
- Interactive data table with sorting, filtering, and column visibility
- Form validation with real-time error feedback

### Data Visualization
- Scatter plots for analyzing relationships between parameters
- Histograms for data distribution analysis
- Interactive charts with tooltips using Recharts

### Data Fields Supported
- Orbital Period (days)
- Transit Depth (ppm) 
- Transit Duration (hours)
- Signal-to-Noise Ratio
- Stellar Properties: Radius, Temperature, Magnitude
- Planet Name and Notes

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Tech Stack
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons
- FileSaver.js for file operations