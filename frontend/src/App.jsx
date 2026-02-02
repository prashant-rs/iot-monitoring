import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BedroomManagement from './components/BedroomManagement';
import SensorManagement from './components/SensorManagement';
import Dashboard from './components/Dashboard';
import SimulationControl from './components/SimulationControl';
import { Button } from './components/ui/button';
import { LayoutDashboard, Home, Settings, Activity } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedBedroom, setSelectedBedroom] = useState(null);

  const handleSelectBedroom = (bedroom) => {
    setSelectedBedroom(bedroom);
    setCurrentView('sensors');
  };

  const handleBackFromSensors = () => {
    setSelectedBedroom(null);
    setCurrentView('bedrooms');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">IoT Monitoring System</h1>
                  <p className="text-sm text-muted-foreground">Smart Apartment Sensor Management</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 py-2 overflow-x-auto">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('dashboard')}
                className="whitespace-nowrap"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentView === 'bedrooms' || currentView === 'sensors' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('bedrooms')}
                className="whitespace-nowrap"
              >
                <Home className="mr-2 h-4 w-4" />
                Bedrooms
              </Button>
              <Button
                variant={currentView === 'simulation' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('simulation')}
                className="whitespace-nowrap"
              >
                <Settings className="mr-2 h-4 w-4" />
                Simulation
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'bedrooms' && (
            <BedroomManagement onSelectBedroom={handleSelectBedroom} />
          )}
          {currentView === 'sensors' && selectedBedroom && (
            <SensorManagement
              bedroom={selectedBedroom}
              onBack={handleBackFromSensors}
            />
          )}
          {currentView === 'simulation' && <SimulationControl />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>IoT Monitoring System - Full Stack Developer Assignment</p>
              <p className="mt-1">Built with React 18 + Vite + TanStack Query + Tailwind CSS</p>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
