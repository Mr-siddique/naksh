import React from 'react';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import { sendMessage as sendToApi } from '../../../../services/chatApi';
import type { Message } from '../../conversation.types';
import { useConversationStore } from '../../store/useConversationStore';
import { Composer } from '../Composer';
import { isHost } from '../../../../testUtils';

jest.mock('../../../../services/chatApi');
const mockSend = jest.mocked(sendToApi);

let tree: ReactTestRenderer.ReactTestRenderer;
const onSent = jest.fn();

function render() {
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<Composer onSent={onSent} />);
  });
}

const input = () =>
  tree.root.find((node: ReactTestInstance) => isHost(node, 'TextInput'));

const sendButton = () =>
  tree.root.find(
    (node: ReactTestInstance) =>
      node.props.accessibilityLabel === 'Send' &&
      typeof node.props.onPress === 'function',
  );

const type = (text: string) =>
  ReactTestRenderer.act(() => input().props.onChangeText(text));

const isSendDisabled = () => sendButton().props.disabled === true;

beforeEach(() => {
  mockSend.mockReset();
  mockSend.mockReturnValue(new Promise(() => {}));
  onSent.mockReset();
  useConversationStore.getState().reset();
  useConversationStore.setState({ loadState: 'ready', messages: [] });
});

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
});

describe('Composer', () => {
  it('R6.1: renders a multiline text input with a Send button', () => {
    render();
    expect(input().props.multiline).toBe(true);
    expect(sendButton()).toBeDefined();
  });

  it('R6.2: disables Send while the input is empty or whitespace', () => {
    render();
    expect(isSendDisabled()).toBe(true);
    type('   \n ');
    expect(isSendDisabled()).toBe(true);
    type('Hello');
    expect(isSendDisabled()).toBe(false);
  });

  it('R6.2: disables Send while a message is sending, but keeps typing enabled', () => {
    const sending: Message = {
      id: 'local-1',
      type: 'user',
      text: 'Hi',
      createdAt: '2026-10-01T09:00:00.000Z',
      status: 'sending',
    };
    useConversationStore.setState({ messages: [sending] });
    render();
    type('Next question');

    expect(isSendDisabled()).toBe(true);
    expect(input().props.editable).not.toBe(false);
  });

  it('R6.3: sends the text, clears the input and reports the send', () => {
    render();
    type('Will I get promoted?');
    ReactTestRenderer.act(() => sendButton().props.onPress());

    expect(mockSend).toHaveBeenCalledWith('Will I get promoted?');
    expect(input().props.value).toBe('');
    expect(onSent).toHaveBeenCalledTimes(1);
    expect(useConversationStore.getState().messages).toHaveLength(1);
  });

  it('NFR4: Send is an accessible button that exposes its disabled state', () => {
    render();
    const host = tree.root.find(
      (node: ReactTestInstance) =>
        typeof node.type === 'string' &&
        node.props.accessibilityLabel === 'Send',
    );
    expect(host.props.accessibilityRole).toBe('button');
    expect(host.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });
});
