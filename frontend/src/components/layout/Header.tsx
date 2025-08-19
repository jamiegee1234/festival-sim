import React from 'react';
import { 
  Bars3Icon, 
  BellIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useSimulationStore } from '@/store/useSimulationStore';
import { formatDateTime, formatCurrency, formatNumber, cn } from '@/utils';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleNotifications: () => void;
  unreadNotifications: number;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onToggleNotifications,
  unreadNotifications,
}) => {
  const {
    festival,
    metrics,
    currentTime,
    isRunning,
    connectedClients,
    isConnected
  } = useSimulationStore();

  // Quick stats for header display
  const quickStats = [
    {
      label: 'Attendees',
      value: metrics?.attendance?.current || 0,
      capacity: festival?.capacity || 0,
      icon: UsersIcon,
      color: 'text-blue-400',
    },
    {
      label: 'Revenue',
      value: formatCurrency(metrics?.financial?.revenue || 0, true),
      icon: CurrencyDollarIcon,
      color: 'text-green-400',
    },
    {
      label: 'Incidents',
      value: metrics?.safety?.incidents || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-400',
    },
  ];

  return (
    <header className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Current festival and time */}
          <div className="hidden md:flex items-center space-x-6">
            {festival && (
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                )} />
                <span className="text-white font-medium">
                  {festival.name}
                </span>
                <span className="text-slate-400 text-sm">
                  • {festival.genre}
                </span>
              </div>
            )}

            {currentTime && (
              <div className="flex items-center space-x-2 text-slate-300">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-mono">
                  {formatDateTime(currentTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center section - Quick stats */}
        <div className="hidden lg:flex items-center space-x-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center space-x-2">
                <Icon className={cn('h-5 w-5', stat.color)} />
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">
                    {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value, true)}
                    {stat.capacity && (
                      <span className="text-slate-400 ml-1">
                        / {formatNumber(stat.capacity, true)}
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400 text-xs">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className={cn(
              'w-2 h-2 rounded-full transition-colors',
              isConnected ? 'bg-green-400' : 'bg-red-400'
            )} />
            <span className="text-xs text-slate-400">
              {connectedClients} client{connectedClients !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Notifications button */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <BellIcon className="h-6 w-6" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* User menu placeholder */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="hidden md:block">
              <span className="text-white text-sm font-medium">Admin</span>
              <p className="text-slate-400 text-xs">Festival Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile quick stats */}
      <div className="lg:hidden mt-3 flex justify-between">
        {quickStats.slice(0, 3).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center space-x-2 flex-1">
              <Icon className={cn('h-4 w-4', stat.color)} />
              <div>
                <span className="text-white font-medium text-sm">
                  {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value, true)}
                </span>
                <p className="text-slate-400 text-xs">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
};

export default Header;