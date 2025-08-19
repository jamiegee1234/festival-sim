import React, { useState } from 'react';
import { 
  CogIcon, 
  BellIcon, 
  EyeIcon, 
  ClockIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useSimulationStore, useDashboardView } from '@/store/useSimulationStore';
import { cn } from '@/utils';

const Settings: React.FC = () => {
  const dashboardView = useDashboardView();
  const updateDashboardView = useSimulationStore(state => state.updateDashboardView);
  const notificationSound = useSimulationStore(state => state.notificationSound);
  
  const [settings, setSettings] = useState({
    notifications: {
      incidents: true,
      financial: true,
      weather: true,
      system: false,
      sound: notificationSound,
    },
    display: {
      theme: 'dark' as 'dark' | 'light',
      layout: dashboardView.layout,
      refreshRate: dashboardView.refreshRate / 1000, // Convert to seconds
      showMetrics: dashboardView.selectedMetrics,
    },
    simulation: {
      autoStart: false,
      timeScale: 1,
      complexity: 0.8,
      realism: 0.9,
    },
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));

    // Update store for relevant settings
    if (category === 'display') {
      if (key === 'layout' || key === 'refreshRate') {
        updateDashboardView({
          layout: key === 'layout' ? value : dashboardView.layout,
          refreshRate: key === 'refreshRate' ? value * 1000 : dashboardView.refreshRate,
        });
      }
    }
  };

  const metricOptions = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'financial', label: 'Financial' },
    { key: 'safety', label: 'Safety' },
    { key: 'operational', label: 'Operational' },
    { key: 'weather', label: 'Weather' },
    { key: 'performance', label: 'Performance' },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900/50 to-purple-900/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <CogIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 mt-1">
              Configure your festival simulation preferences and display options
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <BellIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Incident Alerts</h3>
                  <p className="text-slate-400 text-sm">Get notified about safety incidents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.incidents}
                    onChange={(e) => handleSettingChange('notifications', 'incidents', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Financial Updates</h3>
                  <p className="text-slate-400 text-sm">Revenue and budget notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.financial}
                    onChange={(e) => handleSettingChange('notifications', 'financial', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Weather Alerts</h3>
                  <p className="text-slate-400 text-sm">Weather condition changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.weather}
                    onChange={(e) => handleSettingChange('notifications', 'weather', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Sound Notifications</h3>
                  <p className="text-slate-400 text-sm">Play sounds for alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sound}
                    onChange={(e) => handleSettingChange('notifications', 'sound', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <ComputerDesktopIcon className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Display</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Dashboard Layout</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSettingChange('display', 'layout', 'grid')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      settings.display.layout === 'grid'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    )}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => handleSettingChange('display', 'layout', 'list')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      settings.display.layout === 'list'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    )}
                  >
                    List
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Refresh Rate</h3>
                <select
                  value={settings.display.refreshRate}
                  onChange={(e) => handleSettingChange('display', 'refreshRate', Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value={1}>1 second</option>
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Visible Metrics</h3>
                <div className="space-y-2">
                  {metricOptions.map((metric) => (
                    <label key={metric.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dashboardView.selectedMetrics.includes(metric.key)}
                        onChange={(e) => {
                          const newMetrics = e.target.checked
                            ? [...dashboardView.selectedMetrics, metric.key]
                            : dashboardView.selectedMetrics.filter(m => m !== metric.key);
                          updateDashboardView({ selectedMetrics: newMetrics });
                        }}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-slate-300">{metric.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <ClockIcon className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Simulation</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Time Scale</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={settings.simulation.timeScale}
                    onChange={(e) => handleSettingChange('simulation', 'timeScale', Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white font-medium min-w-[3rem]">
                    {settings.simulation.timeScale}x
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">AI Complexity</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={settings.simulation.complexity}
                    onChange={(e) => handleSettingChange('simulation', 'complexity', Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white font-medium min-w-[3rem]">
                    {Math.round(settings.simulation.complexity * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Realism Level</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={settings.simulation.realism}
                    onChange={(e) => handleSettingChange('simulation', 'realism', Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white font-medium min-w-[3rem]">
                    {Math.round(settings.simulation.realism * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Auto-start Simulation</h3>
                  <p className="text-slate-400 text-sm">Start simulation automatically when festival is created</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.simulation.autoStart}
                    onChange={(e) => handleSettingChange('simulation', 'autoStart', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <EyeIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Advanced</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Debug Mode</h3>
                  <p className="text-slate-400 text-sm">Show additional debugging information</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Performance Monitoring</h3>
                  <p className="text-slate-400 text-sm">Track simulation performance metrics</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="pt-4">
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;