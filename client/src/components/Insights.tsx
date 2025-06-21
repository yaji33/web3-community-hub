import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCommunityInsights } from '@/lib/database';
import { CommunityInsights } from '@/types/sentiment';

interface InsightsProps {
  activeWords?: number;
  contributors?: number;
  projectName?: string;
}

export const Insights: React.FC<InsightsProps> = ({
  activeWords,
  contributors,
  projectName = 'Magic Newton',
}) => {
  const [insights, setInsights] = useState<CommunityInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCommunityInsights(projectName);
      setInsights(data);
      setError(null);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [projectName]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Use database data if available, otherwise fall back to props
  const displayActiveWords = insights?.total_words || activeWords || 0;
  const displayContributors =
    insights?.unique_contributors || contributors || 0;
  const totalSubmissions = insights?.total_submissions || 0;
  const avgWordsPerSubmission = insights?.avg_words_per_submission || 0;

  if (loading) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 h-80">
        <CardHeader>
          <CardTitle className="text-white">Community Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-800/40 to-blue-900/40 rounded-xl p-6 text-white shadow-lg border border-purple-500/20 h-full flex items-center justify-center">
            <div className="animate-pulse text-purple-200">
              Loading insights...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 h-80">
        <CardHeader>
          <CardTitle className="text-white">Community Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-800/40 to-blue-900/40 rounded-xl p-6 text-white shadow-lg border border-purple-500/20 h-full flex items-center justify-center">
            <div className="text-red-400 text-center">
              <p>Failed to load insights</p>
              <button
                onClick={loadInsights}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 h-80">
      <CardHeader>
        <CardTitle className="text-white">Community Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className=" rounded-xl p-8 text-white shadow-lg  h-full">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="text-center flex flex-col justify-center">
              <p className="text-3xl font-bold t mb-1">
                {displayActiveWords.toLocaleString()}
              </p>
              <p className="text-xs ">Total Words</p>
            </div>
            <div className="text-center flex flex-col justify-center">
              <p className="text-3xl font-bold mb-1">{displayContributors}</p>
              <p className="text-xs ">Contributors</p>
            </div>
            <div className="text-center flex flex-col justify-center">
              <p className="text-3xl font-bold  mb-1">{totalSubmissions}</p>
              <p className="text-xs ">Submissions</p>
            </div>
            <div className="text-center flex flex-col justify-center">
              <p className="text-3xl font-bold t mb-1">
                {Math.round(avgWordsPerSubmission)}
              </p>
              <p className="text-xs ">Avg Words</p>
            </div>
          </div>

          {/*insights && (
            <div className="mt-4 pt-2 border-t border-white/10">
              <div className="text-xs text-purple-200 text-center">
                Active since{' '}
                {new Date(insights.first_submission).toLocaleDateString()}
              </div>
            </div>
          )*/}
        </div>
      </CardContent>
    </Card>
  );
};
