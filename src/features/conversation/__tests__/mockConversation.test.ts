import { createMockConversation, MOCK_AI_REPLY } from '../mockConversation';
import type { AiMessage } from '../conversation.types';

// The PRD's mock payload, verbatim. The mock may only add fields to it.
const PRD_PAYLOAD = [
  {
    id: '1',
    type: 'system',
    text: 'Your session with AI Astrologer has started.',
  },
  {
    id: '2',
    type: 'user',
    text: 'Can you tell me about my career this year?',
  },
  {
    id: '3',
    type: 'ai',
    text: 'I can already see a strong Saturn influence in your chart. Based on this, here are a few recommendations that may help you.',
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
    ],
  },
  {
    id: '4',
    type: 'human',
    text: 'I also recommend focusing on your upcoming Jupiter transit.',
  },
];

const NOW = new Date(2026, 9, 1, 15, 30); // 1 Oct 2026, 15:30 local

const dayOf = (iso: string) => new Date(iso).toDateString();

describe('createMockConversation', () => {
  it('R1.7: keeps every PRD field and value unchanged', () => {
    const messages = createMockConversation(NOW);
    expect(messages).toHaveLength(PRD_PAYLOAD.length);
    messages.forEach((message, i) => {
      const { recommendations: prdRecs, ...prdFields } = PRD_PAYLOAD[i];
      expect(message).toMatchObject(prdFields);
      if (prdRecs) {
        // PRD cards come first, unchanged; extra cards (R3.8) may follow.
        const recs = message.type === 'ai' ? message.recommendations : [];
        expect(recs?.slice(0, prdRecs.length)).toEqual(prdRecs);
      }
    });
  });

  it('R1.7: adds an ISO createdAt in chronological order', () => {
    const times = createMockConversation(NOW).map(m => {
      expect(new Date(m.createdAt).toISOString()).toBe(m.createdAt);
      return Date.parse(m.createdAt);
    });
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(Math.max(...times)).toBeLessThanOrEqual(NOW.getTime());
  });

  it('R1.7: adds no fields beyond createdAt', () => {
    createMockConversation(NOW).forEach((message, i) => {
      const allowed = [...Object.keys(PRD_PAYLOAD[i]), 'createdAt'];
      expect(Object.keys(message).every(k => allowed.includes(k))).toBe(true);
    });
  });

  it.each([
    ['an ordinary day', NOW],
    ['the US fall-back DST day', new Date(2026, 10, 1, 23, 30)],
    ['the day after US spring-forward', new Date(2026, 2, 9, 0, 30)],
  ])(
    'R1.7: dates the first message on the previous calendar day (%s)',
    (_label, now) => {
      const messages = createMockConversation(now);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      expect(dayOf(messages[0].createdAt)).toBe(yesterday.toDateString());
      expect(dayOf(messages[messages.length - 1].createdAt)).toBe(
        now.toDateString(),
      );
    },
  );

  it('R1.7: keeps the latest messages on today just after midnight', () => {
    const justAfterMidnight = new Date(2026, 9, 1, 0, 1);
    const messages = createMockConversation(justAfterMidnight);
    const times = messages.map(m => Date.parse(m.createdAt));
    expect(new Set(times).size).toBe(times.length); // still strictly ordered
    expect(dayOf(messages[messages.length - 1].createdAt)).toBe(
      justAfterMidnight.toDateString(),
    );
    expect(dayOf(messages[0].createdAt)).not.toBe(
      justAfterMidnight.toDateString(),
    );
  });

  it('R3.8: includes a promotion recommendation', () => {
    const ai = createMockConversation(NOW).find(
      (m): m is AiMessage => m.type === 'ai',
    );
    expect(ai?.recommendations?.some(r => r.type === 'promotion')).toBe(true);
  });

  it('R1.8: reuses recommendation ids across messages', () => {
    const ai = createMockConversation(NOW).find(
      (m): m is AiMessage => m.type === 'ai',
    );
    const initialIds = ai?.recommendations?.map(r => r.id) ?? [];
    const replyIds = MOCK_AI_REPLY.recommendations.map(r => r.id);
    expect(replyIds.some(id => initialIds.includes(id))).toBe(true);
  });
});

describe('MOCK_AI_REPLY', () => {
  it("R9.1: is the PRD's example response with its four recommendations", () => {
    expect(MOCK_AI_REPLY.text).toBe(
      'Saturn currently has a strong influence on your career growth.',
    );
    expect(MOCK_AI_REPLY.recommendations.map(r => [r.type, r.title])).toEqual([
      ['tarot', 'Career Tarot Reading'],
      ['gemstone', 'Blue Sapphire'],
      ['remedy', 'Saturday Remedy'],
      ['consultation', 'Talk to an Astrologer'],
    ]);
  });
});
