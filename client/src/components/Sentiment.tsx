import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Share2,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
} from 'lucide-react';
import { submitSentiment, canUserSubmit } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

interface SentimentProps {
  projectName?: string;
  onSentimentAdded?: (sentiment: string, name?: string) => void;
}

interface SubmissionStatus {
  canSubmit: boolean;
  remainingSubmissions: number;
  nextSubmissionTime?: Date;
}

export const Sentiment: React.FC<SentimentProps> = ({
  projectName = 'magic-newton',
  onSentimentAdded,
}) => {
  const [sentiment, setSentiment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    canSubmit: true,
    remainingSubmissions: 3,
  });
  const [timeUntilNextSubmission, setTimeUntilNextSubmission] =
    useState<string>('');
  const toast = useToast();

  // Check submission status on component mount and periodically
  useEffect(() => {
    checkSubmissionStatus();

    // Check every 30 seconds
    const interval = setInterval(checkSubmissionStatus, 30000);
    return () => clearInterval(interval);
  }, [projectName]); // Add projectName to dependency array

  // Update countdown timer
  useEffect(() => {
    if (!submissionStatus.nextSubmissionTime) {
      setTimeUntilNextSubmission('');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff =
        submissionStatus.nextSubmissionTime!.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilNextSubmission('');
        checkSubmissionStatus(); // Recheck status
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilNextSubmission(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [submissionStatus.nextSubmissionTime]);

  const checkSubmissionStatus = async () => {
    try {
      const status = await canUserSubmit(projectName); // Pass projectName
      setSubmissionStatus(status);
    } catch (error) {
      console.error('Error checking submission status:', error);
      // Default to allowing submission if check fails
      setSubmissionStatus({ canSubmit: true, remainingSubmissions: 3 });
    }
  };

  // Enhanced input validation with real-time feedback
  const validateInput = (): { isValid: boolean; error?: string } => {
    if (!sentiment.trim()) {
      return {
        isValid: false,
        error: 'Please enter your thoughts before submitting!',
      };
    }

    const trimmedText = sentiment.trim();

    if (trimmedText.length < 5) {
      return { isValid: false, error: 'Please write at least 5 characters.' };
    }

    if (sentiment.length > 500) {
      return {
        isValid: false,
        error: 'Message is too long (max 500 characters).',
      };
    }

    // Check word count
    const wordCount = trimmedText
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    if (wordCount < 2) {
      return { isValid: false, error: 'Please write at least 2 words.' };
    }

    // Enhanced spam patterns
    const spamPatterns = [
      /(.)\1{7,}/g, // Repeated characters (8+ times)
      /(http|https|www|\.com|\.net|\.org)/gi, // URLs
      /[A-Z]{12,}/g, // Excessive caps
      /(\w)\1{5,}/gi, // Any character repeated 6+ times
      /(spam|bot|test|aaa|bbb|ccc|ddd|eee|fff|ggg|hhh|iii|jjj|kkk|lll|mmm|nnn|ooo|ppp|qqq|rrr|sss|ttt|uuu|vvv|www|xxx|yyy|zzz)/gi,
    ];

    if (spamPatterns.some(pattern => pattern.test(trimmedText))) {
      return {
        isValid: false,
        error: 'Please write a genuine message without spam content.',
      };
    }

    if (name && name.length > 50) {
      return { isValid: false, error: 'Name is too long (max 50 characters).' };
    }

    if (name && spamPatterns.some(pattern => pattern.test(name))) {
      return { isValid: false, error: 'Please enter a valid name.' };
    }

    return { isValid: true };
  };

  const handleSubmitSentiment = async () => {
    // Check if user can submit
    if (!submissionStatus.canSubmit) {
      toast.error(
        `Rate limit exceeded. You can submit again in ${timeUntilNextSubmission || 'a few minutes'}.`
      );
      return;
    }

    const validation = validateInput();
    if (!validation.isValid) {
      toast.error(validation.error as string);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting sentiment:', sentiment);

      // Fix the function call - pass projectName and handle optional name
      const result = await submitSentiment(
        sentiment,
        projectName,
        name || undefined
      );

      if (result.success) {
        console.log('Sentiment submitted successfully:', result.data);

        // Immediately update the word cloud with optimistic update
        if (onSentimentAdded) {
          onSentimentAdded(sentiment, name || undefined);
        }

        // Show success feedback
        setJustSubmitted(true);
        setTimeout(() => setJustSubmitted(false), 3000);

        // Clear form
        setSentiment('');
        setName('');

        // Update submission status
        await checkSubmissionStatus();

        toast.success(
          `Thanks for sharing! Your sentiment has been added to the word cloud. ${submissionStatus.remainingSubmissions - 1} submissions remaining this hour.`
        );
      } else {
        console.error('Submission failed:', result.error);
        toast.error(result.error || 'Failed to submit sentiment');

        // Refresh submission status in case of rate limit
        await checkSubmissionStatus();
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareToX = () => {
    const shareText = `Just shared my thoughts about @MagicNewton on their community sentiment hub! 🤖✨ What do you think about AI agents and cross-chain automation? #MagicNewton #AIAgents #NEWT`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          toast.success('Tweet text copied to clipboard!');
        })
        .catch(() => {
          fallbackCopyTextToClipboard(shareText);
        });
    } else {
      fallbackCopyTextToClipboard(shareText);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Tweet text copied to clipboard!');
      } else {
        toast.error('Copy command was unsuccessful');
      }
    } catch (err) {
      console.error('Error copying text to clipboard:', err);
      toast.error('Failed to copy text to clipboard');
    }
    document.body.removeChild(textArea);
  };

  const remainingChars = 500 - sentiment.length;
  const validation = validateInput();
  const isFormValid = validation.isValid && submissionStatus.canSubmit;

  return (
    <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 flex-grow relative overflow-hidden">
      {/* Success overlay animation */}
      {justSubmitted && (
        <div className="absolute inset-0 bg-green-500/10 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 flex items-center gap-2 text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Sentiment added to word cloud!</span>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Share Your Thoughts
          <Shield className="w-4 h-4 text-blue-400" />
          {!submissionStatus.canSubmit && (
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          )}
          {justSubmitted && <CheckCircle className="w-4 h-4 text-green-400" />}
        </CardTitle>

        {/* Submission status indicator */}
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${submissionStatus.canSubmit ? 'bg-green-400' : 'bg-red-400'}`}
            />
            <span>
              {submissionStatus.canSubmit
                ? `${submissionStatus.remainingSubmissions} submissions remaining this hour`
                : 'Rate limit reached'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="Enter your name (optional, max 50 chars)"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 50))}
          disabled={isSubmitting}
          className="bg-white/10 border-purple-400/30 text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-purple-400/20"
        />

        <div className="relative">
          <Textarea
            placeholder="Tell us what you think about Magic Newton, AI agents, cross-chain automation, or anything else on your mind... (min 5 chars, 2 words)"
            value={sentiment}
            onChange={e => setSentiment(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
            className="bg-white/10 border-purple-400/30 text-white placeholder-gray-400 min-h-[100px] resize-none pr-16 focus:border-purple-400/50 focus:ring-purple-400/20"
          />
          <div
            className={`absolute bottom-2 right-2 text-xs font-medium ${
              remainingChars < 50
                ? 'text-yellow-400'
                : remainingChars < 0
                  ? 'text-red-400'
                  : 'text-gray-400'
            }`}
          >
            {remainingChars}
          </div>
        </div>

        {/* Enhanced validation feedback */}
        {sentiment.trim() && !validation.isValid && (
          <div className="text-red-400 text-xs flex items-center gap-1 bg-red-400/10 p-2 rounded border border-red-400/20">
            <AlertTriangle className="w-3 h-3" />
            {validation.error}
          </div>
        )}

        {/* Rate limit warning */}
        {!submissionStatus.canSubmit && (
          <div className="text-yellow-400 text-xs flex items-center gap-1 bg-yellow-400/10 p-2 rounded border border-yellow-400/20">
            <Clock className="w-3 h-3" />
            <div>
              <div>Rate limit reached (3 submissions per hour)</div>
              {timeUntilNextSubmission && (
                <div className="text-yellow-300">
                  Next submission in: {timeUntilNextSubmission}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Low submissions warning */}
        {submissionStatus.canSubmit &&
          submissionStatus.remainingSubmissions <= 1 && (
            <div className="text-orange-400 text-xs flex items-center gap-1 bg-orange-400/10 p-2 rounded border border-orange-400/20">
              <AlertTriangle className="w-3 h-3" />
              Only {submissionStatus.remainingSubmissions} submission
              {submissionStatus.remainingSubmissions !== 1 ? 's' : ''} remaining
              this hour
            </div>
          )}

        <div className="flex gap-2">
          <Button
            onClick={handleSubmitSentiment}
            disabled={isSubmitting || !isFormValid || remainingChars < 0}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding to Cloud...
              </>
            ) : justSubmitted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Added Successfully!
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Add to Word Cloud
              </>
            )}
          </Button>

          <Button
            onClick={handleShareToX}
            variant="outline"
            disabled={isSubmitting}
            className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50 transition-all duration-200 hover:border-purple-400/70"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
