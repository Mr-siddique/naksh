import type {
  Message,
  SendStatus,
  TimelineItem,
  UserMessage,
} from '../../conversation.types';
import { buildTimeline } from '../buildTimeline';

const NOW = new Date(2026, 9, 1, 15, 30); // Thu 1 Oct 2026, 15:30

/** Day of October 2026; 0 is 30 Sep and -2 is 28 Sep. */
const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 9, day, hour, minute).toISOString();

function msg(
  id: string,
  type: Exclude<Message['type'], 'user'>,
  createdAt: string,
): Message {
  return { id, type, text: `text ${id}`, createdAt };
}

function userMsg(
  id: string,
  createdAt: string,
  status?: SendStatus,
): UserMessage {
  return { id, type: 'user', text: `text ${id}`, createdAt, status };
}

/** Timeline in reading order (oldest first) as compact strings. */
function readingOrder(items: TimelineItem[]): string[] {
  return [...items].reverse().map(item => {
    if (item.kind === 'date') {
      return `[${item.label}]`;
    }
    const flags = [
      item.isGrouped && '(grouped)',
      item.showSentStatus && '(sent)',
    ].filter(Boolean);
    return [item.message.id, ...flags].join(' ');
  });
}

const messageItem = (items: TimelineItem[], id: string) => {
  const item = items.find(i => i.kind === 'message' && i.message.id === id);
  if (item?.kind !== 'message') {
    throw new Error(`no item for ${id}`);
  }
  return item;
};

describe('buildTimeline', () => {
  it('R2.1: returns an empty timeline for no messages', () => {
    expect(buildTimeline([], NOW)).toEqual([]);
  });

  it('R2.1: orders items newest first for the inverted list', () => {
    const items = buildTimeline(
      [userMsg('a', at(1, 9)), msg('b', 'ai', at(1, 10))],
      NOW,
    );
    expect(items.map(i => i.key)).toEqual(['b', 'a', 'date-2026-10-01']);
  });

  it('R2.3: inserts a separator above the first message of each day', () => {
    const items = buildTimeline(
      [
        msg('1', 'system', at(-2, 9)),
        userMsg('2', at(0, 9)),
        msg('3', 'ai', at(1, 9)),
        msg('4', 'human', at(1, 10)),
      ],
      NOW,
    );
    expect(readingOrder(items)).toEqual([
      '[28 Sep 2026]',
      '1',
      '[Yesterday]',
      '2',
      '[Today]',
      '3',
      '4',
    ]);
  });

  it('R2.4: groups consecutive messages from the same sender on the same day', () => {
    const items = buildTimeline(
      [
        msg('1', 'ai', at(1, 9)),
        msg('2', 'ai', at(1, 9, 1)),
        userMsg('3', at(1, 9, 2)),
        userMsg('4', at(1, 9, 3)),
        msg('5', 'human', at(1, 9, 4)),
        msg('6', 'ai', at(1, 9, 5)),
      ],
      NOW,
    );
    expect(readingOrder(items)).toEqual([
      '[Today]',
      '1',
      '2 (grouped)',
      '3',
      '4 (grouped)',
      '5',
      '6',
    ]);
  });

  it('R2.4: never groups system messages or messages after them', () => {
    const items = buildTimeline(
      [
        msg('1', 'system', at(1, 9)),
        msg('2', 'system', at(1, 9, 1)),
        msg('3', 'ai', at(1, 9, 2)),
      ],
      NOW,
    );
    expect(readingOrder(items)).toEqual(['[Today]', '1', '2', '3']);
  });

  it('R2.4: a system message breaks a group of the same sender', () => {
    const items = buildTimeline(
      [
        msg('a', 'ai', at(1, 9)),
        msg('s', 'system', at(1, 9, 1)),
        msg('b', 'ai', at(1, 9, 2)),
      ],
      NOW,
    );
    expect(readingOrder(items)).toEqual(['[Today]', 'a', 's', 'b']);
  });

  it('R2.4: does not group the same sender across days', () => {
    const items = buildTimeline(
      [msg('1', 'ai', at(0, 23)), msg('2', 'ai', at(1, 8))],
      NOW,
    );
    expect(readingOrder(items)).toEqual(['[Yesterday]', '1', '[Today]', '2']);
  });

  it('R4.6: recomputes separators and grouping after a deletion', () => {
    const messages = [
      msg('1', 'ai', at(0, 9)),
      userMsg('2', at(1, 9)),
      msg('3', 'ai', at(1, 10)),
      msg('4', 'ai', at(1, 11)),
    ];
    const afterDelete = (id: string) =>
      readingOrder(
        buildTimeline(
          messages.filter(m => m.id !== id),
          NOW,
        ),
      );

    // Deleting the only message of a day removes its separator.
    expect(afterDelete('1')).toEqual(['[Today]', '2', '3', '4 (grouped)']);
    // Deleting a group's first message promotes the next one to lead it.
    expect(afterDelete('3')).toEqual(['[Yesterday]', '1', '[Today]', '2', '4']);
    // Deleting the message between two AI messages joins them into a group.
    expect(afterDelete('2')).toEqual([
      '[Yesterday]',
      '1',
      '[Today]',
      '3',
      '4 (grouped)',
    ]);
  });

  it('R6.7: shows "Sent" only on the latest user message', () => {
    const items = buildTimeline(
      [
        userMsg('1', at(1, 9), 'sent'),
        msg('2', 'ai', at(1, 9, 1)),
        userMsg('3', at(1, 9, 2), 'sent'),
        msg('4', 'ai', at(1, 9, 3)),
      ],
      NOW,
    );
    expect(messageItem(items, '1').showSentStatus).toBe(false);
    expect(messageItem(items, '3').showSentStatus).toBe(true);
  });

  it.each(['sending', 'failed', undefined] as const)(
    'R6.7: shows no "Sent" while the latest user message is %s',
    status => {
      const items = buildTimeline(
        [userMsg('1', at(1, 9), 'sent'), userMsg('2', at(1, 9, 1), status)],
        NOW,
      );
      expect(messageItem(items, '1').showSentStatus).toBe(false);
      expect(messageItem(items, '2').showSentStatus).toBe(false);
    },
  );

  it('NFR1: passes message objects through by reference', () => {
    const message = msg('1', 'ai', at(1, 9));
    expect(messageItem(buildTimeline([message], NOW), '1').message).toBe(
      message,
    );
  });
});
