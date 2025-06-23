import React from 'react';
import NewtonLogo from '@/assets/magic-newton.png';
import HanaLogo from '@/assets/hana.png';
import BlessLogo from '@/assets/bless.png';
import TakeLogo from '@/assets/take.png';

interface ProjectNavigationProps {
  activeProject: string;
  onProjectChange: (project: string) => void;
}

export const ProjectNavigation: React.FC<ProjectNavigationProps> = ({
  activeProject,
  onProjectChange,
}) => {
  const tabs = [
    { name: 'Newton', logo: NewtonLogo, id: 'Magic Newton' },
    { name: 'Hana', logo: HanaLogo, id: 'Hana' },
    { name: 'Bless', logo: BlessLogo, id: 'Bless' },
    { name: 'OverTake', logo: TakeLogo, id: 'Take' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {tabs.map(tab => (
        <button
          key={tab.name}
          onClick={() => onProjectChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            activeProject === tab.id
              ? 'bg-gradient-to-r text-white shadow-lg transform scale-105 !bg-gray-800'
              : '!bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
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
