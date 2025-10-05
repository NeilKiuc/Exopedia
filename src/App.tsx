import { useState, useEffect } from 'react';
import { Telescope, Database, FileText, Brain } from 'lucide-react';
import type { ExoplanetData } from './types/exoplanet';
import { ExoplanetDataManager } from './utils/dataManager';
import { ExoplanetForm } from './components/ExoplanetForm';
import { ExoplanetTable } from './components/ExoplanetTable';
import { DataImportExport } from './components/DataImportExport';
import { AIAnalysis } from './components/AIAnalysis';

type ActiveTab = 'add' | 'view' | 'import' | 'ai';

function App() {
  const [exoplanets, setExoplanets] = useState<ExoplanetData[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('add');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data on component mount
    const loadedData = ExoplanetDataManager.loadData();
    setExoplanets(loadedData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save data whenever exoplanets state changes
    if (!isLoading) {
      ExoplanetDataManager.saveData(exoplanets);
    }
  }, [exoplanets, isLoading]);

  const handleAddExoplanet = (newExoplanet: ExoplanetData) => {
    setExoplanets(prev => [...prev, newExoplanet]);
  };

  const handleDeleteExoplanet = (id: string) => {
    if (confirm('Are you sure you want to delete this exoplanet?')) {
      setExoplanets(prev => prev.filter(exoplanet => exoplanet.id !== id));
    }
  };

  const handleImportExoplanets = (importedExoplanets: ExoplanetData[]) => {
    setExoplanets(prev => [...prev, ...importedExoplanets]);
  };

  const tabs = [
    { id: 'add' as const, label: 'Add Data', icon: FileText },
    { id: 'import' as const, label: 'Import/Export', icon: Database },
    { id: 'view' as const, label: 'View Data', icon: Database },    
    { id: 'ai' as const, label: 'AI Analysis', icon: Brain }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Telescope className="mx-auto mb-4 text-blue-600" size={48} />
          <div className="text-xl font-semibold text-gray-800">Loading Exoplanet Scout...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Telescope className="text-blue-600" size={52} />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Exopedia</h1>
                <p className="text-sm text-gray-600">Transit Method Data Collection</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {exoplanets.length} exoplanet{exoplanets.length !== 1 ? 's' : ''} tracked
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'add' && (
          <ExoplanetForm onAdd={handleAddExoplanet} />
        )}
        
        {activeTab === 'view' && (
          <ExoplanetTable 
            data={exoplanets} 
            onDelete={handleDeleteExoplanet} 
          />
        )}
        
        {activeTab === 'import' && (
          <DataImportExport 
            data={exoplanets} 
            onImport={handleImportExoplanets} 
          />
        )}

        {activeTab === 'ai' && (
          <AIAnalysis data={exoplanets} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-600">
            <p>Exoplanet Scout - Transit Method Data Collection Tool</p>
            <p className="mt-1">Built for astronomers and citizen scientists</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
