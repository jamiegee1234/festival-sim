import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  SparklesIcon, 
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MusicalNoteIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useFestivalManager, useFestivalTemplates } from '@/hooks/useApi';
import { formatCurrency, cn } from '@/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { FestivalFormData } from '@/types';

const FestivalCreator: React.FC = () => {
  const navigate = useNavigate();
  const { createFestival, createFromTemplate, creating } = useFestivalManager();
  const { data: templates, refetch: fetchTemplates } = useFestivalTemplates();
  
  const [activeTab, setActiveTab] = useState<'custom' | 'template'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FestivalFormData>({
    name: '',
    genre: 'Mixed',
    theme: 'Contemporary',
    capacity: 25000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 1000000,
  });

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleInputChange = (key: keyof FestivalFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateCustom = async () => {
    try {
      await createFestival(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create festival:', error);
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await createFromTemplate(selectedTemplate, formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create festival from template:', error);
    }
  };

  const genreOptions = [
    'Mixed', 'Rock', 'Pop', 'Electronic', 'Hip-Hop', 'Jazz', 'Country', 'Folk', 'Classical', 'Indie'
  ];

  const themeOptions = [
    'Contemporary', 'Retro', 'Futuristic', 'Natural', 'Urban', 'Vintage', 'Minimalist', 'Colorful'
  ];

  const templateCards = templates?.templates || [
    {
      id: 'electronic',
      name: 'Electronic Music Festival',
      description: 'High-energy electronic music event',
      genre: 'Electronic',
      capacity: 30000,
      duration: 2,
      estimatedBudget: 800000,
      features: ['LED Stages', 'VIP Areas', 'Food Trucks', 'Late Night Sets']
    },
    {
      id: 'rock',
      name: 'Rock Festival',
      description: 'Classic rock and metal festival',
      genre: 'Rock',
      capacity: 75000,
      duration: 4,
      estimatedBudget: 2000000,
      features: ['Multiple Stages', 'Camping', 'Local Vendors', 'Meet & Greets']
    },
    {
      id: 'indie',
      name: 'Indie Music Festival',
      description: 'Independent artists showcase',
      genre: 'Indie',
      capacity: 25000,
      duration: 3,
      estimatedBudget: 600000,
      features: ['Acoustic Sets', 'Art Installations', 'Local Food', 'Intimate Venues']
    }
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900/50 to-purple-900/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <PlusIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Festival</h1>
            <p className="text-slate-400 mt-1">
              Design your perfect festival experience with our powerful creation tools
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 glass rounded-lg p-1">
          <button
            onClick={() => setActiveTab('template')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all',
              activeTab === 'template'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            )}
          >
            <SparklesIcon className="w-5 h-5" />
            From Template
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all',
              activeTab === 'custom'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            )}
          >
            <PlusIcon className="w-5 h-5" />
            Custom Festival
          </button>
        </div>

        {/* Template Selection */}
        {activeTab === 'template' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templateCards.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    'glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105',
                    selectedTemplate === template.id
                      ? 'ring-2 ring-purple-500 bg-purple-500/10'
                      : 'hover:bg-white/5'
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 transition-colors',
                      selectedTemplate === template.id
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-slate-500'
                    )}>
                      {selectedTemplate === template.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MusicalNoteIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300">{template.genre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserGroupIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">{template.capacity.toLocaleString()} capacity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{template.duration} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-slate-300">
                        {formatCurrency(template.estimatedBudget || 0, true)} budget
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.features?.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedTemplate && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Customize Your Festival</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Festival Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="form-input w-full"
                      placeholder="Enter festival name"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', Number(e.target.value))}
                      className="form-input w-full"
                      min="1000"
                      max="200000"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateFromTemplate}
                    disabled={creating || !formData.name}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        Creating Festival...
                      </>
                    ) : (
                      'Create Festival'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Festival Form */}
        {activeTab === 'custom' && (
          <div className="glass-card p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Festival Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="form-input w-full"
                      placeholder="Enter festival name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Genre
                    </label>
                    <select
                      value={formData.genre}
                      onChange={(e) => handleInputChange('genre', e.target.value)}
                      className="form-input w-full"
                    >
                      {genreOptions.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Theme
                    </label>
                    <select
                      value={formData.theme}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                      className="form-input w-full"
                    >
                      {themeOptions.map(theme => (
                        <option key={theme} value={theme}>{theme}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Expected Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', Number(e.target.value))}
                      className="form-input w-full"
                      min="500"
                      max="500000"
                      step="500"
                    />
                  </div>
                </div>
              </div>

              {/* Dates and Budget */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Schedule & Budget</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="form-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="form-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Total Budget
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                        className="form-input w-full pl-8"
                        min="10000"
                        max="50000000"
                        step="10000"
                      />
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      {formatCurrency(formData.budget)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats Preview */}
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Festival Preview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1}
                    </div>
                    <div className="text-slate-400 text-sm">Days</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formData.capacity.toLocaleString()}
                    </div>
                    <div className="text-slate-400 text-sm">Capacity</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(formData.budget, true)}
                    </div>
                    <div className="text-slate-400 text-sm">Budget</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {formData.genre}
                    </div>
                    <div className="text-slate-400 text-sm">Genre</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-4 border-t border-slate-700/50">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustom}
                  disabled={creating || !formData.name}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      Creating Festival...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create Custom Festival
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FestivalCreator;