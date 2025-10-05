import type { ExoplanetData, ExoplanetFormData, ImportResult } from '../types/exoplanet';

export class ExoplanetDataManager {
  private static STORAGE_KEY = 'exoplanet-scout-data';

  static loadData(): ExoplanetData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        dateAdded: new Date(item.dateAdded)
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      return [];
    }
  }

  static saveData(data: ExoplanetData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  static addExoplanet(data: ExoplanetData[]): ExoplanetData {
    const newExoplanet: ExoplanetData = {
      ...data[0],
      id: crypto.randomUUID(),
      dateAdded: new Date()
    };
    return newExoplanet;
  }

  static validateFormData(formData: ExoplanetFormData): string[] {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Name is required');
    }

    const numericFields = [
      { field: 'orbitalPeriod', name: 'Orbital Period', min: 0 },
      { field: 'transitDepth', name: 'Transit Depth', min: 0 },
      { field: 'transitDuration', name: 'Transit Duration', min: 0 },
      { field: 'signalToNoiseRatio', name: 'Signal-to-Noise Ratio', min: 0 },
      { field: 'stellarRadius', name: 'Stellar Radius', min: 0 },
      { field: 'stellarTemperature', name: 'Stellar Temperature', min: 0 },
      { field: 'stellarMagnitude', name: 'Stellar Magnitude', min: undefined }
    ];

    numericFields.forEach(({ field, name, min }) => {
      const value = parseFloat((formData as any)[field]);
      if (isNaN(value)) {
        errors.push(`${name} must be a valid number`);
      } else if (min !== undefined && value < min) {
        errors.push(`${name} must be greater than ${min}`);
      }
    });

    return errors;
  }

  static formDataToExoplanet(formData: ExoplanetFormData): ExoplanetData {
    return {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      orbitalPeriod: parseFloat(formData.orbitalPeriod),
      transitDepth: parseFloat(formData.transitDepth),
      transitDuration: parseFloat(formData.transitDuration),
      signalToNoiseRatio: parseFloat(formData.signalToNoiseRatio),
      stellarProperties: {
        radius: parseFloat(formData.stellarRadius),
        temperature: parseFloat(formData.stellarTemperature),
        magnitude: parseFloat(formData.stellarMagnitude)
      },
      dateAdded: new Date(),
      notes: formData.notes?.trim() || undefined
    };
  }

  static exportToCSV(data: ExoplanetData[], includeResult: boolean = false): string {
    const headers = [
      'Name',
      'Orbital Period (days)',
      'Transit Depth (ppm)',
      'Transit Duration (hours)',
      'Signal-to-Noise Ratio',
      'Stellar Radius (Solar Radii)',
      'Stellar Temperature (K)',
      'Stellar Magnitude',
      'Date Added',
      'Notes'
    ];

    if (includeResult) {
      headers.push('Result');
    }

    const rows = data.map(item => {
      const baseRow = [
        item.name,
        item.orbitalPeriod.toString(),
        item.transitDepth.toString(),
        item.transitDuration.toString(),
        item.signalToNoiseRatio.toString(),
        item.stellarProperties.radius.toString(),
        item.stellarProperties.temperature.toString(),
        item.stellarProperties.magnitude.toString(),
        item.dateAdded.toISOString(),
        item.notes || ''
      ];

      if (includeResult) {
        baseRow.push(item.result || '');
      }

      return baseRow;
    });

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  static importFromCSV(csvContent: string): ImportResult {
    const lines = csvContent.trim().split('\n');
    const successful: ExoplanetData[] = [];
    const failed: ImportResult['failed'] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      try {
        const cells = this.parseCSVLine(lines[i]);
        
        if (cells.length < 8) {
          failed.push({
            row: i + 1,
            error: 'Insufficient columns',
            data: cells
          });
          continue;
        }

        const exoplanet: ExoplanetData = {
          id: crypto.randomUUID(),
          name: cells[0],
          orbitalPeriod: parseFloat(cells[1]),
          transitDepth: parseFloat(cells[2]),
          transitDuration: parseFloat(cells[3]),
          signalToNoiseRatio: parseFloat(cells[4]),
          stellarProperties: {
            radius: parseFloat(cells[5]),
            temperature: parseFloat(cells[6]),
            magnitude: parseFloat(cells[7])
          },
          dateAdded: cells[8] ? new Date(cells[8]) : new Date(),
          notes: cells[9] || undefined
        };

        // Validate required numeric fields
        const requiredNumbers = [
          exoplanet.orbitalPeriod,
          exoplanet.transitDepth,
          exoplanet.transitDuration,
          exoplanet.signalToNoiseRatio,
          exoplanet.stellarProperties.radius,
          exoplanet.stellarProperties.temperature,
          exoplanet.stellarProperties.magnitude
        ];

        if (requiredNumbers.some(isNaN) || !exoplanet.name.trim()) {
          failed.push({
            row: i + 1,
            error: 'Invalid data format',
            data: cells
          });
          continue;
        }

        successful.push(exoplanet);
      } catch (error) {
        failed.push({
          row: i + 1,
          error: `Parse error: ${error}`,
          data: lines[i]
        });
      }
    }

    return { successful, failed };
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }
}