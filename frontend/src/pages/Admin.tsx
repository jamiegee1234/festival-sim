import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  ServerIcon,
  BoltIcon,
  DocumentTextIcon,
  PlayIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useSimulationStore } from '@/store/useSimulationStore';
import { useAdminTools, useSimulationControls } from '@/hooks/useApi';
import { formatDateTime, cn } from '@/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Admin: React.FC = () => {
  const { festival, isRunning, connectedClients, metrics } = useSimulationStore();
  const { injectEvent, injecting, eventTypes, systemStatus } = useAdminTools();
  const { resetSimulation, loading } = useSimulationControls();
  
  const [selectedEventType, setSelectedEventType] = useState('weather');
  const [eventParameters, setEventParameters] = useState<Record<string, any>>({});
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const handleInjectEvent = async () => {
    try {
      await injectEvent({
        type: selectedEventType,
        parameters: eventParameters,
        timestamp: new Date().toISOString(),
        description: `Admin injected ${selectedEventType} event`,
      });
      
      // Add to debug logs
      setDebugLogs(prev => [
        ...prev,
        `[${formatDateTime(new Date().toISOString())}] Event injected: ${selectedEventType}`
      ].slice(-50)); // Keep last 50 logs
    } catch (error) {
      console.error('Failed to inject event:', error);
    }
  };

  const handleResetSimulation = async () => {
    if (window.confirm('Are you sure you want to reset the simulation? This will clear all data.')) {
      try {
        await resetSimulation();
        setDebugLogs(prev => [
          ...prev,
          `[${formatDateTime(new Date().toISOString())}] Simulation reset by admin`
        ]);
      } catch (error) {
        console.error('Failed to reset simulation:', error);
      }
    }
  };

  const systemStats = [
    {
      label: 'Festival Status',
      value: festival ? 'Initialized' : 'Not Set',
      color: festival ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Simulation State',
      value: isRunning ? 'Running' : 'Stopped',
      color: isRunning ? 'text-green-400' : 'text-yellow-400',
    },
    {
      label: 'Connected Clients',
      value: connectedClients.toString(),
      color: 'text-blue-400',
    },
    {
      label: 'Total Incidents',
      value: (metrics?.safety?.incidents || 0).toString(),
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900/50 to-purple-900/20">
      <div className="p-6 space-y-6">
        {/* Header with Warning */}
        <div className="glass-card border-yellow-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-yellow-300 mt-1">
                ⚠️ Advanced controls and debugging tools. Use with caution.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Status */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <ServerIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">System Status</h2>
            </div>

            <div className="space-y-4">
              {systemStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-slate-400">{stat.label}</span>
                  <span className={cn('font-medium', stat.color)}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="flex gap-2">
                <button
                  onClick={handleResetSimulation}
                  disabled={loading.reset}
                  className="flex-1 btn-danger text-sm py-2 disabled:opacity-50"
                >
                  {loading.reset ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    'Reset Simulation'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Event Injection */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <BoltIcon className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Event Injection</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Event Type
                </label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="weather">Weather Event</option>
                  <option value="technical">Technical Issue</option>
                  <option value="safety">Safety Incident</option>
                  <option value="crowd">Crowd Management</option>
                  <option value="artist">Artist Event</option>
                  <option value="vendor">Vendor Issue</option>
                </select>
              </div>

              {/* Dynamic parameters based on event type */}
              {selectedEventType === 'weather' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Condition
                    </label>
                    <select
                      value={eventParameters.condition || 'rain'}
                      onChange={(e) => setEventParameters(prev => ({...prev, condition: e.target.value}))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="rain">Rain</option>
                      <option value="storm">Storm</option>
                      <option value="heat">Heat Wave</option>
                      <option value="cold">Cold Snap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Severity (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={eventParameters.severity || 5}
                      onChange={(e) => setEventParameters(prev => ({...prev, severity: Number(e.target.value)}))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}

              {selectedEventType === 'technical' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      System
                    </label>
                    <select
                      value={eventParameters.system || 'sound'}
                      onChange={(e) => setEventParameters(prev => ({...prev, system: e.target.value}))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="sound">Sound System</option>
                      <option value="lighting">Lighting</option>
                      <option value="stage">Stage Equipment</option>
                      <option value="power">Power Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={eventParameters.location || 'Main Stage'}
                      onChange={(e) => setEventParameters(prev => ({...prev, location: e.target.value}))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      placeholder="Enter location"
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleInjectEvent}
                disabled={injecting}
                className="w-full btn-primary disabled:opacity-50"
              >
                {injecting ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Inject Event
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Debug Console */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Debug Console</h2>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
              {debugLogs.length === 0 ? (
                <p className="text-slate-500">No debug logs yet...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDebugLogs([])}
                className="btn-secondary text-xs py-1 px-3"
              >
                Clear Logs
              </button>
              <button
                onClick={() => {
                  const timestamp = formatDateTime(new Date().toISOString());
                  setDebugLogs(prev => [...prev, `[${timestamp}] Manual log entry`]);
                }}
                className="btn-primary text-xs py-1 px-3"
              >
                Add Log
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChartBarIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Performance Metrics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {metrics?.attendance?.current || 0}
              </div>
              <div className="text-slate-400 text-sm mt-1">Current Attendees</div>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                ${(metrics?.financial?.revenue || 0).toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm mt-1">Revenue</div>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                {metrics?.safety?.incidents || 0}
              </div>
              <div className="text-slate-400 text-sm mt-1">Incidents</div>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round((metrics?.satisfaction?.overall || 0) * 100)}%
              </div>
              <div className="text-slate-400 text-sm mt-1">Satisfaction</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">System Health</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Memory Usage:</span>
                  <span className="text-white">72%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CPU Usage:</span>
                  <span className="text-white">34%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-green-400">Healthy</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Simulation Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tick Rate:</span>
                  <span className="text-white">1000ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Scale:</span>
                  <span className="text-white">1x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime:</span>
                  <span className="text-white">2h 34m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Footer */}
        <div className="glass-card border-red-500/30 p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <p className="text-red-300 text-sm">
              <strong>Warning:</strong> Admin actions can affect the simulation state and user experience. 
              Always verify the impact before applying changes in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;