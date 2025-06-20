import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InsightsProps {
  activeWords: number;
  contributors: number;
}

export const Insights: React.FC<InsightsProps> = ({
  activeWords,
  contributors,
}) => {
  return (
    <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 h-80">
      <CardHeader>
        <CardTitle className="text-white">Community Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-purple-800/40 to-blue-900/40 rounded-xl p-6 text-white shadow-lg border border-purple-500/20 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-400 mb-2">
                {activeWords}
              </p>
              <p className="text-sm text-purple-200">Words Shared</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400 mb-2">
                {contributors}
              </p>
              <p className="text-sm text-purple-200">Unique Contributors</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
