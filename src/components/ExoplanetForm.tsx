import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import type { ExoplanetFormData, ExoplanetData } from '../types/exoplanet';
import { ExoplanetDataManager } from '../utils/dataManager';

interface ExoplanetFormProps {
  onAdd: (exoplanet: ExoplanetData) => void;
}

export const ExoplanetForm: React.FC<ExoplanetFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState<ExoplanetFormData>({
    name: '',
    orbitalPeriod: '',
    transitDepth: '',
    transitDuration: '',
    signalToNoiseRatio: '',
    stellarRadius: '',
    stellarTemperature: '',
    stellarMagnitude: '',
    notes: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const validationErrors = ExoplanetDataManager.validateFormData(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const newExoplanet = ExoplanetDataManager.formDataToExoplanet(formData);
      onAdd(newExoplanet);
      
      // Reset form
      setFormData({
        name: '',
        orbitalPeriod: '',
        transitDepth: '',
        transitDuration: '',
        signalToNoiseRatio: '',
        stellarRadius: '',
        stellarTemperature: '',
        stellarMagnitude: '',
        notes: ''
      });
      setErrors([]);
    } catch {
      setErrors(['Failed to add exoplanet. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold border-b border-gray-200 text-gray-800 mb-6 flex items-center gap-2">
        Add New Exoplanet
      </h2>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 mt-0.5" size={16} />
            <div>
              <h3 className="text-red-800 font-medium mb-1">Please fix the following errors:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Exoplanet Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Kepler-442b"
            />
          </div>

          <div>
            <label htmlFor="orbitalPeriod" className="block text-sm font-medium text-gray-700 mb-2">
              Orbital Period (days) *
            </label>
            <input
              type="number"
              id="orbitalPeriod"
              name="orbitalPeriod"
              value={formData.orbitalPeriod}
              onChange={handleChange}
              step="0.001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 112.3"
            />
          </div>

          <div>
            <label htmlFor="transitDepth" className="block text-sm font-medium text-gray-700 mb-2">
              Transit Depth (ppm) *
            </label>
            <input
              type="number"
              id="transitDepth"
              name="transitDepth"
              value={formData.transitDepth}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 850.2"
            />
          </div>

          <div>
            <label htmlFor="transitDuration" className="block text-sm font-medium text-gray-700 mb-2">
              Transit Duration (hours) *
            </label>
            <input
              type="number"
              id="transitDuration"
              name="transitDuration"
              value={formData.transitDuration}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 6.25"
            />
          </div>

          <div>
            <label htmlFor="signalToNoiseRatio" className="block text-sm font-medium text-gray-700 mb-2">
              Signal-to-Noise Ratio *
            </label>
            <input
              type="number"
              id="signalToNoiseRatio"
              name="signalToNoiseRatio"
              value={formData.signalToNoiseRatio}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 15.8"
            />
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stellar Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="stellarRadius" className="block text-sm font-medium text-gray-700 mb-2">
                Radius (Solar Radii) *
              </label>
              <input
                type="number"
                id="stellarRadius"
                name="stellarRadius"
                value={formData.stellarRadius}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1.2"
              />
            </div>

            <div>
              <label htmlFor="stellarTemperature" className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (K) *
              </label>
              <input
                type="number"
                id="stellarTemperature"
                name="stellarTemperature"
                value={formData.stellarTemperature}
                onChange={handleChange}
                step="1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 5770"
              />
            </div>

            <div>
              <label htmlFor="stellarMagnitude" className="block text-sm font-medium text-gray-700 mb-2">
                Magnitude *
              </label>
              <input
                type="number"
                id="stellarMagnitude"
                name="stellarMagnitude"
                value={formData.stellarMagnitude}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 13.2"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional observations or comments..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={16} />
            {isSubmitting ? 'Adding...' : 'Add Exoplanet'}
          </button>
        </div>
      </form>
    </div>
  );
};