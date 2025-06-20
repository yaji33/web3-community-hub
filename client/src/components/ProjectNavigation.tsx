import React, { useState } from 'react';

export const ProjectNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Newton');

  const tabs = ['Newton', 'Other'];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === tab
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
