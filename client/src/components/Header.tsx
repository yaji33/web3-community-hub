//import React from 'react';
//import { Sparkles, Bot } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2"></div>
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Web3 Community Word Hub
            </h1>
          </div>
        </div>
        <p className="text-center text-gray-300 mt-4 max-w-2xl mx-auto">
          Explore the collective voice of Web3 communities through interactive
          word clouds, sentiment analysis, and data-driven insights.
        </p>
      </div>
    </header>
  );
};
