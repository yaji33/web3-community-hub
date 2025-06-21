import { supabase } from './supabase';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import {
  SentimentEntry,
  SentimentPayload,
  CommunityInsights,
} from '@/types/sentiment';

// Enhanced user identifier with persistent fingerprinting
const getUserIdentifier = async (): Promise<string> => {
  // Try to get from localStorage first (persists across sessions)
  let identifier = localStorage.getItem('community_user_id');

  if (!identifier) {
    // Generate a more comprehensive fingerprint
    const fingerprint = await generateAdvancedFingerprint();

    // Create a hash that's harder to bypass
    if (crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(fingerprint);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      identifier = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 32); // Longer identifier
    } else {
      identifier = btoa(fingerprint)
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 32);
    }

    // Store in localStorage (persists across refreshes)
    localStorage.setItem('community_user_id', identifier);
  }

  return identifier;
};

// More comprehensive fingerprinting that's harder to bypass
const generateAdvancedFingerprint = async (): Promise<string> => {
  const signals = [
    // Browser fingerprint
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') || '',
    navigator.platform,

    // Screen fingerprint
    screen.width + 'x' + screen.height,
    screen.availWidth + 'x' + screen.availHeight,
    screen.colorDepth,
    screen.pixelDepth,

    // System fingerprint
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency || 'unknown',
    //navigator.deviceMemory || 'unknown',
    navigator.maxTouchPoints || 0,

    // Canvas fingerprint (basic)
    await generateCanvasFingerprint(),

    // WebGL fingerprint (basic)
    getWebGLFingerprint(),

    // Audio context fingerprint
    await getAudioFingerprint(),
  ];

  return signals.join('|');
};

// Canvas fingerprinting
const generateCanvasFingerprint = async (): Promise<string> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Magic Newton Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Unique Browser ID', 4, 35);

    return canvas.toDataURL().slice(0, 100);
  } catch {
    return 'canvas-error';
  }
};

// WebGL fingerprinting
const getWebGLFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) return 'no-webgl';
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);

    return `${vendor}-${renderer}`.slice(0, 50);
  } catch {
    return 'webgl-error';
  }
};

// Audio context fingerprinting
const getAudioFingerprint = async (): Promise<string> => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      return 'no-audio-context';
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    oscillator.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    oscillator.stop();
    await audioContext.close();

    return Array.from(frequencyData.slice(0, 10)).join('');
  } catch {
    return 'audio-error';
  }
};

// Enhanced spam detection with more patterns
const isSpamContent = (text: string): boolean => {
  const spamPatterns = [
    /(.)\1{8,}/g, // Repeated characters (8+ in a row)
    /(http|https|www|\.com|\.net|\.org|\.co|\.io)/gi, // URLs
    /(.{2,})\1{4,}/g, // Repeated phrases (4+ times)
    /[A-Z]{12,}/g, // Excessive caps (12+ consecutive)
    /^\s*(.)\1*\s*$/g, // Only repeated single character
    /[0-9]{10,}/g, // Long sequences of numbers
    /(\w)\1{5,}/gi, // Any character repeated 6+ times
    /(spam|bot|test|aaa|bbb|ccc|ddd|eee|fff|ggg|hhh|iii)/gi, // Common spam words
    /^.{1,2}$/g, // Too short (1-2 chars)
    /^(.)\1+$/g, // Only same character repeated
  ];

  return spamPatterns.some(pattern => pattern.test(text));
};

// Content validation with stricter rules
const validateContent = (
  text: string,
  name?: string
): { isValid: boolean; error?: string } => {
  if (!text?.trim()) {
    return { isValid: false, error: 'Please enter your thoughts' };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < 5) {
    return { isValid: false, error: 'Message too short (min 5 characters)' };
  }

  if (text.length > 500) {
    return { isValid: false, error: 'Message too long (max 500 characters)' };
  }

  // Check for spam content
  if (isSpamContent(trimmedText)) {
    return {
      isValid: false,
      error: 'Please write a genuine message without spam content.',
    };
  }

  // Check word count (minimum meaningful content)
  const wordCount = trimmedText
    .split(/\s+/)
    .filter(word => word.length > 0).length;
  if (wordCount < 2) {
    return { isValid: false, error: 'Please write at least 2 words.' };
  }

  // Name validation if provided
  if (name) {
    const trimmedName = name.trim();
    if (trimmedName.length > 50) {
      return { isValid: false, error: 'Name too long (max 50 characters)' };
    }

    if (isSpamContent(trimmedName)) {
      return { isValid: false, error: 'Please enter a valid name.' };
    }
  }

  return { isValid: true };
};

// Enhanced submit function with multiple layers of protection
export const submitSentiment = async (
  sentimentText: string,
  contributorName?: string
): Promise<{ success: boolean; error?: string; data?: unknown }> => {
  try {
    // Client-side validation
    const validation = validateContent(sentimentText, contributorName);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const userIdentifier = await getUserIdentifier();
    const cleanText = sentimentText.trim();
    const cleanName = contributorName?.trim() || null;

    // First, check recent submissions by this user (client-side check)
    const { data: recentSubmissions, error: checkError } = await supabase
      .from('community_sentiment')
      .select('created_at')
      .eq('user_ip_hash', userIdentifier)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order('created_at', { ascending: false });

    if (checkError) {
      console.error('Error checking recent submissions:', checkError);
      return { success: false, error: 'Unable to verify submission limits.' };
    }

    // Rate limiting: max 3 submissions per hour
    if (recentSubmissions && recentSubmissions.length >= 3) {
      return {
        success: false,
        error: 'Rate limit exceeded. Maximum 3 submissions per hour.',
      };
    }

    // Check for recent identical content (prevents duplicate spam)
    const { data: duplicateCheck, error: dupError } = await supabase
      .from('community_sentiment')
      .select('id')
      .eq('sentiment_text', cleanText)
      .eq('user_ip_hash', userIdentifier)
      .gte(
        'created_at',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      ) // Last 24 hours
      .limit(1);

    if (dupError) {
      console.error('Error checking duplicates:', dupError);
      return { success: false, error: 'Unable to verify content uniqueness.' };
    }

    if (duplicateCheck && duplicateCheck.length > 0) {
      return {
        success: false,
        error: 'You have already submitted this exact message recently.',
      };
    }

    // Submit to database with additional metadata
    const { data, error } = await supabase
      .from('community_sentiment')
      .insert({
        contributor_name: cleanName,
        user_ip_hash: userIdentifier,
        project_name: 'Magic Newton',
        sentiment_text: cleanText,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);

      // Handle specific error types
      if (
        error.message?.includes('Rate limit') ||
        error.code === '23505' ||
        error.message?.includes('duplicate') ||
        error.message?.includes('constraint')
      ) {
        return {
          success: false,
          error:
            'Please wait before submitting again. Maximum 3 submissions per hour.',
        };
      }

      throw error;
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Error submitting sentiment:', error);
    return {
      success: false,
      error: 'Unable to submit right now. Please try again later.',
    };
  }
};

// Additional function to check if user can submit (for UI feedback)
export const canUserSubmit = async (): Promise<{
  canSubmit: boolean;
  remainingSubmissions: number;
  nextSubmissionTime?: Date;
}> => {
  try {
    const userIdentifier = await getUserIdentifier();

    const { data: recentSubmissions, error } = await supabase
      .from('community_sentiment')
      .select('created_at')
      .eq('user_ip_hash', userIdentifier)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking submission status:', error);
      return { canSubmit: true, remainingSubmissions: 3 }; // Default to allowing
    }

    const submissionCount = recentSubmissions?.length || 0;
    const remainingSubmissions = Math.max(0, 3 - submissionCount);

    let nextSubmissionTime: Date | undefined;
    if (
      remainingSubmissions === 0 &&
      recentSubmissions &&
      recentSubmissions.length > 0
    ) {
      // Calculate when the oldest submission will be 1 hour old
      const oldestSubmission = new Date(
        recentSubmissions[recentSubmissions.length - 1].created_at
      );
      nextSubmissionTime = new Date(
        oldestSubmission.getTime() + 60 * 60 * 1000
      );
    }

    return {
      canSubmit: remainingSubmissions > 0,
      remainingSubmissions,
      nextSubmissionTime,
    };
  } catch (error) {
    console.error('Error checking user submission status:', error);
    return { canSubmit: true, remainingSubmissions: 3 };
  }
};

// Sanitize data for real-time subscriptions
const sanitizePayload = (payload: SentimentPayload): SentimentPayload => {
  if (!payload?.new) return payload;

  return {
    ...payload,
    new: {
      ...payload.new,
      sentiment_text: payload.new.sentiment_text?.replace(/<[^>]*>/g, ''),
      contributor_name:
        payload.new.contributor_name?.replace(/<[^>]*>/g, '') || null,
    },
  };
};

// Get all sentiments with sanitization
export const getAllSentiments = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('community_sentiment')
      .select('sentiment_text')
      .eq('project_name', 'Magic Newton')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return (
      data
        ?.map(item => item.sentiment_text?.replace(/<[^>]*>/g, '') || '')
        .filter(text => text.length > 0) || []
    );
  } catch (error) {
    console.error('Error fetching sentiments:', error);
    return [];
  }
};

// Enhanced real-time subscription with sanitization
export const subscribeToSentiments = (
  callback: (sentiment: SentimentPayload) => void
) => {
  return supabase
    .channel('community_sentiment_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_sentiment',
        filter: 'project_name=eq.Magic Newton',
      },
      (payload: RealtimePostgresInsertPayload<SentimentEntry>) => {
        const sentimentPayload: SentimentPayload = {
          new: payload.new,
          old: null,
          eventType: 'INSERT',
        };

        // Sanitize before sending to callback
        const sanitized = sanitizePayload(sentimentPayload);
        callback(sanitized);
      }
    )
    .subscribe();
};

// Keep existing functions unchanged
export const getFullSentiments = async (): Promise<SentimentEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('community_sentiment')
      .select('*')
      .eq('project_name', 'Magic Newton')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching full sentiments:', error);
    return [];
  }
};

export const getCommunityInsights = async (
  projectName: string
): Promise<CommunityInsights | null> => {
  try {
    const { data, error } = await supabase
      .from('community_insights')
      .select('*')
      .eq('project_name', projectName)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching insights:', error);
    return null;
  }
};
