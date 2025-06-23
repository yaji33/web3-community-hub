import { useState, useEffect, useCallback } from 'react';
import { WordCloud } from '@/components/WordCloud';
import { Sentiment } from '@/components/Sentiment';
import { Insights } from '@/components/Insights';
import { IndividualSentiments } from '@/components/IndividualSentiment';
import { WordCloudData } from '@/types/sentiment';
import { getAllSentiments } from '@/lib/database';

interface SentimentSectionProps {
  activeProject: string;
}

export const SentimentSection: React.FC<SentimentSectionProps> = ({
  activeProject,
}) => {
  const [wordCloudData, setWordCloudData] = useState<WordCloudData[]>([]);
  const [sentiments, setSentiments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSentiments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSentiments(activeProject);
      setSentiments(data);
      generateWordCloud(data);
    } catch (error) {
      console.error('Error loading sentiments:', error);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    loadSentiments();
  }, [loadSentiments]);

  const generateWordCloud = (sentiments: string[]) => {
    const wordCount: { [key: string]: number } = {};

    sentiments.forEach(sentiment => {
      const words = sentiment
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(
          word =>
            word.length > 3 &&
            ![
              'this',
              'that',
              'with',
              'have',
              'they',
              'from',
              'and',
              'will',
              'been',
              'some',
              'more',
              'very',
              'what',
              'when',
              'where',
              'just',
              'like',
              'also',
              'good',
              'great',
            ].includes(word)
        );

      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });

    const data = Object.entries(wordCount)
      .map(([text, value]) => ({
        text,
        value,
        size: value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    setWordCloudData(data);
  };

  const handleSentimentSubmit = (newSentiment: string) => {
    const updatedSentiments = [newSentiment, ...sentiments];
    setSentiments(updatedSentiments);
    generateWordCloud(updatedSentiments);
  };

  const activeWords = wordCloudData.length;
  const contributors = sentiments.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">
            Loading {activeProject} community data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto lg:px-12 md:px-8 sm:px-4">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8">
            <WordCloud data={wordCloudData} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Sentiment
              onSentimentAdded={handleSentimentSubmit}
              projectName={activeProject}
            />
            <Insights
              activeWords={activeWords}
              contributors={contributors}
              projectName={activeProject}
            />
          </div>
        </div>

        <div className="mt-8">
          <IndividualSentiments projectName={activeProject} />
        </div>
      </div>
    </div>
  );
};
