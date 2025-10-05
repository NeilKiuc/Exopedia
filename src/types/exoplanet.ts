export interface StellarProperties {
  radius: number; // Solar radii
  temperature: number; // Kelvin
  magnitude: number; // Apparent magnitude
}

export interface ExoplanetData {
  id: string;
  name: string;
  orbitalPeriod: number; // days
  transitDepth: number; // parts per million (ppm)
  transitDuration: number; // hours
  signalToNoiseRatio: number;
  stellarProperties: StellarProperties;
  dateAdded: Date;
  notes?: string;
  result?: string; // Optional result field for classification or analysis
}

export interface ExoplanetFormData {
  name: string;
  orbitalPeriod: string;
  transitDepth: string;
  transitDuration: string;
  signalToNoiseRatio: string;
  stellarRadius: string;
  stellarTemperature: string;
  stellarMagnitude: string;
  notes?: string;
}

export interface ImportResult {
  successful: ExoplanetData[];
  failed: Array<{
    row: number;
    error: string;
    data: Record<string, unknown>;
  }>;
}