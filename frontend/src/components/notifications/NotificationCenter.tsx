import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useSimulationStore } from '@/store/useSimulationStore';
import { formatRelativeTime, cn, getSeverityColor, getIncidentIcon } from '@/utils';
import type { Alert, Incident } from '@/types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  incidents: Incident[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  alerts,
  incidents,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'incidents'>('alerts');
  const dismissAlert = useSimulationStore(state => state.dismissAlert);

  const handleDismissAlert = (alertId: string) => {
    dismissAlert(alertId);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'Error':
        return ExclamationCircleIcon;
      case 'Warning':
        return ExclamationTriangleIcon;
      case 'Success':
        return CheckCircleIcon;
      case 'Info':
      default:
        return InformationCircleIcon;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'Error':
        return 'text-red-400 bg-red-400/10';
      case 'Warning':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'Success':
        return 'text-green-400 bg-green-400/10';
      case 'Info':
      default:
        return 'text-blue-400 bg-blue-400/10';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.acknowledged);
  const recentIncidents = incidents.slice(-10); // Show last 10 incidents

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Notification Panel */}
      <div className={cn(
        'fixed right-0 top-0 h-full w-96 bg-slate-800/95 backdrop-blur-md border-l border-slate-700/50 transform transition-transform duration-300 ease-in-out z-50',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('alerts')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'alerts'
                ? 'text-white bg-slate-700/30'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Alerts
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'incidents'
                ? 'text-white bg-slate-700/30'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Incidents
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'alerts' && (
            <div className="space-y-2 p-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-slate-400">No alerts</p>
                  <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  const colorClass = getAlertColor(alert.type);

                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'glass rounded-lg p-4 transition-all duration-200',
                        !alert.acknowledged && 'ring-1 ring-purple-500/30'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn('p-1.5 rounded-lg', colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-white font-medium text-sm">
                              {alert.title}
                            </h4>
                            <button
                              onClick={() => handleDismissAlert(alert.id)}
                              className="text-slate-400 hover:text-white transition-colors ml-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <p className="text-slate-300 text-sm mt-1 break-words">
                            {alert.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-slate-500 text-xs">
                              {formatRelativeTime(alert.timestamp)}
                            </span>
                            <span className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              getSeverityColor(alert.priority)
                            )}>
                              {alert.priority}
                            </span>
                          </div>
                          
                          {alert.actions && alert.actions.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {alert.actions.map((action, index) => (
                                <button
                                  key={index}
                                  className={cn(
                                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                                    action.style === 'danger'
                                      ? 'bg-red-600 hover:bg-red-700 text-white'
                                      : action.style === 'primary'
                                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                      : 'bg-slate-600 hover:bg-slate-700 text-white'
                                  )}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-2 p-4">
              {recentIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-slate-400">No incidents</p>
                  <p className="text-slate-500 text-sm mt-1">Everything is running smoothly!</p>
                </div>
              ) : (
                recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="glass rounded-lg p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getIncidentIcon(incident.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-white font-medium text-sm">
                            {incident.type} Incident
                          </h4>
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            getSeverityColor(incident.severity)
                          )}>
                            {incident.severity}
                          </span>
                        </div>
                        
                        <p className="text-slate-300 text-sm mt-1 break-words">
                          {incident.description}
                        </p>
                        
                        {incident.location.description && (
                          <p className="text-slate-400 text-xs mt-1">
                            📍 {incident.location.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-slate-500 text-xs">
                            {formatRelativeTime(incident.timestamp)}
                          </span>
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            incident.status === 'Resolved'
                              ? 'bg-green-500/20 text-green-400'
                              : incident.status === 'In Progress'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          )}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-4">
          <div className="text-center">
            <p className="text-slate-400 text-xs">
              {activeTab === 'alerts' 
                ? `${alerts.length} total alerts • ${unreadAlerts.length} unread`
                : `${incidents.length} total incidents • ${recentIncidents.length} recent`
              }
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;