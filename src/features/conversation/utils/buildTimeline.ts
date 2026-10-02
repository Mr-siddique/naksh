import type { Message, TimelineItem } from '../conversation.types';
import { formatDateLabel } from './formatDateLabel';

/** Local calendar day, e.g. "date-2026-10-01"; also the separator's key. */
function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `date-${date.getFullYear()}-${month}-${day}`;
}

/** Id of the latest user message, but only if it has been sent (R6.7). */
function latestUserIdIfSent(messages: Message[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.type === 'user') {
      return message.status === 'sent' ? message.id : undefined;
    }
  }
  return undefined;
}

/**
 * Turns messages into items for the inverted timeline: newest first, with a
 * date separator above each day's first message (R2.3), grouping flags
 * (R2.4) and the single "Sent" label (R6.7). Expects messages in
 * chronological order with valid ISO `createdAt`, as the store keeps them.
 * Message objects pass through by reference so memoized rows skip
 * re-rendering (NFR1).
 */
export function buildTimeline(messages: Message[], now: Date): TimelineItem[] {
  const items: TimelineItem[] = [];
  const sentUserId = latestUserIdIfSent(messages);
  let prevDayKey: string | undefined;
  let prevType: Message['type'] | undefined;

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const key = dayKey(date);
    const sameDay = key === prevDayKey;

    if (!sameDay) {
      items.push({ kind: 'date', key, label: formatDateLabel(date, now) });
    }
    items.push({
      kind: 'message',
      key: message.id,
      message,
      isGrouped:
        sameDay && message.type !== 'system' && message.type === prevType,
      showSentStatus: message.id === sentUserId,
    });
    prevDayKey = key;
    prevType = message.type;
  }

  return items.reverse();
}
