import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Bubble } from '../Bubble';

const NOW = Date.parse('2026-10-02T10:00:00.000Z');

function renderBubble(createdAt: string, align: 'left' | 'right' = 'right') {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Bubble
        align={align}
        sender="You"
        backgroundColor="#fff"
        isGrouped={false}
        text="Hi"
        textColor="#000"
        createdAt={createdAt}
      />,
    );
  });
  return tree.root.findByProps({ testID: 'message-row' });
}

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Bubble motion', () => {
  it('R10.1: a freshly sent user bubble enters with a fade and slide', () => {
    const row = renderBubble(new Date(NOW - 100).toISOString());
    expect(row.props.entering).toBeDefined();
  });

  it('R10.2: a fresh AI bubble enters with a fade', () => {
    const row = renderBubble(new Date(NOW - 100).toISOString(), 'left');
    expect(row.props.entering).toBeDefined();
  });

  it('R10.8: a bubble from the initial load does not animate in', () => {
    const row = renderBubble('2026-10-01T09:00:00.000Z');
    expect(row.props.entering).toBeUndefined();
  });

  it('R10.8: a bubble that scrolls back into view does not animate in', () => {
    const row = renderBubble(new Date(NOW - 5000).toISOString(), 'left');
    expect(row.props.entering).toBeUndefined();
  });

  it('R10.3: the bubble has an exit animation for delete', () => {
    const row = renderBubble('2026-10-01T09:00:00.000Z');
    expect(row.props.exiting).toBeDefined();
  });

  it('R10.4: a long-pressable bubble scales on press-in and out', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Bubble
          align="left"
          sender="AI"
          backgroundColor="#fff"
          isGrouped={false}
          text="Hi"
          textColor="#000"
          createdAt="2026-10-01T09:00:00.000Z"
          onLongPress={jest.fn()}
        />,
      );
    });
    const bubble = tree.root.findAllByProps({ testID: 'message-bubble' })[0];
    expect(bubble.props.onPressIn).toBeInstanceOf(Function);
    expect(bubble.props.onPressOut).toBeInstanceOf(Function);
    ReactTestRenderer.act(() => {
      bubble.props.onPressIn();
      bubble.props.onPressOut();
    });
  });
});
