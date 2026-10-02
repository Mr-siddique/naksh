import React from 'react';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import type { AiMessage, Message } from '../../conversation.types';
import { useConversationStore } from '../../store/useConversationStore';
import { TimelineList } from '../TimelineList';

/** True for a host (native) element such as 'Text' or 'View'. */
const isHost = (node: ReactTestInstance, name: string) =>
  (node.type as unknown) === name;

// Count renders per message id by replacing the leaf message components.
const mockRendered: string[] = [];
jest.mock('../AiMessage', () => ({
  AiMessage: ({ message }: { message: { id: string } }) => {
    mockRendered.push(message.id);
    return null;
  },
}));
jest.mock('../UserMessage', () => ({
  UserMessage: ({ message }: { message: { id: string } }) => {
    mockRendered.push(message.id);
    return null;
  },
}));

const at = (minute: number) => new Date(2026, 9, 1, 9, minute).toISOString();

const MESSAGES: Message[] = [
  { id: 'u1', type: 'user', text: 'Hi', createdAt: at(0) },
  { id: 'a1', type: 'ai', text: 'Hello', createdAt: at(1) },
  { id: 'a2', type: 'ai', text: 'More', createdAt: at(2) },
];

let tree: ReactTestRenderer.ReactTestRenderer;

function renderList() {
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<TimelineList />);
  });
}

function setMessages(messages: Message[]) {
  ReactTestRenderer.act(() => {
    useConversationStore.setState({ messages });
  });
}

beforeEach(() => {
  // buildTimeline labels days relative to "now"; pin it to the fixtures' day.
  // advanceTimers keeps Reanimated/FlatList timers running in real time.
  jest.useFakeTimers({ now: new Date(2026, 9, 1, 15, 0), advanceTimers: true });
  mockRendered.length = 0;
  useConversationStore.getState().reset();
  useConversationStore.setState({ loadState: 'ready', messages: MESSAGES });
});

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
  jest.useRealTimers();
});

describe('TimelineList', () => {
  it('R2.1, R1.2: renders an inverted list so the latest message is at the bottom', () => {
    renderList();
    const list = tree.root.find(
      (node: ReactTestInstance) => node.props.inverted === true,
    );
    expect(list.props.inverted).toBe(true);
    expect(mockRendered).toEqual(['a2', 'a1', 'u1']);
  });

  it('R2.3: renders a date separator for the day', () => {
    renderList();
    const labels = tree.root
      .findAll(
        (node: ReactTestInstance) =>
          isHost(node, 'Text') && node.props.children === 'Today',
      )
      .map(node => node.props.children);
    expect(labels).toEqual(['Today']);
  });

  it('R4.5, R9.4: keeps the visible content anchored when items change', () => {
    renderList();
    const list = tree.root.find(
      (node: ReactTestInstance) => node.props.inverted === true,
    );
    expect(list.props.maintainVisibleContentPosition).toEqual({
      minIndexForVisible: 0,
      autoscrollToTopThreshold: 40,
    });
  });

  it('NFR1: updating one message re-renders only that row', () => {
    renderList();
    mockRendered.length = 0;

    const changed: AiMessage = {
      ...(MESSAGES[1] as AiMessage),
      feedback: { rating: 'like', reasons: [] },
    };
    setMessages([MESSAGES[0], changed, MESSAGES[2]]);

    expect(mockRendered).toEqual(['a1']);
  });
});
