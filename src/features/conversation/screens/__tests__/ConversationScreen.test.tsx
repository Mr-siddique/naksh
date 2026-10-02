import React from 'react';
import { HeaderHeightContext } from '@react-navigation/elements';
import { FlatList, StyleSheet } from 'react-native';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import {
  fetchConversation,
  sendMessage as sendToApi,
} from '../../../../services/chatApi';
import type { Message } from '../../conversation.types';
import { useConversationStore } from '../../store/useConversationStore';
import { Composer } from '../../components/Composer';
import { TimelineList } from '../../components/TimelineList';
import { ConversationScreen } from '../ConversationScreen';
import { deferred, findPressable, isHost } from '../../../../testUtils';

jest.mock('../../../../services/chatApi');
const mockFetch = jest.mocked(fetchConversation);

const MESSAGES: Message[] = [
  {
    id: '1',
    type: 'system',
    text: 'Started',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
];

function nextFetch() {
  const call = deferred<Message[]>();
  mockFetch.mockReturnValueOnce(call.promise);
  return call;
}

let tree: ReactTestRenderer.ReactTestRenderer;

async function renderScreen() {
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HeaderHeightContext.Provider value={0}>
        <ConversationScreen />
      </HeaderHeightContext.Provider>,
    );
  });
}

/** Runs an action and flushes the resulting async store updates. */
async function settle(action: () => void) {
  await ReactTestRenderer.act(async () => {
    action();
  });
}

const hasText = (text: string) =>
  tree.root.findAll(
    (node: ReactTestInstance) =>
      typeof node.type === 'string' && node.props.children === text,
  ).length > 0;

/** The Retry Pressable (composite: owns onPress). */
const retryButton = () =>
  tree.root.find(
    (node: ReactTestInstance) =>
      node.props.accessibilityLabel === 'Retry' &&
      typeof node.props.onPress === 'function',
  );

/** The native view Retry renders (owns the resolved style). */
const retryHostView = () =>
  tree.root.find(
    (node: ReactTestInstance) =>
      typeof node.type === 'string' &&
      node.props.accessibilityLabel === 'Retry',
  );

const WITH_AI_REPLY: Message[] = [
  { id: 'u1', type: 'user', text: 'Hi', createdAt: '2026-10-01T09:00:00.000Z' },
  {
    id: 'a1',
    type: 'ai',
    text: 'Saturn is strong.',
    createdAt: '2026-10-01T09:01:00.000Z',
    recommendations: [{ id: '1', type: 'gemstone', title: 'Blue Sapphire' }],
  },
];

async function longPressAi() {
  const bubble = tree.root.find(
    (node: ReactTestInstance) =>
      node.props.accessibilityLabel === 'AI Astrologer: Saturn is strong.' &&
      typeof node.props.onLongPress === 'function',
  );
  await ReactTestRenderer.act(() => {
    bubble.props.onLongPress();
  });
}

async function typeAndSend(text: string) {
  const input = tree.root.find((node: ReactTestInstance) =>
    isHost(node, 'TextInput'),
  );
  await ReactTestRenderer.act(() => input.props.onChangeText(text));
  await ReactTestRenderer.act(() => {
    findPressable(tree.root, 'Send').props.onPress();
  });
}

const hasComposer = () => tree.root.findAllByType(Composer).length > 0;

beforeEach(() => {
  mockFetch.mockReset();
  jest.mocked(sendToApi).mockReturnValue(new Promise(() => {}));
  useConversationStore.getState().reset();
});

afterEach(async () => {
  await ReactTestRenderer.act(() => tree?.unmount());
});

describe('ConversationScreen', () => {
  it('R1.1: requests the conversation on mount and shows the loading state', async () => {
    nextFetch();
    await renderScreen();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(hasText('Loading conversation...')).toBe(true);
  });

  it('R1.2: renders the timeline once messages arrive', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.resolve(MESSAGES));

    expect(hasText('Loading conversation...')).toBe(false);
    tree.root.findByType(TimelineList);
  });

  it('R1.3: shows the empty state for a conversation with no messages', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.resolve([]));

    expect(hasText('Start your conversation.')).toBe(true);
  });

  it('R1.4: shows the error state with a Retry button when loading fails', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.reject(new Error('offline')));

    expect(hasText('Unable to load conversation.')).toBe(true);
    expect(hasText('Retry')).toBe(true);
  });

  it('R1.5: Retry shows loading again and repeats the request', async () => {
    const failed = nextFetch();
    await renderScreen();
    await settle(() => failed.reject(new Error('offline')));

    const retry = nextFetch();
    await ReactTestRenderer.act(() => {
      retryButton().props.onPress(); // block body: act() must not await the still-pending load()
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(hasText('Loading conversation...')).toBe(true);

    await settle(() => retry.resolve(MESSAGES));
    tree.root.findByType(TimelineList);
  });

  it('R1.1: starts a fresh load every time the screen opens', async () => {
    const first = nextFetch();
    await renderScreen();
    await settle(() => first.resolve(MESSAGES));
    await ReactTestRenderer.act(() => tree.unmount());
    // Closing the screen resets the store.
    expect(useConversationStore.getState().messages).toEqual([]);

    nextFetch();
    await renderScreen();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(hasText('Loading conversation...')).toBe(true);
  });

  it('NFR4: Retry is an accessible button with a 44pt touch target', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.reject(new Error('offline')));

    const view = retryHostView();
    expect(view.props.accessibilityRole).toBe('button');
    expect(
      StyleSheet.flatten(view.props.style).minHeight,
    ).toBeGreaterThanOrEqual(44);
  });

  it('R1.3: keeps the composer available in the empty state', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.resolve([]));

    expect(hasText('Start your conversation.')).toBe(true);
    expect(hasComposer()).toBe(true);
    const input = tree.root.find((node: ReactTestInstance) =>
      isHost(node, 'TextInput'),
    );
    expect(input.props.editable).not.toBe(false);
  });

  it('R1.4: hides the composer when loading fails', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.reject(new Error('offline')));

    expect(hasComposer()).toBe(false);
  });

  it('R1.1: hides the composer while the conversation is loading', async () => {
    nextFetch();
    await renderScreen();
    expect(hasComposer()).toBe(false);
  });

  it('R1.6: sending from the empty state replaces it with the timeline', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.resolve([]));

    await typeAndSend('Hello');

    expect(hasText('Start your conversation.')).toBe(false);
    tree.root.findByType(TimelineList);
    expect(hasText('Hello')).toBe(true);
  });

  it('R2.5: scrolls to the latest message after a send', async () => {
    const scroll = jest
      .spyOn(FlatList.prototype, 'scrollToOffset')
      .mockImplementation(() => {});
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.resolve(MESSAGES));

    await typeAndSend('Hello');
    expect(scroll).toHaveBeenCalledWith({ offset: 0, animated: true });
    scroll.mockRestore();
  });

  it('R4.1: long-pressing an AI message opens Reply, Copy, Delete and Cancel', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.resolve(WITH_AI_REPLY));

    await longPressAi();
    for (const label of ['Reply', 'Copy', 'Delete', 'Cancel']) {
      findPressable(tree.root, label);
    }
  });

  it('R4.3: Copy shows the "Copied" toast', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.resolve(WITH_AI_REPLY));

    await longPressAi();
    await ReactTestRenderer.act(() => {
      findPressable(tree.root, 'Copy').props.onPress();
    });
    expect(hasText('Copied')).toBe(true);
  });

  it('R4.4: Delete removes the message and its cards from the timeline', async () => {
    const request = nextFetch();
    await renderScreen();
    await settle(() => request.resolve(WITH_AI_REPLY));
    expect(hasText('Blue Sapphire')).toBe(true);

    await longPressAi();
    await ReactTestRenderer.act(() => {
      findPressable(tree.root, 'Delete').props.onPress();
    });
    expect(hasText('Saturn is strong.')).toBe(false);
    expect(hasText('Blue Sapphire')).toBe(false);
    expect(hasText('Hi')).toBe(true);
  });
});
