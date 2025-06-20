import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            <Bot className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Magic Newton
            </h1>
            <p className="text-purple-300 text-lg font-medium">
              Sentiment & Agent Ideas Hub
            </p>
          </div>
        </div>
        <p className="text-center text-gray-300 mt-4 max-w-2xl mx-auto">
          Share your thoughts about Magic Newton and contribute AI agent ideas to our growing community
        </p>
      </div>
    </header>
  );
};