import React from 'react';
import { StyleSheet } from 'react-native';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import { sendMessage as sendToApi } from '../../../../services/chatApi';
import type {
  SendStatus,
  UserMessage as UserMessageType,
} from '../../conversation.types';
import { useConversationStore } from '../../store/useConversationStore';
import { UserMessage } from '../UserMessage';
import { isHost } from '../../../../testUtils';

jest.mock('../../../../services/chatApi');
const mockSend = jest.mocked(sendToApi);

const message = (status?: SendStatus, id = 'local-1'): UserMessageType => ({
  id,
  type: 'user',
  text: 'Hi',
  createdAt: '2026-10-01T09:00:00.000Z',
  status,
});

let tree: ReactTestRenderer.ReactTestRenderer;

function render(msg: UserMessageType, showSentStatus = false) {
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <UserMessage
        message={msg}
        isGrouped={false}
        showSentStatus={showSentStatus}
      />,
    );
  });
}

const texts = () =>
  tree.root
    .findAll(
      (node: ReactTestInstance) =>
        isHost(node, 'Text') && typeof node.props.children === 'string',
    )
    .map(node => node.props.children as string);

const retryButton = () =>
  tree.root.find(
    (node: ReactTestInstance) =>
      node.props.accessibilityLabel === 'Retry sending' &&
      typeof node.props.onPress === 'function',
  );

beforeEach(() => {
  mockSend.mockReset();
  mockSend.mockReturnValue(new Promise(() => {}));
  useConversationStore.getState().reset();
});

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
});

describe('UserMessage status', () => {
  it('R6.3: shows "Sending…" while the message is sending', () => {
    render(message('sending'));
    expect(texts()).toContain('Sending…');
  });

  it('R6.5: shows "Failed" with a Retry action when the send failed', () => {
    render(message('failed'));
    expect(texts()).toEqual(expect.arrayContaining(['Failed', 'Retry']));
    expect(retryButton().props.disabled).toBe(false);
  });

  it('R6.6: Retry resends the failed message', () => {
    const failed = message('failed');
    useConversationStore.setState({ loadState: 'ready', messages: [failed] });
    render(failed);

    ReactTestRenderer.act(() => retryButton().props.onPress());
    expect(mockSend).toHaveBeenCalledWith('Hi');
  });

  it('R6.9: disables Retry while another message is sending', () => {
    const failed = message('failed');
    useConversationStore.setState({
      loadState: 'ready',
      messages: [failed, message('sending', 'local-2')],
    });
    render(failed);
    expect(retryButton().props.disabled).toBe(true);
  });

  it('R6.7: shows "Sent" only when asked to', () => {
    render(message('sent'), true);
    expect(texts()).toContain('Sent');
    ReactTestRenderer.act(() => tree.unmount());

    render(message('sent'), false);
    expect(texts()).not.toContain('Sent');
  });

  it('R6.7: shows no status for messages from the initial load', () => {
    render(message(undefined), true);
    expect(texts()).toEqual(['Hi']);
  });

  it('NFR4: Retry has a touch target of at least 44pt', () => {
    render(message('failed'));
    const style = StyleSheet.flatten(retryButton().props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
  });
});
