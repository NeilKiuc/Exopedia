import type { AIModelConfig, AIAnalysisRequest, AIAnalysisResult, AIModelInfo } from '../types/ai';
import type { ExoplanetData } from '../types/exoplanet';

export class AIModelService {
  private config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  // Method 1: REST API Communication (most common)
  async analyzeViaAPI(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          data: this.formatDataForModel(request.exoplanetData),
          analysis_type: request.analysisType,
          parameters: request.parameters || {},
          model_name: this.config.modelName,
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      });

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.formatAPIResponse(result);
    } catch (error) {
      return {
        success: false,
        results: {},
        metadata: {
          modelVersion: 'unknown',
          analysisTimestamp: new Date(),
          processingTime: 0,
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Method 2: WebSocket Communication (for real-time analysis)
  async analyzeViaWebSocket(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.config.endpoint);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket timeout'));
      }, this.config.timeout || 30000);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'analyze',
          data: this.formatDataForModel(request.exoplanetData),
          analysis_type: request.analysisType,
          parameters: request.parameters || {},
        }));
      };

      ws.onmessage = (event) => {
        clearTimeout(timeout);
        try {
          const result = JSON.parse(event.data);
          resolve(this.formatAPIResponse(result));
        } catch (error) {
          reject(error);
        }
        ws.close();
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });
  }

  // Method 3: Local Model Communication (if using ONNX.js or TensorFlow.js)
  async analyzeLocally(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      // This would be implemented based on your specific local model
      // Example for ONNX.js or TensorFlow.js
      const inputTensor = this.prepareInputTensor(request.exoplanetData);
      
      // Placeholder for actual model inference
      console.log('Running local inference...', inputTensor);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        results: {
          insights: ['Local analysis completed'],
          recommendations: ['Consider using cloud-based analysis for better accuracy'],
        },
        metadata: {
          modelVersion: 'local-1.0.0',
          analysisTimestamp: new Date(),
          processingTime: 1000,
        },
      };
    } catch (error) {
      return {
        success: false,
        results: {},
        metadata: {
          modelVersion: 'local-1.0.0',
          analysisTimestamp: new Date(),
          processingTime: 0,
        },
        error: error instanceof Error ? error.message : 'Local analysis failed',
      };
    }
  }

  // Get model information
  async getModelInfo(): Promise<AIModelInfo> {
    try {
      const response = await fetch(`${this.config.endpoint}/info`, {
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch model info');
      }

      return await response.json();
    } catch (error) {
      return {
        name: this.config.modelName || 'Unknown Model',
        version: 'unknown',
        description: 'Model information unavailable',
        inputFeatures: [],
        outputTypes: [],
      };
    }
  }

  // Test connection to the AI model
  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        signal: AbortSignal.timeout(5000),
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          message: 'AI model is accessible',
          latency,
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  // Helper method to format exoplanet data for the model
  private formatDataForModel(data: ExoplanetData[]): object[] {
    return data.map(planet => ({
      name: planet.name,
      orbital_period: planet.orbitalPeriod,
      transit_depth: planet.transitDepth,
      transit_duration: planet.transitDuration,
      signal_to_noise_ratio: planet.signalToNoiseRatio,
      stellar_radius: planet.stellarProperties.radius,
      stellar_temperature: planet.stellarProperties.temperature,
      stellar_magnitude: planet.stellarProperties.magnitude,
      date_added: planet.dateAdded.toISOString(),
      notes: planet.notes || '',
    }));
  }

  // Helper method to format API response
  private formatAPIResponse(response: Record<string, unknown>): AIAnalysisResult {
    return {
      success: Boolean(response.success),
      results: {
        predictions: Array.isArray(response.predictions) ? response.predictions : [],
        insights: Array.isArray(response.insights) ? response.insights : [],
        recommendations: Array.isArray(response.recommendations) ? response.recommendations : [],
        anomalies: Array.isArray(response.anomalies) ? response.anomalies : [],
      },
      metadata: {
        modelVersion: typeof response.model_version === 'string' ? response.model_version : 'unknown',
        analysisTimestamp: new Date(typeof response.timestamp === 'string' || typeof response.timestamp === 'number' ? response.timestamp : Date.now()),
        processingTime: typeof response.processing_time === 'number' ? response.processing_time : 0,
      },
      error: typeof response.error === 'string' ? response.error : undefined,
    };
  }

  // Helper method to prepare input tensor (for local models)
  private prepareInputTensor(data: ExoplanetData[]): number[][] {
    return data.map(planet => [
      planet.orbitalPeriod,
      planet.transitDepth,
      planet.transitDuration,
      planet.signalToNoiseRatio,
      planet.stellarProperties.radius,
      planet.stellarProperties.temperature,
      planet.stellarProperties.magnitude,
    ]);
  }
}