import React, { useEffect } from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useSimulationStore } from '@/store/useSimulationStore';
import { useMetricsRefresh } from '@/hooks/useApi';
import { formatNumber, formatCurrency, formatPercentage, formatRelativeTime, cn } from '@/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const {
    festival,
    metrics,
    incidents,
    status,
    isRunning,
    currentTime,
    lastUpdated,
    isLoading
  } = useSimulationStore();

  // Auto-refresh metrics every 5 seconds
  useMetricsRefresh(5000, true);

  // Main metrics cards data
  const mainMetrics = [
    {
      title: 'Attendees',
      value: formatNumber(metrics?.attendance?.current || 0),
      subtitle: `of ${formatNumber(festival?.capacity || 0)} capacity`,
      percentage: festival?.capacity 
        ? formatPercentage((metrics?.attendance?.current || 0) / festival.capacity)
        : '0%',
      icon: UsersIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Revenue',
      value: formatCurrency(metrics?.financial?.revenue || 0),
      subtitle: `Profit: ${formatCurrency(metrics?.financial?.profit || 0)}`,
      percentage: metrics?.financial?.revenue 
        ? formatPercentage(
            (metrics.financial.profit || 0) / (metrics.financial.revenue || 1)
          )
        : '0%',
      icon: CurrencyDollarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      trend: '+12.8%',
      trendUp: true
    },
    {
      title: 'Safety Score',
      value: `${metrics?.safety?.overallSafetyScore || 100}%`,
      subtitle: `${metrics?.safety?.incidents || 0} incidents`,
      percentage: metrics?.safety ? 
        `${100 - (metrics.safety.incidents || 0)}%` : '100%',
      icon: ExclamationTriangleIcon,
      color: (metrics?.safety?.overallSafetyScore || 100) >= 90 ? 'text-green-400' : 
             (metrics?.safety?.overallSafetyScore || 100) >= 70 ? 'text-yellow-400' : 'text-red-400',
      bgColor: (metrics?.safety?.overallSafetyScore || 100) >= 90 ? 'bg-green-500/10' : 
               (metrics?.safety?.overallSafetyScore || 100) >= 70 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      borderColor: (metrics?.safety?.overallSafetyScore || 100) >= 90 ? 'border-green-500/20' : 
                   (metrics?.safety?.overallSafetyScore || 100) >= 70 ? 'border-yellow-500/20' : 'border-red-500/20',
      trend: '-2.1%',
      trendUp: false
    },
    {
      title: 'Satisfaction',
      value: formatPercentage(metrics?.satisfaction?.overall || 0.85),
      subtitle: `${formatNumber(metrics?.satisfaction?.feedback?.length || 0)} reviews`,
      percentage: formatPercentage(metrics?.satisfaction?.overall || 0.85),
      icon: ChartBarIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      trend: '+8.3%',
      trendUp: true
    }
  ];

  const recentIncidents = incidents.slice(-5); // Show last 5 incidents
  
  if (isLoading && !festival) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-400 mt-4">Loading festival dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900/50 to-purple-900/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Festival Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Real-time insights and monitoring for {festival?.name || 'your festival'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg glass border',
              isRunning 
                ? 'border-green-500/30 bg-green-500/10' 
                : 'border-yellow-500/30 bg-yellow-500/10'
            )}>
              <div className={cn(
                'w-2 h-2 rounded-full',
                isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
              )} />
              <span className="text-white font-medium">
                {status} {isRunning && '(Running)'}
              </span>
            </div>
            
            {/* Last updated */}
            {lastUpdated && (
              <div className="text-slate-400 text-sm flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                Updated {formatRelativeTime(lastUpdated)}
              </div>
            )}
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={cn(
                  'glass rounded-xl p-6 border hover:bg-white/5 transition-all duration-300 hover:scale-105',
                  metric.borderColor
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    'p-3 rounded-lg',
                    metric.bgColor
                  )}>
                    <Icon className={cn('h-6 w-6', metric.color)} />
                  </div>
                  <div className={cn(
                    'text-sm font-medium px-2 py-1 rounded',
                    metric.trendUp 
                      ? 'text-green-400 bg-green-400/10' 
                      : 'text-red-400 bg-red-400/10'
                  )}>
                    {metric.trend}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-slate-400 text-sm font-medium">
                    {metric.title}
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {metric.value}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {metric.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Activity Feed */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Recent Incidents
              </h2>
              <span className="text-slate-400 text-sm">
                Last 5 events
              </span>
            </div>
            
            <div className="space-y-4">
              {recentIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChartBarIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-slate-400">No recent incidents</p>
                  <p className="text-slate-500 text-sm mt-1">Everything is running smoothly!</p>
                </div>
              ) : (
                recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-start space-x-3 p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="text-lg">
                      {incident.type === 'Medical' ? '🏥' :
                       incident.type === 'Security' ? '🚔' :
                       incident.type === 'Technical' ? '⚡' :
                       incident.type === 'Weather' ? '🌧️' :
                       incident.type === 'Crowd' ? '👥' : '📋'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium text-sm">
                          {incident.type} Incident
                        </h4>
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          incident.severity === 'Critical' ? 'text-red-400 bg-red-400/10' :
                          incident.severity === 'High' ? 'text-orange-400 bg-orange-400/10' :
                          incident.severity === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' :
                          'text-green-400 bg-green-400/10'
                        )}>
                          {incident.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mt-1">
                        {incident.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-slate-500 text-xs">
                          {formatRelativeTime(incident.timestamp)}
                        </span>
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          incident.status === 'Resolved' ? 'text-green-400 bg-green-400/10' :
                          incident.status === 'In Progress' ? 'text-yellow-400 bg-yellow-400/10' :
                          'text-red-400 bg-red-400/10'
                        )}>
                          {incident.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Festival Overview */}
          <div className="space-y-6">
            {/* Festival Info */}
            {festival && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Festival Info
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">
                      Name
                    </h3>
                    <p className="text-white">{festival.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-slate-400 text-sm font-medium mb-1">
                        Genre
                      </h4>
                      <p className="text-white text-sm">{festival.genre}</p>
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-sm font-medium mb-1">
                        Theme
                      </h4>
                      <p className="text-white text-sm">{festival.theme}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-slate-400 text-sm font-medium mb-1">
                      Venue
                    </h4>
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      <p className="text-white text-sm">{festival.venue?.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-slate-400 text-sm font-medium mb-1">
                      Capacity
                    </h4>
                    <p className="text-white text-sm">
                      {formatNumber(festival.capacity)} attendees
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Weather Info */}
            {festival?.weather && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Current Weather
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Temperature</span>
                    <span className="text-white font-medium">
                      {festival.weather.current?.temperature || 0}°C
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Condition</span>
                    <span className="text-white font-medium">
                      {festival.weather.current?.condition || 'Clear'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Humidity</span>
                    <span className="text-white font-medium">
                      {festival.weather.current?.humidity || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Wind</span>
                    <span className="text-white font-medium">
                      {festival.weather.current?.windSpeed || 0} km/h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;