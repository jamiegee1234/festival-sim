import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  MapIcon, 
  ChartBarIcon, 
  CogIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useSimulationStore, useSimulationStatus } from '@/store/useSimulationStore';
import { useSimulationControls } from '@/hooks/useApi';
import { cn } from '@/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const festival = useSimulationStore(state => state.festival);
  const { status, isRunning } = useSimulationStatus();
  const { startSimulation, pauseSimulation, stopSimulation, loading } = useSimulationControls();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Real-time overview'
    },
    {
      name: 'Festival Map',
      href: '/map',
      icon: MapIcon,
      description: 'Interactive venue layout'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      description: 'Metrics & insights'
    },
    {
      name: 'Create Festival',
      href: '/create-festival',
      icon: PlusIcon,
      description: 'Design new event'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      description: 'Configure simulation'
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: ExclamationTriangleIcon,
      description: 'Debug & controls'
    },
  ];

  const handleSimulationControl = async (action: 'start' | 'pause' | 'stop') => {
    try {
      switch (action) {
        case 'start':
          await startSimulation();
          break;
        case 'pause':
          await pauseSimulation();
          break;
        case 'stop':
          await stopSimulation();
          break;
      }
    } catch (error) {
      console.error('Simulation control error:', error);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎪</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Festival Sim</h1>
                <p className="text-slate-400 text-xs">Real-time Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Festival Status */}
          {festival && (
            <div className="px-6 py-4 border-b border-slate-700/50">
              <div className="glass rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-sm truncate">
                    {festival.name}
                  </h3>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                  )} />
                </div>
                <p className="text-slate-400 text-xs mb-1">
                  {festival.genre} • {festival.theme}
                </p>
                <p className="text-slate-400 text-xs">
                  Status: {status}
                </p>
              </div>
            </div>
          )}

          {/* Simulation Controls */}
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h3 className="text-slate-300 font-medium text-sm mb-3">Simulation Controls</h3>
            <div className="flex gap-2">
              {!isRunning ? (
                <button
                  onClick={() => handleSimulationControl('start')}
                  disabled={loading.start || !festival}
                  className="flex-1 btn-success text-xs py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.start ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Start
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleSimulationControl('pause')}
                  disabled={loading.pause}
                  className="flex-1 btn-secondary text-xs py-2 px-3 disabled:opacity-50"
                >
                  {loading.pause ? (
                    <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin mx-auto" />
                  ) : (
                    <>
                      <PauseIcon className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => handleSimulationControl('stop')}
                disabled={loading.stop || !isRunning}
                className="flex-1 btn-danger text-xs py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.stop ? (
                  <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    <StopIcon className="w-4 h-4 mr-1" />
                    Stop
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
            <h3 className="text-slate-300 font-medium text-sm mb-3">Navigation</h3>
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  <Icon className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-slate-300'
                  )} />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className={cn(
                      'text-xs transition-colors',
                      isActive
                        ? 'text-purple-200'
                        : 'text-slate-500 group-hover:text-slate-400'
                    )}>
                      {item.description}
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Festival Simulator v1.0</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;