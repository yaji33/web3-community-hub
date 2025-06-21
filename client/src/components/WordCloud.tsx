import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import cloud from 'd3-cloud';
import * as d3 from 'd3';
import { getAllSentiments, subscribeToSentiments } from '@/lib/database';
import { WordCloudData, CloudWord, SentimentPayload } from '@/types/sentiment';

interface WordCloudProps {
  data: WordCloudData[];
}

interface SentimentSubscription {
  unsubscribe: () => void;
}

// Word processing utility
const processTextToWords = (sentiments: string[]): WordCloudData[] => {
  const wordCount: { [key: string]: number } = {};

  // Common words to filter out
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
    'my',
    'your',
    'his',
    'its',
    'our',
    'their',
    'this',
    'that',
    'these',
    'those',
    'very',
    'really',
    'just',
    'so',
    'too',
    'also',
  ]);

  // Process all sentiment texts
  sentiments.forEach(sentiment => {
    const words = sentiment
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  // Convert to array and sort by frequency
  return Object.entries(wordCount)
    .map(([text, value]) => ({
      text,
      value,
      size: value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50); // Limit to top 50 words
};

export const WordCloud: React.FC<WordCloudProps> = ({ data: initialData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [words, setWords] = useState<WordCloudData[]>([]);
  const [_sentiments, setSentiments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const subscriptionRef = useRef<SentimentSubscription>(null);
  const isSubscriptionActive = useRef(false);

  // Optimized word cloud update function
  const updateWordCloud = useCallback((sentimentList: string[]) => {
    console.log('Updating word cloud with', sentimentList.length, 'sentiments');

    if (sentimentList.length > 0) {
      const processedWords = processTextToWords(sentimentList);
      setWords(processedWords);
      setAnimationKey(prev => prev + 1); // Trigger re-animation
    } else {
      setWords([]);
    }
  }, []);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setWords(initialData);
    }
  }, [initialData]);

  // Load initial sentiments
  useEffect(() => {
    const loadSentiments = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading initial sentiments...');

        const sentimentTexts = await getAllSentiments();
        console.log('Loaded', sentimentTexts.length, 'initial sentiments');

        setSentiments(sentimentTexts);
        updateWordCloud(sentimentTexts);
      } catch (err) {
        console.error('Error loading sentiments:', err);
        setError('Failed to load community sentiments');
      } finally {
        setLoading(false);
      }
    };

    loadSentiments();
  }, [updateWordCloud]);

  // Setup real-time subscription
  useEffect(() => {
    if (isSubscriptionActive.current) {
      console.log('Subscription already active, skipping...');
      return;
    }

    console.log('Setting up real-time subscription...');
    isSubscriptionActive.current = true;

    subscriptionRef.current = subscribeToSentiments((sentiment: unknown) => {
      const payload = sentiment as SentimentPayload;

      if (payload?.new?.sentiment_text) {
        const newSentimentText = payload.new.sentiment_text;

        setSentiments(prev => {
          const updated = [newSentimentText, ...prev];
          setImmediate(() => updateWordCloud(updated));
          return updated;
        });
      }
    });

    return () => {
      console.log('Cleaning up subscription...');
      isSubscriptionActive.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [updateWordCloud]);

  // D3 word cloud rendering with smooth animations
  useEffect(() => {
    if (!Array.isArray(words) || words.length === 0 || !svgRef.current) {
      console.log('Skipping render - no words or SVG ref');
      return;
    }

    console.log('Rendering word cloud with', words.length, 'words');

    const svg = d3.select(svgRef.current);
    const width = 700;
    const height = 400;

    const colors = [
      '#60A5FA',
      '#A78BFA',
      '#34D399',
      '#F472B6',
      '#FBBF24',
      '#EF4444',
      '#10B981',
      '#8B5CF6',
    ];

    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));
    const fontScale = d3
      .scaleSqrt()
      .domain([minValue, maxValue])
      .range([16, 60]);

    // Store previous positions for smooth transitions
    const existingWords = new Map<
      string,
      { x: number; y: number; rotate: number }
    >();

    svg.selectAll<SVGTextElement, CloudWord>('text').each(function (d) {
      if (d && d.text) {
        existingWords.set(d.text, {
          x: d.x ?? 0,
          y: d.y ?? 0,
          rotate: d.rotate ?? 0,
        });
      }
    });

    const layout = cloud<CloudWord>()
      .size([width, height])
      .words(words.map(d => ({ ...d, size: fontScale(d.value) })))
      .padding(8)
      .rotate(() => {
        return Math.random() < 0.7 ? 0 : 90;
      })
      .font(
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      )
      .fontWeight('600')
      .fontSize(d => d.size as number)
      .spiral('archimedean')
      .on('end', draw);

    layout.start();

    function draw(cloudWords: CloudWord[]) {
      console.log('Drawing', cloudWords.length, 'words');

      // Clear previous content with fade out
      svg
        .selectAll('g')
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();

      const g = svg
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      const textElements = g
        .selectAll<SVGTextElement, CloudWord>('text')
        .data(cloudWords, d => d.text);
      // Handle entering elements
      const enteringText = textElements
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .style(
          'font-family',
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        )
        .style('font-weight', '600')
        .style('cursor', 'pointer')
        .text(d => d.text)
        .style('fill', (_, i) => colors[i % colors.length])
        .style('opacity', 0)
        .attr('transform', d => {
          const prev = existingWords.get(d.text);
          if (prev) {
            return `translate(${prev.x},${prev.y}) rotate(${prev.rotate})`;
          }
          return `translate(0,0) rotate(0)`;
        })
        .style('font-size', d => `${d.size}px`);

      // Add hover effects
      enteringText
        .on('mouseenter', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 0.7)
            .attr('transform', function () {
              const currentTransform = d3.select(this).attr('transform');
              const scale = 1.1;
              return currentTransform + ` scale(${scale})`;
            });
        })
        .on('mouseleave', (event, d) => {
          d3.select<SVGTextElement, CloudWord>(event.currentTarget)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('transform', `translate(${d.x},${d.y}) rotate(${d.rotate})`);
        });

      // Animate to final positions
      enteringText
        .transition()
        .duration(1500)
        .ease(d3.easeCubicOut)
        .delay((_, i) => i * 50)
        .style('opacity', 1)
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`);

      // Handle updating elements
      textElements
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .style('font-size', d => `${d.size}px`)
        .style('fill', (_, i) => colors[i % colors.length]);

      // Handle exiting elements
      textElements
        .exit()
        .transition()
        .duration(500)
        .style('opacity', 0)
        .attr('transform', 'translate(0,0) scale(0)')
        .remove();
    }
  }, [words, animationKey]);

  return (
    <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 h-full relative overflow-hidden">
      {/* Enhanced background with smoother gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Noise filter */}
            <filter id="noiseFilter" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                baseFrequency="0.9"
                numOctaves="3"
                stitchTiles="stitch"
                type="fractalNoise"
              />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA
                  type="discrete"
                  tableValues="0.1 0.2 0.05 0.15 0.08 0.12"
                />
              </feComponentTransfer>
            </filter>

            {/* Gradient overlays */}
            <radialGradient id="centerGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.08" />
              <stop offset="30%" stopColor="#06B6D4" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#10B981" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.03" />
            </radialGradient>

            <linearGradient
              id="depthGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.06" />
              <stop offset="25%" stopColor="#F472B6" stopOpacity="0.04" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.08" />
              <stop offset="75%" stopColor="#FBBF24" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Layered background for depth */}
          <rect
            width="100%"
            height="100%"
            filter="url(#noiseFilter)"
            fill="white"
            opacity="0.3"
          />
          <rect width="100%" height="100%" fill="url(#centerGlow)" />
          <rect width="100%" height="100%" fill="url(#depthGradient)" />
          <rect width="100%" height="100%" fill="url(#animatedGlow)" />
        </svg>
      </div>

      <CardHeader className="relative z-10">
        <CardTitle className="text-white font-sans">
          Community Word Cloud
          {/* Real-time indicator */}
          <span className="ml-2 inline-flex items-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="ml-1 text-xs text-green-400">Live</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="h-96 flex items-center justify-center">
          {loading ? (
            <div className="text-center text-gray-400 font-sans">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p>Loading community thoughts...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 font-sans">
              <p className="text-lg mb-2">⚠️ {error}</p>
              <p className="text-sm">Please try refreshing the page</p>
            </div>
          ) : words.length > 0 ? (
            <div className="w-full h-96 flex items-center justify-center">
              <svg
                ref={svgRef}
                width="700"
                height="400"
                className="overflow-visible font-sans"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400 font-sans">
              <p className="text-lg mb-2">No sentiments yet!</p>
              <p className="text-sm">
                Be the first to share your thoughts about Magic Newton
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
