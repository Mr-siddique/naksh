import type { Message, TimelineItem } from '../conversation.types';
import { formatDateLabel } from './formatDateLabel';

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `date-${date.getFullYear()}-${month}-${day}`;
}

function latestUserIdIfSent(messages: Message[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.type === 'user') {
      return message.status === 'sent' ? message.id : undefined;
    }
  }
  return undefined;
}

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
