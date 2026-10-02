import type { Message, Recommendation } from './conversation.types';

const MINUTE = 60 * 1000;

/** Same wall-clock time on the previous calendar day (DST-safe). */
function sameTimeYesterday(now: Date): string {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString();
}

/**
 * `now` minus `minutes`, clamped to today so these messages stay on today
 * just after midnight. Clamped times stay in order: fewer minutes ago is later.
 */
function earlierToday(now: Date, minutes: number): string {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const clamped = startOfToday.getTime() + (60 - minutes); // ms past midnight
  return new Date(
    Math.max(clamped, now.getTime() - minutes * MINUTE),
  ).toISOString();
}

/**
 * The PRD's mock payload, extended only with `createdAt` (R1.7) and one
 * promotion card (R3.8). The system message is dated yesterday so the
 * timeline shows two date separators.
 */
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

/**
 * The PRD's example AI response, streamed after every successful send (R9.1).
 * Frozen because every reply shares it; copy `recommendations` into a message.
 */
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
