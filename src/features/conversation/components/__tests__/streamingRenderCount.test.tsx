import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type { AiMessage } from '../../conversation.types';
import { useConversationStore } from '../../store/useConversationStore';
import { AiMessage as AiMessageView } from '../AiMessage';

jest.mock('../../../../services/chatApi');

const mockBubbleRenders: string[] = [];
jest.mock('../Bubble', () => {
  const actual = jest.requireActual('../Bubble');
  return {
    Bubble: (props: { text: string }) => {
      mockBubbleRenders.push(props.text);
      return actual.Bubble(props);
    },
  };
});

const at = '2026-10-01T09:00:00.000Z';
const STREAMING: AiMessage = {
  id: 'ai-local-1',
  type: 'ai',
  text: 'Saturn currently has a strong influence on your career growth.',
  createdAt: at,
};
const SETTLED: AiMessage = {
  id: 'a1',
  type: 'ai',
  text: 'Earlier reply',
  createdAt: at,
};

const setVisible = (visibleLength: number) =>
  ReactTestRenderer.act(() => {
    useConversationStore.setState({
      streaming: { messageId: STREAMING.id, visibleLength },
    });
  });

let tree: ReactTestRenderer.ReactTestRenderer;

beforeEach(() => {
  jest.useFakeTimers();
  useConversationStore.getState().reset();
  useConversationStore.setState({
    loadState: 'ready',
    messages: [SETTLED, STREAMING],
  });
  setVisible(10);
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <>
        <AiMessageView message={SETTLED} isGrouped={false} />
        <AiMessageView message={STREAMING} isGrouped={false} />
      </>,
    );
  });
});

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
  jest.useRealTimers();
});

describe('streaming render scope', () => {
  it('NFR1: a streaming frame re-renders neither message, only the streaming text', () => {
    mockBubbleRenders.length = 0;
    setVisible(11);
    setVisible(12);
    expect(mockBubbleRenders).toEqual([]);

    const streamed = tree.root.findAll(
      node =>
        Array.isArray(node.props?.children) &&
        node.props.children[0] === STREAMING.text.slice(0, 12),
    );
    expect(streamed.length).toBeGreaterThan(0);
  });

  it('NFR1: only the streaming message re-renders when the stream ends', () => {
    mockBubbleRenders.length = 0;
    ReactTestRenderer.act(() => {
      useConversationStore.setState({ streaming: null });
    });
    expect(mockBubbleRenders).toEqual([STREAMING.text]);
  });
});
