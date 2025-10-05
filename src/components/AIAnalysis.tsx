import { useState, useEffect } from 'react';
import { Brain, Settings, Play, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';
import type { ExoplanetData } from '../types/exoplanet';
import type { AIModelConfig, AIAnalysisRequest, AIAnalysisResult, PredictionItem } from '../types/ai';
import { AIModelService } from '../services/aiModelService';

interface AIAnalysisProps {
  data: ExoplanetData[];
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ data }) => {
  const [config, setConfig] = useState<AIModelConfig>({
    endpoint:
      typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000/api/analyze'
        : '/api/analyze',
    apiKey: '',
    modelName: '',
    timeout: 30000,
  });
  
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AIAnalysisRequest['analysisType']>('classification');

  const aiService = new AIModelService(config);

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('ai-model-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setIsConfigured(true);
      } catch (error) {
        console.error('Failed to load AI config:', error);
      }
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('ai-model-config', JSON.stringify(config));
    setIsConfigured(true);
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const result = await aiService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'failed');
    } catch {
      setConnectionStatus('failed');
    }
  };

  const runAnalysis = async () => {
    if (data.length === 0) {
      alert('No data available for analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      const request: AIAnalysisRequest = {
        exoplanetData: data,
        analysisType: selectedAnalysisType,
        parameters: {
          confidence_threshold: 0.8,
          include_uncertainties: true,
        },
      };

      const result = await aiService.analyzeViaAPI(request);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        success: false,
        results: {},
        metadata: {
          modelVersion: 'unknown',
          analysisTimestamp: new Date(),
          processingTime: 0,
        },
        error: error instanceof Error ? error.message : 'Analysis failed',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Brain className="mx-auto mb-4 text-gray-400" size={48} />
        <div className="text-gray-500 text-lg">No data available for AI analysis</div>
        <div className="text-gray-400 text-sm mt-2">Add some exoplanets to enable AI features</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Brain size={24} />
        AI Analysis
      </h2>

      {!isConfigured ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-blue-800 font-medium mb-2">Configure Your AI Model</h3>
            <p className="text-blue-700 text-sm">
              Connect to your trained AI model by providing the endpoint and credentials below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Endpoint *
              </label>
              <input
                type="url"
                value={config.endpoint}
                onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="http://localhost:8000/api/analyze"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">URL where your AI model is hosted</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key (optional)
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter API key if required"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name (optional)
              </label>
              <input
                type="text"
                value={config.modelName}
                onChange={(e) => setConfig(prev => ({ ...prev, modelName: e.target.value }))}
                placeholder="e.g., exoplanet-classifier-v1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (ms)
              </label>
              <input
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
                min="5000"
                max="300000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={saveConfig}
              disabled={!config.endpoint}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Settings size={16} />
              Save Configuration
            </button>

            <button
              onClick={testConnection}
              disabled={!config.endpoint || connectionStatus === 'testing'}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {connectionStatus === 'testing' ? (
                <Loader size={16} className="animate-spin" />
              ) : connectionStatus === 'connected' ? (
                <CheckCircle size={16} />
              ) : connectionStatus === 'failed' ? (
                <XCircle size={16} />
              ) : (
                <Play size={16} />
              )}
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {connectionStatus === 'connected' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-green-800 font-medium">Connection successful!</span>
              </div>
            </div>
          )}

          {connectionStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="text-red-500" size={16} />
                <span className="text-red-800 font-medium">Connection failed. Please check your configuration.</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Connected to: <span className="font-medium">{config.endpoint}</span>
            </div>
            <button
              onClick={() => setIsConfigured(false)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Reconfigure
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Type
            </label>
            <select
              value={selectedAnalysisType}
              onChange={(e) => setSelectedAnalysisType(e.target.value as AIAnalysisRequest['analysisType'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="classification">Classification</option>
              <option value="prediction">Prediction</option>
              <option value="anomaly_detection">Anomaly Detection</option>
              <option value="habitability">Habitability Assessment</option>
              <option value="custom">Custom Analysis</option>
            </select>
          </div>

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="w-full px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing {data.length} exoplanets...
              </>
            ) : (
              <>
                <Play size={20} />
                Run AI Analysis ({data.length} exoplanets)
              </>
            )}
          </button>

          {analysisResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
              
              {analysisResult.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-green-800 font-medium">Analysis completed successfully</span>
                  </div>
                  
                  {analysisResult.results.insights && analysisResult.results.insights.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Insights:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {analysisResult.results.insights.map((insight, index) => (
                          <li key={index}>• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.results.recommendations && analysisResult.results.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Recommendations:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {analysisResult.results.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.results.predictions && (analysisResult.results.predictions as PredictionItem[]).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Predictions:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-600">
                              <th className="py-1 pr-4">Name</th>
                              <th className="py-1">Label</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(analysisResult.results.predictions as PredictionItem[]).map((p: PredictionItem, idx: number) => (
                              <tr key={idx} className="border-t border-gray-200">
                                <td className="py-1 pr-4">{p?.name ?? `Planet ${idx + 1}`}</td>
                                <td className="py-1 font-semibold">{String(p?.label ?? p?.prediction ?? '')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {analysisResult.results.anomalies && analysisResult.results.anomalies.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Anomalies Detected:</h4>
                      <div className="space-y-2">
                        {analysisResult.results.anomalies.map((anomaly, index) => (
                          <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="text-yellow-600" size={14} />
                              <span className="font-medium text-yellow-800">{anomaly.anomalyType}</span>
                              <span className="text-sm text-yellow-700">Severity: {anomaly.severity}</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">{anomaly.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-600">
                    <p>Model: {analysisResult.metadata.modelVersion}</p>
                    <p>Processing time: {analysisResult.metadata.processingTime}ms</p>
                    <p>Analyzed at: {analysisResult.metadata.analysisTimestamp.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="text-red-500" size={16} />
                    <span className="text-red-800 font-medium">Analysis failed</span>
                  </div>
                  {analysisResult.error && (
                    <p className="text-red-700 text-sm mt-2">{analysisResult.error}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Integration Help */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Integration Options</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>REST API:</strong> Host your model with FastAPI, Flask, or similar framework</p>
          <p><strong>Local Models:</strong> Use ONNX.js or TensorFlow.js for client-side inference</p>
        </div>
      </div>
    </div>
  );
};