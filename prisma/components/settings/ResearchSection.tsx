
import React from 'react';
import { FlaskConical, Info } from 'lucide-react';
import { AppConfig } from '../../types';

interface ResearchSectionProps {
  config: AppConfig;
  setConfig: (c: AppConfig) => void;
}

const ResearchSection = ({ config, setConfig }: ResearchSectionProps) => {
  const isEnabled = config.enableResearchMode ?? false;

  return (
    <div className="space-y-4 pt-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FlaskConical size={14} className="text-slate-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Research Mode</h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setConfig({ ...config, enableResearchMode: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {isEnabled && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Scientific workflow enabled</p>
              <p>Responses will emphasize evidence, methodology, limitations, and citation discipline.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Research focus (optional)
            </label>
            <textarea
              value={config.researchFocus || ''}
              onChange={(e) => setConfig({ ...config, researchFocus: e.target.value })}
              placeholder="e.g., immunotherapy biomarkers, graph neural networks, climate attribution..."
              rows={3}
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchSection;
