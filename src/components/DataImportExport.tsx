import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import type { ExoplanetData, ImportResult } from '../types/exoplanet';
import { ExoplanetDataManager } from '../utils/dataManager';

interface DataImportExportProps {
  data: ExoplanetData[];
  onImport: (exoplanets: ExoplanetData[]) => void;
}

export const DataImportExport: React.FC<DataImportExportProps> = ({ data, onImport }) => {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [includeResult, setIncludeResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const csvContent = ExoplanetDataManager.exportToCSV(data, includeResult);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const timestamp = new Date().toISOString().split('T')[0];
      saveAs(blob, `exoplanet-data-${timestamp}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const result = ExoplanetDataManager.importFromCSV(csvContent);
        setImportResult(result);
        
        if (result.successful.length > 0) {
          onImport(result.successful);
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Please check the file format.');
        setImportResult(null);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      alert('Failed to read file');
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      'Name,Orbital Period (days),Transit Depth (ppm),Transit Duration (hours),Signal-to-Noise Ratio,Stellar Radius (Solar Radii),Stellar Temperature (K),Stellar Magnitude,Date Added,Notes',
      'Kepler-442b,112.3,850.2,6.25,15.8,1.2,5770,13.2,2024-01-01T00:00:00.000Z,Example exoplanet data',
      'HD 40307 g,197.8,1200.5,8.12,12.4,0.77,4977,7.17,2024-01-02T00:00:00.000Z,Another example'
    ].join('\n');

    const blob = new Blob([templateData], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'exoplanet-import-template.csv');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Data Import & Export</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Download size={20} />
            Export Data
          </h3>
          <p className="text-gray-600 text-sm">
            Export all exoplanet data as a CSV file for backup or sharing.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeResult"
              checked={includeResult}
              onChange={(e) => setIncludeResult(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <label htmlFor="includeResult" className="text-gray-700 text-sm">
              Include result column in export
            </label>
          </div>
          <button
            onClick={handleExport}
            disabled={data.length === 0}
            className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Export CSV ({data.length} entries)
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Upload size={20} />
            Import Data
          </h3>
          <p className="text-gray-600 text-sm">
            Import exoplanet data from a CSV file. Data will be added to existing entries.
          </p>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isImporting}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              {isImporting ? 'Importing...' : 'Select CSV File'}
            </button>
            <button
              onClick={downloadTemplate}
              className="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Import Results</h3>
          
          {importResult.successful.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5" size={16} />
                <div>
                  <h4 className="text-green-800 font-medium">
                    Successfully imported {importResult.successful.length} exoplanet(s)
                  </h4>
                  <ul className="text-green-700 text-sm mt-1 space-y-1">
                    {importResult.successful.map((exoplanet) => (
                      <li key={exoplanet.id}>• {exoplanet.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {importResult.failed.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-red-500 mt-0.5" size={16} />
                <div>
                  <h4 className="text-red-800 font-medium">
                    Failed to import {importResult.failed.length} row(s)
                  </h4>
                  <div className="text-red-700 text-sm mt-1 max-h-32 overflow-y-auto">
                    {importResult.failed.map((failure, index) => (
                      <div key={index} className="mb-1">
                        <strong>Row {failure.row}:</strong> {failure.error}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setImportResult(null)}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Dismiss results
          </button>
        </div>
      )}

      {/* CSV Format Information */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-blue-800 font-medium mb-2">CSV Format Requirements</h4>
        <div className="text-blue-700 text-sm space-y-1">
          <p>• First row should contain headers (will be ignored during import)</p>
          <p>• Required columns: Name, Orbital Period, Transit Depth, Transit Duration, SNR, Stellar Radius, Stellar Temperature, Stellar Magnitude</p>
          <p>• Optional columns: Date Added (ISO format), Notes</p>
          <p>• Numeric values should use decimal notation (e.g., 1.23, not 1,23)</p>
          <p>• Download the template to see the correct format</p>
        </div>
      </div>
    </div>
  );
};