import React, { useState, useEffect } from 'react';
import { WordCloud } from '@/components/WordCloud';
import { Sentiment } from '@/components/Sentiment';
import { Insights } from '@/components/Insights';

interface WordCloudData {
  size: number;
  text: string;
  value: number;
}

export const SentimentSection = () => {
  const [wordCloudData, setWordCloudData] = useState<WordCloudData[]>([]);
  const [sentiments, setSentiments] = useState<string[]>([]);

  useEffect(() => {
    loadSentiments();
  }, []);

  const loadSentiments = () => {
    // Simulating stored sentiments since localStorage isn't available
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
  };

  const generateWordCloud = (sentiments: string[]) => {
    const wordCount: { [key: string]: number } = {};

    sentiments.forEach(sentiment => {
      const words = sentiment
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(
          word =>
            word.length > 2 &&
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
    <div className="min-h-screen p-6">
      <section className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Community Sentiment
          </h2>
          <p className="text-purple-200">
            What do you think about Magic Newton?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Word Cloud - Takes 8 columns (2/3 width) */}
          <div className="md:col-span-8 col-span-1">
            <WordCloud words={wordCloudData} />
          </div>

          {/* Right side - Takes 4 columns (1/3 width) */}
          <div className="md:col-span-4 col-span-1 space-y-6">
            {/* Share Your Thoughts Card */}
            <Sentiment onSentimentSubmit={handleSentimentSubmit} />

            {/* Community Insights Card */}
            <Insights activeWords={activeWords} contributors={contributors} />
          </div>
        </div>
      </section>
    </div>
  );
};
