import type { ExoplanetData } from './exoplanet';

export interface AIModelConfig {
  endpoint: string;
  apiKey?: string;
  modelName?: string;
  timeout?: number;
}

export interface AIAnalysisRequest {
  exoplanetData: ExoplanetData[];
  analysisType: 'classification' | 'prediction' | 'anomaly_detection' | 'habitability' | 'custom';
  parameters?: {
    confidence_threshold?: number;
    include_uncertainties?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface AIAnalysisResult {
  success: boolean;
  results: {
    predictions?: PredictionItem[];
    insights?: string[];
    recommendations?: string[];
    anomalies?: Array<{
      planetId: string;
      anomalyType: string;
      severity: number;
      description: string;
    }>;
  };
  metadata: {
    modelVersion: string;
    analysisTimestamp: Date;
    processingTime: number;
  };
  error?: string;
}

// Flexible prediction item that supports both backend shapes
// - Our FastAPI /api/analyze returns: { name?: string, label: 'exo'|'candidate'|'not exo' }
// - Other providers could return: { planetId, prediction, confidence, explanation? }
export interface PredictionItem {
  name?: string;
  label?: string | number;
  planetId?: string;
  prediction?: string | number | object;
  confidence?: number;
  explanation?: string;
}

export interface AIModelInfo {
  name: string;
  version: string;
  description: string;
  inputFeatures: string[];
  outputTypes: string[];
  lastTrained?: Date;
  accuracy?: number;
}