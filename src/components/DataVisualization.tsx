import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp as ScatterIcon } from 'lucide-react';
import type { ExoplanetData } from '../types/exoplanet';

interface DataVisualizationProps {
  data: ExoplanetData[];
}

type ChartType = 'scatter' | 'histogram';
type ScatterAxis = 'orbitalPeriod' | 'transitDepth' | 'transitDuration' | 'signalToNoiseRatio' | 'stellarRadius' | 'stellarTemperature' | 'stellarMagnitude';

const axisLabels: Record<ScatterAxis, string> = {
  orbitalPeriod: 'Orbital Period (days)',
  transitDepth: 'Transit Depth (ppm)',
  transitDuration: 'Transit Duration (hours)',
  signalToNoiseRatio: 'Signal-to-Noise Ratio',
  stellarRadius: 'Stellar Radius (Solar Radii)',
  stellarTemperature: 'Stellar Temperature (K)',
  stellarMagnitude: 'Stellar Magnitude'
};

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartType>('scatter');
  const [xAxis, setXAxis] = useState<ScatterAxis>('orbitalPeriod');
  const [yAxis, setYAxis] = useState<ScatterAxis>('transitDepth');
  const [histogramField, setHistogramField] = useState<ScatterAxis>('orbitalPeriod');

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 text-lg">No data to visualize</div>
        <div className="text-gray-400 text-sm mt-2">Add some exoplanets to see charts</div>
      </div>
    );
  }

  const getFieldValue = (item: ExoplanetData, field: ScatterAxis): number => {
    switch (field) {
      case 'stellarRadius':
        return item.stellarProperties.radius;
      case 'stellarTemperature':
        return item.stellarProperties.temperature;
      case 'stellarMagnitude':
        return item.stellarProperties.magnitude;
      default:
        return item[field];
    }
  };

  const scatterData = data.map((item, index) => ({
    x: getFieldValue(item, xAxis),
    y: getFieldValue(item, yAxis),
    name: item.name,
    id: index
  }));

  const generateHistogramData = (field: ScatterAxis, bins: number = 10) => {
    const values = data.map(item => getFieldValue(item, field));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    
    const histogram = Array.from({ length: bins }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0,
      min: min + i * binSize,
      max: min + (i + 1) * binSize
    }));

    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex].count++;
    });

    return histogram;
  };

  const histogramData = generateHistogramData(histogramField);

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {axisLabels[xAxis]}: {data.x.toFixed(3)}
          </p>
          <p className="text-sm text-gray-600">
            {axisLabels[yAxis]}: {data.y.toFixed(3)}
          </p>
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HistogramTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">Range: {data.range}</p>
          <p className="text-sm text-gray-600">Count: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Visualization</h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('scatter')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                chartType === 'scatter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ScatterIcon size={16} />
              Scatter Plot
            </button>
            <button
              onClick={() => setChartType('histogram')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                chartType === 'histogram'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 size={16} />
              Histogram
            </button>
          </div>
        </div>
      </div>

      {chartType === 'scatter' && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis</label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value as ScatterAxis)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(axisLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis</label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value as ScatterAxis)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(axisLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name={axisLabels[xAxis]}
                  label={{ value: axisLabels[xAxis], position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name={axisLabels[yAxis]}
                  label={{ value: axisLabels[yAxis], angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter dataKey="y" fill="#3B82F6">
                  {scatterData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {chartType === 'histogram' && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Field to Analyze</label>
            <select
              value={histogramField}
              onChange={(e) => setHistogramField(e.target.value as ScatterAxis)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(axisLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  label={{ value: axisLabels[histogramField], position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<HistogramTooltip />} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">Chart Information:</h3>
        <ul className="space-y-1">
          <li>• Total data points: {data.length}</li>
          {chartType === 'scatter' && (
            <>
              <li>• X-axis range: {Math.min(...scatterData.map(d => d.x)).toFixed(3)} - {Math.max(...scatterData.map(d => d.x)).toFixed(3)}</li>
              <li>• Y-axis range: {Math.min(...scatterData.map(d => d.y)).toFixed(3)} - {Math.max(...scatterData.map(d => d.y)).toFixed(3)}</li>
            </>
          )}
          {chartType === 'histogram' && (
            <li>• Bins: {histogramData.length}</li>
          )}
        </ul>
      </div>
    </div>
  );
};