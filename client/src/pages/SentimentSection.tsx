import { useState, useEffect, useCallback } from 'react';
import { WordCloud } from '@/components/WordCloud';
import { Sentiment } from '@/components/Sentiment';
import { Insights } from '@/components/Insights';
import { IndividualSentiments } from '@/components/IndividualSentiment';
import { WordCloudData } from '@/types/sentiment';

export const SentimentSection = () => {
  const [wordCloudData, setWordCloudData] = useState<WordCloudData[]>([]);
  const [sentiments, setSentiments] = useState<string[]>([]);

  const loadSentiments = useCallback(() => {
    const mockSentiments = [
      'Magic Newton is amazing and innovative',
      'Love the automation features',
      'Great work on the AI agents',
      'Cross-chain functionality is wow',
      'Really happy with the innovation',
      'Bullish on the future',
      'Sad that not more people know about it',
      'Should be more popular',
    ];
    setSentiments(mockSentiments);
    generateWordCloud(mockSentiments);
  }, []);

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
            !['this', 'that', 'with', 'have', 'they', 'from', 'and'].includes(
              word
            )
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
    const updatedSentiments = [...sentiments, newSentiment];
    setSentiments(updatedSentiments);
    generateWordCloud(updatedSentiments);
  };

  // Calculate insights
  const activeWords = wordCloudData.length;
  const contributors = new Set(sentiments).size; // Unique sentiments as proxy for contributors

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-12 ">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8">
            <WordCloud data={wordCloudData} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Sentiment onSentimentAdded={handleSentimentSubmit} />

            <Insights activeWords={activeWords} contributors={contributors} />
          </div>
        </div>

        <div className="mt-8">
          <IndividualSentiments />
        </div>
      </div>
    </div>
  );
};
