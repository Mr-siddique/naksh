import React from 'react';
import { StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import type { AiMessage } from '../../conversation.types';
import { useConversationStore } from '../../store/useConversationStore';
import { findPressable } from '../../../../testUtils';
import { FeedbackBar } from '../FeedbackBar';

jest.mock('../../../../services/chatApi');

const CHIPS = ['Inaccurate', 'Too Generic', "Didn't Help", 'Too Long'];

const BASE: AiMessage = {
  id: 'a1',
  type: 'ai',
  text: 'Saturn is strong.',
  createdAt: '2026-10-01T09:00:00.000Z',
};

function Harness() {
  const message = useConversationStore(s => s.messages[0] as AiMessage);
  return <FeedbackBar messageId={message.id} feedback={message.feedback} />;
}

let tree: ReactTestRenderer.ReactTestRenderer;

const current = () => useConversationStore.getState().messages[0] as AiMessage;

function press(label: string) {
  ReactTestRenderer.act(() => findPressable(tree.root, label).props.onPress());
}

const chipsExpanded = () =>
  tree.root.findByProps({ testID: 'feedback-chips' }).props
    .accessibilityElementsHidden === false;

const isSelected = (label: string) =>
  findPressable(tree.root, label).props.accessibilityState?.selected === true;

beforeEach(() => {
  useConversationStore.getState().reset();
  useConversationStore.setState({ loadState: 'ready', messages: [BASE] });
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<Harness />);
  });
});

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
});

describe('FeedbackBar', () => {
  it('R5.1: shows 👍 and 👎 with the chips collapsed', () => {
    findPressable(tree.root, 'Like');
    findPressable(tree.root, 'Dislike');
    expect(chipsExpanded()).toBe(false);
  });

  it('R5.2: 👍 toggles the like on and off', () => {
    press('Like');
    expect(isSelected('Like')).toBe(true);
    press('Like');
    expect(isSelected('Like')).toBe(false);
  });

  it('R5.3: 👎 selects dislike and expands the four chips', () => {
    press('Dislike');
    expect(isSelected('Dislike')).toBe(true);
    expect(chipsExpanded()).toBe(true);
    for (const label of CHIPS) {
      findPressable(tree.root, label);
    }
  });

  it('R5.4: several chips can be selected and toggled', () => {
    press('Dislike');
    press('Too Long');
    press('Inaccurate');
    expect(isSelected('Too Long')).toBe(true);
    expect(isSelected('Inaccurate')).toBe(true);
    press('Too Long');
    expect(isSelected('Too Long')).toBe(false);
  });

  it('R5.5: switching to 👍 collapses the chips and clears the reasons', () => {
    press('Dislike');
    press('Too Long');
    press('Like');
    expect(chipsExpanded()).toBe(false);
    expect(current().feedback).toEqual({ rating: 'like', reasons: [] });
  });

  it('R5.6: 👎 again clears the rating and collapses the chips', () => {
    press('Dislike');
    press("Didn't Help");
    press('Dislike');
    expect(chipsExpanded()).toBe(false);
    expect(current().feedback).toBeUndefined();
  });

  it('NFR4: collapsed chips are hidden from screen readers and touches', () => {
    const chips = tree.root.findByProps({ testID: 'feedback-chips' });
    expect(chips.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(chips.props.pointerEvents).toBe('none');
  });

  it('NFR4: buttons expose their selected state and are 44pt targets', () => {
    press('Dislike');
    expect(findPressable(tree.root, 'Like').props.accessibilityState).toEqual({
      selected: false,
    });
    expect(
      findPressable(tree.root, 'Dislike').props.accessibilityState,
    ).toEqual({ selected: true });
    const like = StyleSheet.flatten(
      findPressable(tree.root, 'Like').props.style,
    );
    expect(like.width).toBeGreaterThanOrEqual(44);
    const chip = StyleSheet.flatten(
      findPressable(tree.root, 'Too Long').props.style,
    );
    expect(chip.minHeight).toBeGreaterThanOrEqual(44);
  });
});
