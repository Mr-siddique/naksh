import React from 'react';
import { StyleSheet } from 'react-native';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import type { Message } from '../../conversation.types';
import { MessageRow } from '../MessageRow';

/** True for a host (native) element such as 'Text' or 'View'. */
const isHost = (node: ReactTestInstance, name: string) =>
  (node.type as unknown) === name;

const CREATED_AT = '2026-10-01T09:00:00.000Z';

const FIXTURES: Record<Message['type'], Message> = {
  user: { id: 'user', type: 'user', text: 'user text', createdAt: CREATED_AT },
  ai: { id: 'ai', type: 'ai', text: 'ai text', createdAt: CREATED_AT },
  human: {
    id: 'human',
    type: 'human',
    text: 'human text',
    createdAt: CREATED_AT,
  },
  system: {
    id: 'system',
    type: 'system',
    text: 'system text',
    createdAt: CREATED_AT,
  },
};

const make = (type: Message['type']): Message => FIXTURES[type];

function render(message: Message, isGrouped = false) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <MessageRow
        message={message}
        isGrouped={isGrouped}
        showSentStatus={false}
      />,
    );
  });
  return tree;
}

const hostTexts = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root
    .findAll(
      (node: ReactTestInstance) =>
        isHost(node, 'Text') && typeof node.props.children === 'string',
    )
    .map(node => node.props.children as string);

/** Style of the row's outer host view. */
const rowStyle = (tree: ReactTestRenderer.ReactTestRenderer) =>
  StyleSheet.flatten(
    tree.root.find(
      (node: ReactTestInstance) =>
        isHost(node, 'View') && node.props.testID === 'message-row',
    ).props.style,
  );

const bubbleStyle = (tree: ReactTestRenderer.ReactTestRenderer) =>
  StyleSheet.flatten(
    tree.root.find(
      (node: ReactTestInstance) =>
        isHost(node, 'View') && node.props.testID === 'message-bubble',
    ).props.style,
  );

describe('MessageRow', () => {
  it('R2.2: renders a user message right-aligned without a sender label', () => {
    const tree = render(make('user'));
    expect(hostTexts(tree)).toEqual(['user text']);
    expect(rowStyle(tree).alignItems).toBe('flex-end');
  });

  it('R2.2: renders an AI message left-aligned and labelled "AI Astrologer"', () => {
    const tree = render(make('ai'));
    expect(hostTexts(tree)).toEqual(['AI Astrologer', 'ai text']);
    expect(rowStyle(tree).alignItems).toBe('flex-start');
  });

  it('R2.2: renders an astrologer message left-aligned, labelled "Astrologer"', () => {
    const tree = render(make('human'));
    expect(hostTexts(tree)).toEqual(['Astrologer', 'human text']);
    expect(rowStyle(tree).alignItems).toBe('flex-start');
  });

  it('R2.2: styles astrologer bubbles distinctly from AI bubbles', () => {
    const ai = bubbleStyle(render(make('ai')));
    const human = bubbleStyle(render(make('human')));
    expect(human.backgroundColor).not.toBe(ai.backgroundColor);
    expect(ai.borderWidth).toBeGreaterThan(0);
    expect(human.borderWidth).toBeUndefined();
  });

  it('R2.2: renders a system event as centred text without a bubble', () => {
    const tree = render(make('system'));
    expect(hostTexts(tree)).toEqual(['system text']);
    expect(rowStyle(tree).alignItems).toBe('center');
    expect(
      tree.root.findAll(
        (node: ReactTestInstance) => node.props.testID === 'message-bubble',
      ),
    ).toHaveLength(0);
  });

  it('R2.4: a grouped message hides the sender label and sits closer', () => {
    const lead = render(make('ai'));
    const grouped = render(make('ai'), true);

    expect(hostTexts(grouped)).toEqual(['ai text']);
    expect(rowStyle(grouped).marginTop).toBeLessThan(
      rowStyle(lead).marginTop as number,
    );
  });

  it('NFR4: keeps the sender in the accessibility label when grouped', () => {
    const tree = render(make('ai'), true);
    const bubble = tree.root.find(
      (node: ReactTestInstance) =>
        isHost(node, 'View') && node.props.testID === 'message-bubble',
    );
    expect(bubble.props.accessibilityLabel).toBe('AI Astrologer: ai text');
  });
});
