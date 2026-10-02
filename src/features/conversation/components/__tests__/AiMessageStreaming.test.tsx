import React from 'react';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import type { AiMessage } from '../../conversation.types';
import { useConversationStore } from '../../store/useConversationStore';
import { isHost } from '../../../../testUtils';
import { AiMessage as AiMessageView } from '../AiMessage';
import { CURSOR_BLINK_MS } from '../StreamingText';

jest.mock('../../../../services/chatApi');

const REPLY: AiMessage = {
  id: 'ai-local-1',
  type: 'ai',
  text: 'Saturn currently has a strong influence on your career growth.',
  createdAt: '2026-10-01T09:00:00.000Z',
  recommendations: [{ id: '1', type: 'tarot', title: 'Career Tarot Reading' }],
};

let tree: ReactTestRenderer.ReactTestRenderer;

const setStreaming = (visibleLength: number | null) =>
  ReactTestRenderer.act(() => {
    useConversationStore.setState({
      streaming:
        visibleLength === null ? null : { messageId: REPLY.id, visibleLength },
    });
  });

const textNodes = () =>
  tree.root
    .findAll((node: ReactTestInstance) => isHost(node, 'Text'))
    .map(node =>
      ([] as unknown[])
        .concat(node.props.children)
        .filter(child => typeof child === 'string')
        .join(''),
    );

const hasLabel = (label: string) =>
  tree.root.findAll(
    (node: ReactTestInstance) => node.props.accessibilityLabel === label,
  ).length > 0;

const hasLongPress = () =>
  tree.root.findAll(
    (node: ReactTestInstance) =>
      node.props.testID === 'message-bubble' &&
      typeof node.props.onLongPress === 'function',
  ).length > 0;

const bubble = () =>
  tree.root.find(
    (node: ReactTestInstance) =>
      isHost(node, 'View') && node.props.testID === 'message-bubble',
  );

beforeEach(() => {
  jest.useFakeTimers();
  useConversationStore.getState().reset();
  useConversationStore.setState({ loadState: 'ready', messages: [REPLY] });
  setStreaming(10);
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <AiMessageView message={REPLY} isGrouped={false} />,
    );
  });
});

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
  jest.useRealTimers();
});

describe('AiMessage while streaming', () => {
  it('R9.1, R9.2: shows only the revealed part of the reply', () => {
    expect(textNodes()).toContain(REPLY.text.slice(0, 10));
    setStreaming(25);
    expect(textNodes()).toContain(REPLY.text.slice(0, 25));
  });

  it('R9.3: shows a blinking cursor while streaming', () => {
    const cursor = () =>
      tree.root.find(
        (node: ReactTestInstance) =>
          isHost(node, 'Text') && node.props.children === '▍',
      );
    const first = cursor().props.style;
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(CURSOR_BLINK_MS);
    });
    expect(cursor().props.style).not.toEqual(first);
  });

  it('R9.6: hides feedback and cards, and has no long-press, while streaming', () => {
    expect(hasLabel('Like')).toBe(false);
    expect(hasLabel('Tarot: Career Tarot Reading')).toBe(false);
    expect(hasLongPress()).toBe(false);
  });

  it('R9.5: when streaming ends the cursor goes and cards, feedback and long-press appear', () => {
    setStreaming(null);
    expect(textNodes()).toContain(REPLY.text);
    expect(textNodes()).not.toContain('▍');
    expect(hasLabel('Like')).toBe(true);
    expect(hasLabel('Tarot: Career Tarot Reading')).toBe(true);
    expect(hasLongPress()).toBe(true);
  });

  it('NFR4: screen readers get the full reply text', () => {
    expect(bubble().props.accessibilityLabel).toBe(
      `AI Astrologer: ${REPLY.text}`,
    );
  });

  it('R9.5, R10.8: cards fade in after a stream, but not for history rows', () => {
    const extras = () =>
      tree.root.find(
        (node: ReactTestInstance) =>
          'entering' in node.props &&
          node.props.testID !== 'message-row' &&
          node.props.style !== undefined,
      );
    setStreaming(null);
    expect(extras().props.entering).toBeDefined();

    ReactTestRenderer.act(() => tree.unmount());
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AiMessageView message={REPLY} isGrouped={false} />,
      );
    });
    expect(extras().props.entering).toBeUndefined();
  });
});
