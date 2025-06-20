import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Share2 } from 'lucide-react';

interface SentimentProps {
  onSentimentSubmit: (sentiment: string) => void;
}

export const Sentiment: React.FC<SentimentProps> = ({ onSentimentSubmit }) => {
  const [sentiment, setSentiment] = useState('');

  const handleSubmitSentiment = () => {
    if (!sentiment.trim()) {
      alert('Please enter your sentiment before submitting!');
      return;
    }

    onSentimentSubmit(sentiment);
    setSentiment('');

    alert(
      'Thanks for sharing! Your sentiment has been added to the word cloud.'
    );
  };

  const handleShareToX = () => {
    const shareText = `Just shared my thoughts about @MagicNewton on their community sentiment hub! 🤖✨ What do you think about AI agents and cross-chain automation? #MagicNewton #AIAgents #NEWT`;
    navigator.clipboard.writeText(shareText);
    alert('Tweet text copied to clipboard!');
  };

  return (
    <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 h-80">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Share Your Thoughts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Tell us what you think about Magic Newton, AI agents, cross-chain automation, or anything else on your mind..."
          value={sentiment}
          onChange={e => setSentiment(e.target.value)}
          className="bg-white/10 border-purple-400/30 text-white placeholder-gray-400 min-h-[120px] resize-none"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSubmitSentiment}
            className="flex-1 !bg-[var(--primary)] text-white"
          >
            Add to Word Cloud
          </Button>

          <Button
            onClick={handleShareToX}
            variant="outline"
            className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
