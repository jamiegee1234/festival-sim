import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useSimulationStore } from '@/store/useSimulationStore';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import FestivalMap from '@/pages/FestivalMap';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
import FestivalCreator from '@/pages/FestivalCreator';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const App: React.FC = () => {
  const { isConnected } = useWebSocket();
  const { isLoading, error } = useSimulationStore();

  useEffect(() => {
    // Remove loading spinner from initial HTML once React app loads
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      document.body.classList.add('loaded');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#f1f5f9',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
                duration: 6000,
              },
            }}
          />

          {/* Connection Status Indicator */}
          <div className="fixed top-4 right-4 z-50">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border ${
              isConnected 
                ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400 shadow-glow' : 'bg-red-400'
              }`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {/* Main Application Routes */}
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Default redirect to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Main application pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<FestivalMap />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/create-festival" element={<FestivalCreator />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>

          {/* Global loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="glass-card p-6 flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-slate-300">Loading simulation data...</p>
              </div>
            </div>
          )}

          {/* Global error overlay */}
          {error && !isLoading && (
            <div className="fixed bottom-4 left-4 right-4 z-40">
              <div className="glass-card border-red-500/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <p className="text-red-300 font-medium">{error}</p>
                </div>
                <button
                  onClick={() => useSimulationStore.getState().setError(null)}
                  className="text-slate-400 hover:text-slate-300 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;