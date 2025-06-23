import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import cloud from 'd3-cloud';
import * as d3 from 'd3';
import { getAllSentiments, subscribeToSentiments } from '@/lib/database';
import { WordCloudData, CloudWord, SentimentPayload } from '@/types/sentiment';

interface WordCloudProps {
  data?: WordCloudData[];
  projectName?: string;
}

interface SentimentSubscription {
  unsubscribe: () => void;
}

const processTextToWords = (sentiments: string[]): WordCloudData[] => {
  const wordCount: { [key: string]: number } = {};
  const stopWords = new Set([
    'feel',
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
    'shall',
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
    'hers',
    'its',
    'our',
    'their',
    'mine',
    'yours',
    'theirs',
    'this',
    'that',
    'these',
    'those',
    'here',
    'there',
    'where',
    'when',
    'why',
    'how',
    'very',
    'really',
    'just',
    'so',
    'too',
    'also',
    'only',
    'even',
    'still',
    'well',
    'get',
    'got',
    'go',
    'going',
    'went',
    'come',
    'came',
    'take',
    'took',
    'make',
    'made',
    'see',
    'saw',
    'look',
    'looked',
    'know',
    'knew',
    'think',
    'thought',
    'say',
    'said',
    'tell',
    'told',
    'give',
    'gave',
    'find',
    'found',
    'use',
    'used',
    'work',
    'worked',
    'want',
    'wanted',
    'need',
    'needed',
    'try',
    'tried',
    'keep',
    'kept',
    'put',
    'set',
    'one',
    'two',
    'three',
    'first',
    'last',
    'new',
    'old',
    'good',
    'bad',
    'big',
    'small',
    'long',
    'short',
    'high',
    'low',
    'right',
    'left',
    'next',
    'same',
    'different',
    'about',
    'after',
    'again',
    'against',
    'all',
    'any',
    'because',
    'before',
    'between',
    'both',
    'each',
    'few',
    'from',
    'into',
    'more',
    'most',
    'other',
    'some',
    'such',
    'than',
    'through',
    'during',
    'above',
    'below',
    'up',
    'down',
    'out',
    'off',
    'over',
    'under',
    'not',
    'no',
    'nor',
    'if',
    'then',
    'now',
    'once',
    'while',
    'as',
    'am',
    'let',
    'much',
    'many',
    'less',
    'little',
    'far',
    'near',
    'back',
    'away',
    'around',
    'don',
    'doesn',
    'didn',
    'won',
    'wouldn',
    'shouldn',
    'couldn',
    'mustn',
    'needn',
    'daren',
    'mightn',
    'shan',
    'haven',
    'hasn',
    'hadn',
    'isn',
    'aren',
    'wasn',
    'weren',
    'like',
    'thing',
    'things',
    'something',
    'anything',
    'nothing',
    'everything',
    'someone',
    'anyone',
    'everyone',
    'somewhere',
    'anywhere',
    'everywhere',
    'way',
    'ways',
    'time',
    'times',
    'day',
    'days',
    'year',
    'years',
    'people',
    'person',
    'man',
    'woman',
    'child',
    'children',
    'place',
    'world',
    'life',
    'hand',
    'part',
    'end',
    'case',
    'fact',
    'lot',
    'bit',
    'kind',
    'sort',
    'type',
    'stuff',
  ]);

  sentiments.forEach(sentiment => {
    if (typeof sentiment === 'string' && sentiment.trim()) {
      sentiment
        .toLowerCase()
        .replace(/[^\w\s'-]/g, ' ')
        .replace(/\b\w*\d+\w*\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(/\s+/)
        .map(word =>
          word
            .replace(/^['-]+|['-]+$/g, '')
            .replace(/'t$/, '')
            .replace(/'re$/, '')
            .replace(/'ve$/, '')
            .replace(/'ll$/, '')
            .replace(/'d$/, '')
            .replace(/'s$/, '')
        )
        .filter(word => isValidWord(word, stopWords))
        .forEach(word => {
          const normalizedWord = word.toLowerCase().trim();
          if (normalizedWord && !stopWords.has(normalizedWord)) {
            wordCount[normalizedWord] = (wordCount[normalizedWord] || 0) + 1;
          }
        });
    }
  });

  return Object.entries(wordCount)
    .filter(([word]) => isValidWord(word, stopWords))
    .map(([text, value]) => ({ text, value, size: value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
};

const isValidWord = (word: string, stopWords: Set<string>): boolean => {
  if (!word || typeof word !== 'string') return false;
  const cleanWord = word.toLowerCase().trim();
  return (
    cleanWord.length >= 3 &&
    /[a-zA-Z]/.test(cleanWord) &&
    !stopWords.has(cleanWord)
  );
};

export const WordCloud: React.FC<WordCloudProps> = ({
  projectName = 'magic-newton',
  data: initialData = [],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [words, setWords] = useState<WordCloudData[]>([]);
  const [sentiments, setSentiments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const subscriptionRef = useRef<SentimentSubscription | null>(null);
  const isSubscriptionActive = useRef(false);
  const [_debugInfo, setDebugInfo] = useState('');

  // Optimized word cloud update function
  const updateWordCloud = useCallback((sentimentList: string[]) => {
    console.log('Updating word cloud with', sentimentList.length, 'sentiments');
    setDebugInfo(`Processing ${sentimentList.length} sentiments...`);

    if (sentimentList.length > 0) {
      const processedWords = processTextToWords(sentimentList);
      setWords(processedWords);
      setAnimationKey(prev => prev + 1); // Trigger re-animation
    } else {
      setWords([]);
    }
  }, []);

  // Process combined sentiments and initial data
  const processedInitialData = useMemo(
    () =>
      processTextToWords(sentiments.concat(initialData.map(d => d.text || ''))),
    [initialData, sentiments]
  );

  // Set words from initial data or processed data
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setWords(initialData);
    } else {
      setWords(processedInitialData);
    }
    setLoading(false);
  }, [initialData, processedInitialData]);

  // Load initial sentiments
  useEffect(() => {
    let isMounted = true;
    const loadSentiments = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo('Loading sentiments...');
        console.log('Loading initial sentiments for project:', projectName);

        const sentimentTexts = await getAllSentiments(projectName);
        console.log('Loaded sentiments:', sentimentTexts);
        setDebugInfo(`Loaded ${sentimentTexts.length} sentiments`);

        if (isMounted) {
          setSentiments(sentimentTexts);
          updateWordCloud(sentimentTexts);
        }
      } catch (err) {
        console.error('Error loading sentiments:', err);
        if (isMounted) {
          setError('Failed to load community sentiments');
          setDebugInfo(
            `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (initialData.length === 0) {
      loadSentiments();
    }

    return () => {
      isMounted = false;
    };
  }, [updateWordCloud, projectName, initialData.length]);

  // Handle real-time sentiment subscriptions
  useEffect(() => {
    if (isSubscriptionActive.current) return;
    isSubscriptionActive.current = true;

    subscriptionRef.current = subscribeToSentiments(
      projectName,
      (sentiment: unknown) => {
        const payload = sentiment as SentimentPayload;
        if (payload?.new && payload.new.sentiment_text) {
          const newSentiment = payload.new;
          setSentiments(prev =>
            [newSentiment.sentiment_text, ...prev].slice(0, 100)
          );
          updateWordCloud([newSentiment.sentiment_text, ...sentiments]);
        }
      }
    );

    return () => {
      isSubscriptionActive.current = false;
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    };
  }, [updateWordCloud, projectName, sentiments]);

  useEffect(() => {
    if (!svgRef.current || words.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 700;
    const height = 400;
    svg.selectAll('*').remove();

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

    const existingWords = new Map<
      string,
      { x: number; y: number; rotate: number }
    >();
    const layout = cloud<CloudWord>()
      .size([width, height])
      .words(words.map(d => ({ ...d, size: fontScale(d.value) })))
      .padding(8)
      .rotate(() => (Math.random() < 0.7 ? 0 : 90))
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
        .text(d => d.text.charAt(0).toUpperCase() + d.text.slice(1)) // Capitalize first letter
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
      <div className="absolute inset-0 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
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
            <radialGradient id="animatedGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.03">
                <animate
                  attributeName="stop-opacity"
                  values="0.03;0.08;0.03"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.05">
                <animate
                  attributeName="stop-opacity"
                  values="0.05;0.12;0.05"
                  dur="4s"
                  repeatCount="indefinite"
                  begin="1s"
                />
              </stop>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.02">
                <animate
                  attributeName="stop-opacity"
                  values="0.02;0.06;0.02"
                  dur="4s"
                  repeatCount="indefinite"
                  begin="2s"
                />
              </stop>
            </radialGradient>
          </defs>
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
          Community Word Cloud{' '}
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
              Loading community thoughts...
            </div>
          ) : error ? (
            <div className="text-center text-red-400 font-sans">
              <p className="text-lg mb-2"> {error}</p>
              <p className="text-sm">Please try refreshing the page</p>
            </div>
          ) : words.length > 0 ? (
            <svg
              ref={svgRef}
              width="700"
              height="400"
              className="overflow-visible font-sans"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            />
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
