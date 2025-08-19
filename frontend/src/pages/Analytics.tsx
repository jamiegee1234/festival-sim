import React from 'react';
import { ChartBarIcon, TrendingUpIcon, CalculatorIcon } from '@heroicons/react/24/outline';

const Analytics: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-purple-900/20">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChartBarIcon className="w-10 h-10 text-blue-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Advanced Analytics
        </h1>
        
        <p className="text-slate-400 text-lg mb-8">
          Comprehensive data analysis and insights for your festival performance, 
          attendance patterns, revenue optimization, and operational efficiency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 text-center">
            <TrendingUpIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Revenue Trends</h3>
            <p className="text-slate-400 text-sm">
              Track ticket sales, vendor revenue, and profit margins over time
            </p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <ChartBarIcon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Attendance Analytics</h3>
            <p className="text-slate-400 text-sm">
              Analyze crowd patterns, demographic breakdowns, and satisfaction scores
            </p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <CalculatorIcon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Operational Metrics</h3>
            <p className="text-slate-400 text-sm">
              Monitor safety incidents, staff efficiency, and resource utilization
            </p>
          </div>
        </div>

        <div className="glass-card p-8 text-left">
          <h2 className="text-2xl font-bold text-white mb-4">Coming Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-slate-300">Real-time dashboard charts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-slate-300">Historical data comparison</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Predictive analytics</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-slate-300">Custom report generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-slate-300">Export capabilities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span className="text-slate-300">Performance benchmarking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;