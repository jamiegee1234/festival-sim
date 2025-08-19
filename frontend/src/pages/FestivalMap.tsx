import React, { useState } from 'react';
import { 
  MapPinIcon,
  UsersIcon,
  ShoppingBagIcon,
  MicrophoneIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useSimulationStore } from '@/store/useSimulationStore';
import { cn } from '@/utils';

const FestivalMap: React.FC = () => {
  const { festival, incidents } = useSimulationStore();
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'stages' | 'vendors' | 'incidents' | 'crowds'>('all');

  // Mock map data - in a real implementation, this would come from the festival data
  const mapElements = {
    stages: [
      { id: 1, name: 'Main Stage', x: 300, y: 150, type: 'main', active: true },
      { id: 2, name: 'Electronic Stage', x: 500, y: 250, type: 'electronic', active: true },
      { id: 3, name: 'Acoustic Stage', x: 200, y: 350, type: 'acoustic', active: false },
    ],
    vendors: [
      { id: 1, name: 'Food Truck A', x: 150, y: 100, type: 'food', busy: true },
      { id: 2, name: 'Merch Stand', x: 450, y: 100, type: 'merchandise', busy: false },
      { id: 3, name: 'Bar 1', x: 350, y: 300, type: 'beverage', busy: true },
      { id: 4, name: 'Food Court', x: 250, y: 450, type: 'food', busy: false },
    ],
    crowds: [
      { id: 1, x: 280, y: 140, density: 'high', size: 150 },
      { id: 2, x: 480, y: 240, density: 'medium', size: 80 },
      { id: 3, x: 220, y: 380, density: 'low', size: 30 },
    ],
    facilities: [
      { id: 1, name: 'Restroom 1', x: 100, y: 200, type: 'restroom' },
      { id: 2, name: 'Medical Tent', x: 400, y: 400, type: 'medical' },
      { id: 3, name: 'Security Post', x: 550, y: 150, type: 'security' },
    ]
  };

  const layerOptions = [
    { key: 'all', label: 'All', icon: MapPinIcon },
    { key: 'stages', label: 'Stages', icon: MicrophoneIcon },
    { key: 'vendors', label: 'Vendors', icon: ShoppingBagIcon },
    { key: 'incidents', label: 'Incidents', icon: ExclamationTriangleIcon },
    { key: 'crowds', label: 'Crowds', icon: UserGroupIcon },
  ];

  const shouldShowElement = (type: string) => {
    if (selectedLayer === 'all') return true;
    return selectedLayer === type;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/50 to-purple-900/20">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Festival Map
            </h1>
            <p className="text-slate-400 mt-1">
              Interactive venue layout and real-time crowd visualization
            </p>
          </div>

          {/* Layer Controls */}
          <div className="flex gap-2 flex-wrap">
            {layerOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setSelectedLayer(option.key as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    selectedLayer === option.key
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 p-6">
        <div className="h-full glass-card relative overflow-hidden">
          {/* Map SVG */}
          <svg
            viewBox="0 0 600 500"
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          >
            {/* Background */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgb(71 85 105)" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Venue Boundary */}
            <rect
              x="50"
              y="50"
              width="500"
              height="400"
              fill="none"
              stroke="rgb(139 92 246)"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />

            {/* Entrance/Exit */}
            <rect x="250" y="45" width="100" height="10" fill="rgb(34 197 94)" opacity="0.8" />
            <text x="300" y="40" textAnchor="middle" fill="rgb(34 197 94)" fontSize="12" fontWeight="bold">
              ENTRANCE
            </text>

            {/* Stages */}
            {(shouldShowElement('stages') || shouldShowElement('all')) && mapElements.stages.map((stage) => (
              <g key={stage.id}>
                <rect
                  x={stage.x - 40}
                  y={stage.y - 20}
                  width="80"
                  height="40"
                  fill={stage.active ? "rgb(139 92 246)" : "rgb(71 85 105)"}
                  opacity="0.8"
                  rx="5"
                />
                <text
                  x={stage.x}
                  y={stage.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {stage.name}
                </text>
                {stage.active && (
                  <circle cx={stage.x + 30} cy={stage.y - 15} r="3" fill="rgb(34 197 94)" className="animate-pulse" />
                )}
              </g>
            ))}

            {/* Vendors */}
            {(shouldShowElement('vendors') || shouldShowElement('all')) && mapElements.vendors.map((vendor) => (
              <g key={vendor.id}>
                <circle
                  cx={vendor.x}
                  cy={vendor.y}
                  r="15"
                  fill={vendor.busy ? "rgb(239 68 68)" : "rgb(34 197 94)"}
                  opacity="0.8"
                />
                <text
                  x={vendor.x}
                  y={vendor.y - 20}
                  textAnchor="middle"
                  fill="rgb(203 213 225)"
                  fontSize="8"
                >
                  {vendor.name}
                </text>
              </g>
            ))}

            {/* Crowds */}
            {(shouldShowElement('crowds') || shouldShowElement('all')) && mapElements.crowds.map((crowd) => (
              <circle
                key={crowd.id}
                cx={crowd.x}
                cy={crowd.y}
                r={crowd.size / 3}
                fill={
                  crowd.density === 'high' ? "rgb(239 68 68)" :
                  crowd.density === 'medium' ? "rgb(245 158 11)" :
                  "rgb(34 197 94)"
                }
                opacity="0.3"
                className="animate-pulse"
              />
            ))}

            {/* Facilities */}
            {(shouldShowElement('all')) && mapElements.facilities.map((facility) => (
              <g key={facility.id}>
                <rect
                  x={facility.x - 8}
                  y={facility.y - 8}
                  width="16"
                  height="16"
                  fill="rgb(71 85 105)"
                  opacity="0.8"
                  rx="2"
                />
                <text
                  x={facility.x}
                  y={facility.y - 15}
                  textAnchor="middle"
                  fill="rgb(148 163 184)"
                  fontSize="8"
                >
                  {facility.name}
                </text>
              </g>
            ))}

            {/* Incidents */}
            {(shouldShowElement('incidents') || shouldShowElement('all')) && incidents.slice(0, 5).map((incident, index) => (
              <g key={incident.id}>
                <circle
                  cx={incident.location.x || 100 + index * 100}
                  cy={incident.location.y || 100 + index * 50}
                  r="8"
                  fill="rgb(239 68 68)"
                  className="animate-pulse"
                />
                <text
                  x={incident.location.x || 100 + index * 100}
                  y={(incident.location.y || 100 + index * 50) - 15}
                  textAnchor="middle"
                  fill="rgb(239 68 68)"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {incident.type}
                </text>
              </g>
            ))}
          </svg>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 glass rounded-lg p-4 max-w-xs">
            <h3 className="text-white font-medium mb-2">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
                <span className="text-slate-300">Active Stages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">Available Vendors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-slate-300">Busy/Incidents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-50"></div>
                <span className="text-slate-300">Crowd Density</span>
              </div>
            </div>
          </div>

          {/* Map Stats */}
          <div className="absolute top-4 right-4 glass rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Live Stats</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Stages:</span>
                <span className="text-white">{mapElements.stages.filter(s => s.active).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vendors:</span>
                <span className="text-white">{mapElements.vendors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Incidents:</span>
                <span className="text-red-400">{incidents.length}</span>
              </div>
            </div>
          </div>

          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Interactive Map Coming Soon</h2>
              <p className="text-slate-400 mb-6 max-w-md">
                The full interactive festival map with drag-and-drop editing, real-time crowd flow, 
                and detailed venue management is currently in development.
              </p>
              <div className="flex gap-4 justify-center">
                <div className="glass rounded-lg p-3 text-center">
                  <MapPinIcon className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-300">Venue Layout</p>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <UsersIcon className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-300">Crowd Flow</p>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-300">Live Incidents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalMap;