import type { Message, Recommendation } from './conversation.types';

const MINUTE = 60 * 1000;

function sameTimeYesterday(now: Date): string {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString();
}

function earlierToday(now: Date, minutes: number): string {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const clamped = startOfToday.getTime() + (60 - minutes);
  return new Date(
    Math.max(clamped, now.getTime() - minutes * MINUTE),
  ).toISOString();
}

export function createMockConversation(now: Date = new Date()): Message[] {
  return [
    {
      id: '1',
      type: 'system',
      text: 'Your session with AI Astrologer has started.',
      createdAt: sameTimeYesterday(now),
    },
    {
      id: '2',
      type: 'user',
      text: 'Can you tell me about my career this year?',
      createdAt: earlierToday(now, 3),
    },
    {
      id: '3',
      type: 'ai',
      text: 'I can already see a strong Saturn influence in your chart. Based on this, here are a few recommendations that may help you.',
      createdAt: earlierToday(now, 2),
      recommendations: [
        {
          id: '1',
          type: 'gemstone',
          title: 'Blue Sapphire',
          subtitle: 'Recommended for Saturn',
        },
        { id: '2', type: 'tarot', title: 'Career Tarot Reading' },
        { id: '3', type: 'consultation', title: 'Talk to an Astrologer' },
        { id: '4', type: 'article', title: 'Understanding Saturn Mahadasha' },
        {
          id: '5',
          type: 'promotion',
          title: '50% off your first consultation',
          subtitle: 'Limited-time offer',
        },
      ],
    },
    {
      id: '4',
      type: 'human',
      text: 'I also recommend focusing on your upcoming Jupiter transit.',
      createdAt: earlierToday(now, 1),
    },
  ];
}

export const MOCK_AI_REPLY: Readonly<{
  text: string;
  recommendations: readonly Recommendation[];
}> = Object.freeze({
  text: 'Saturn currently has a strong influence on your career growth.',
  recommendations: [
    { id: '1', type: 'tarot', title: 'Career Tarot Reading' },
    { id: '2', type: 'gemstone', title: 'Blue Sapphire' },
    { id: '3', type: 'remedy', title: 'Saturday Remedy' },
    { id: '4', type: 'consultation', title: 'Talk to an Astrologer' },
  ],
});
