import React, { useState } from 'react';
import { Trash2, Eye, EyeOff, Search, SortAsc, SortDesc } from 'lucide-react';
import type { ExoplanetData } from '../types/exoplanet';

interface ExoplanetTableProps {
  data: ExoplanetData[];
  onDelete: (id: string) => void;
}

type SortField = keyof ExoplanetData | 'stellarRadius' | 'stellarTemperature' | 'stellarMagnitude';
type SortDirection = 'asc' | 'desc';

export const ExoplanetTable: React.FC<ExoplanetTableProps> = ({ data, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    orbitalPeriod: true,
    transitDepth: true,
    transitDuration: true,
    signalToNoiseRatio: true,
    stellarRadius: true,
    stellarTemperature: true,
    stellarMagnitude: true,
    dateAdded: true,
    notes: false
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortValue = (item: ExoplanetData, field: SortField): string | number | Date => {
    switch (field) {
      case 'stellarRadius':
        return item.stellarProperties.radius;
      case 'stellarTemperature':
        return item.stellarProperties.temperature;
      case 'stellarMagnitude':
        return item.stellarProperties.magnitude;
      case 'notes':
        return item.notes || '';
      default:
        return item[field as keyof ExoplanetData] as string | number | Date;
    }
  };

  const filteredAndSortedData = React.useMemo(() => {
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortField);
      const bValue = getSortValue(b, sortField);
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, searchTerm, sortField, sortDirection]);

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 text-lg">No exoplanets added yet</div>
        <div className="text-gray-400 text-sm mt-2">Add your first exoplanet using the form above</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Exoplanet Data ({filteredAndSortedData.length} entries)
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search exoplanets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(visibleColumns).map(([column, visible]) => (
                <button
                  key={column}
                  onClick={() => toggleColumn(column as keyof typeof visibleColumns)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                    visible
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {visible ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
                  {column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {visibleColumns.name && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name <SortIcon field="name" />
                  </div>
                </th>
              )}
              {visibleColumns.orbitalPeriod && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('orbitalPeriod')}
                >
                  <div className="flex items-center gap-1">
                    Period (days) <SortIcon field="orbitalPeriod" />
                  </div>
                </th>
              )}
              {visibleColumns.transitDepth && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('transitDepth')}
                >
                  <div className="flex items-center gap-1">
                    Depth (ppm) <SortIcon field="transitDepth" />
                  </div>
                </th>
              )}
              {visibleColumns.transitDuration && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('transitDuration')}
                >
                  <div className="flex items-center gap-1">
                    Duration (h) <SortIcon field="transitDuration" />
                  </div>
                </th>
              )}
              {visibleColumns.signalToNoiseRatio && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('signalToNoiseRatio')}
                >
                  <div className="flex items-center gap-1">
                    SNR <SortIcon field="signalToNoiseRatio" />
                  </div>
                </th>
              )}
              {visibleColumns.stellarRadius && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stellarRadius')}
                >
                  <div className="flex items-center gap-1">
                    R⭐ <SortIcon field="stellarRadius" />
                  </div>
                </th>
              )}
              {visibleColumns.stellarTemperature && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stellarTemperature')}
                >
                  <div className="flex items-center gap-1">
                    T⭐ (K) <SortIcon field="stellarTemperature" />
                  </div>
                </th>
              )}
              {visibleColumns.stellarMagnitude && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stellarMagnitude')}
                >
                  <div className="flex items-center gap-1">
                    Mag <SortIcon field="stellarMagnitude" />
                  </div>
                </th>
              )}
              {visibleColumns.dateAdded && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dateAdded')}
                >
                  <div className="flex items-center gap-1">
                    Added <SortIcon field="dateAdded" />
                  </div>
                </th>
              )}
              {visibleColumns.notes && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedData.map((exoplanet) => (
              <tr key={exoplanet.id} className="hover:bg-gray-50">
                {visibleColumns.name && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {exoplanet.name}
                  </td>
                )}
                {visibleColumns.orbitalPeriod && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exoplanet.orbitalPeriod.toFixed(3)}
                  </td>
                )}
                {visibleColumns.transitDepth && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exoplanet.transitDepth.toFixed(1)}
                  </td>
                )}
                {visibleColumns.transitDuration && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exoplanet.transitDuration.toFixed(2)}
                  </td>
                )}
                {visibleColumns.signalToNoiseRatio && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exoplanet.signalToNoiseRatio.toFixed(1)}
                  </td>
                )}
                {visibleColumns.stellarRadius && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exoplanet.stellarProperties.radius.toFixed(2)}
                  </td>
                )}
                {visibleColumns.stellarTemperature && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(exoplanet.stellarProperties.temperature)}
                  </td>
                )}
                {visibleColumns.stellarMagnitude && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exoplanet.stellarProperties.magnitude.toFixed(2)}
                  </td>
                )}
                {visibleColumns.dateAdded && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(exoplanet.dateAdded)}
                  </td>
                )}
                {visibleColumns.notes && (
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {exoplanet.notes || '-'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => onDelete(exoplanet.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete exoplanet"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};