import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageCircle, User, Clock } from 'lucide-react';
import { getFullSentiments, subscribeToSentiments } from '@/lib/database';
import { SentimentEntry, SentimentPayload } from '@/types/sentiment';

// Define the type for the subscription object
interface SentimentSubscription {
  unsubscribe: () => void;
}

interface IndividualSentimentsProps {
  projectName?: string;
}

export const IndividualSentiments: React.FC<IndividualSentimentsProps> = ({
  projectName = 'magic-newton',
}) => {
  const [sentiments, setSentiments] = useState<SentimentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<SentimentSubscription | null>(null);

  const loadSentiments = useCallback(async () => {
    try {
      setError(null);
      const fullSentiments = await getFullSentiments(projectName);
      setSentiments(fullSentiments);
    } catch (err) {
      setError('Failed to load sentiments');
      console.error('Error loading sentiments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectName]);

  useEffect(() => {
    loadSentiments();

    // Set up real-time subscription only if not already subscribed
    if (!subscriptionRef.current) {
      try {
        // Pass both projectName and callback to subscribeToSentiments
        subscriptionRef.current = subscribeToSentiments(
          projectName,
          (sentiment: SentimentPayload) => {
            console.log('Individual sentiments update:', sentiment);

            if (sentiment?.new) {
              const newSentiment = sentiment.new;

              setSentiments(prev => {
                const filtered = prev.filter(
                  s =>
                    !(
                      s.isOptimistic &&
                      s.sentiment_text === newSentiment.sentiment_text
                    )
                );
                return [newSentiment, ...filtered];
              });
            }
          }
        );
      } catch (err) {
        console.error('Error setting up real-time subscription:', err);
        // setError('Failed to set up real-time updates');
      }
    }

    return () => {
      console.log('Cleaning up subscription...');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [projectName, loadSentiments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSentiments();
    setIsRefreshing(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Community Sentiments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-md border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Community Sentiments
            <span className="text-sm font-normal text-gray-400">
              ({sentiments.length})
            </span>
          </CardTitle>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sentiments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sentiments shared yet.</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            sentiments.map(sentiment => (
              <div
                key={sentiment.id}
                className="bg-white/5 border border-purple-500/20 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{sentiment.contributor_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(sentiment.created_at)}</span>
                  </div>
                </div>
                <p className="text-white text-sm leading-relaxed">
                  {sentiment.sentiment_text}
                </p>
              </div>
            ))
          )}
        </div>

        {sentiments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <p className="text-xs text-gray-400 text-center">
              Showing {sentiments.length} sentiment
              {sentiments.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
