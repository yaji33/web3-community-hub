import React, { useState } from 'react';
import NewtonLogo from '@/assets/magic-newton.png';

export const ProjectNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Newton');

  const tabs = [{ name: 'Newton', logo: NewtonLogo }];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {tabs.map(tab => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === tab.name
              ? 'bg-gradient-to-r text-white shadow-lg transform scale-105'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
          }`}
        >
          {tab.logo && (
            <img
              src={tab.logo}
              alt={`${tab.name} Logo`}
              className="w-5 h-5 object-contain"
            />
          )}
          {tab.name}
        </button>
      ))}
    </div>
  );
};
