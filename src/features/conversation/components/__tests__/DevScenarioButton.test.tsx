import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { setScenario } from '../../../../services/chatApi';
import { findPressable } from '../../../../testUtils';
import { useConversationStore } from '../../store/useConversationStore';
import { DevScenarioButton } from '../DevScenarioButton';

jest.mock('../../../../services/chatApi', () => ({
  setScenario: jest.fn(),
  getScenario: jest.fn(() => 'normal'),
}));

const mockLoad = jest.fn();
const originalLoad = useConversationStore.getState().load;
const originalDev = __DEV__;
let tree: ReactTestRenderer.ReactTestRenderer;

const setDev = (value: boolean) => {
  (globalThis as { __DEV__?: boolean }).__DEV__ = value;
};

function render() {
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<DevScenarioButton />);
  });
}

beforeEach(() => {
  mockLoad.mockReset();
  jest.mocked(setScenario).mockReset();
  useConversationStore.setState({ load: mockLoad });
});

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
  useConversationStore.setState({ load: originalLoad });
  setDev(originalDev);
});

describe('DevScenarioButton', () => {
  it('R7.1: lists the four scenarios with the current one checked', () => {
    render();
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Demo scenarios').props.onPress(),
    );
    const labels = ['Normal', 'Empty conversation', 'Load fails', 'Sends fail'];
    for (const label of labels) {
      expect(findPressable(tree.root, label)).toBeTruthy();
    }
    expect(
      findPressable(tree.root, 'Normal').props.accessibilityState.selected,
    ).toBe(true);
    expect(
      findPressable(tree.root, 'Load fails').props.accessibilityState.selected,
    ).toBeFalsy();
  });

  it('R7.2: choosing "Load fails" sets the scenario and reloads', () => {
    render();
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Demo scenarios').props.onPress(),
    );
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Load fails').props.onPress(),
    );
    expect(setScenario).toHaveBeenCalledWith('loadFails');
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(jest.mocked(setScenario).mock.invocationCallOrder[0]).toBeLessThan(
      mockLoad.mock.invocationCallOrder[0],
    );
  });

  it('R7.1: the check moves to the scenario that was chosen', () => {
    render();
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Demo scenarios').props.onPress(),
    );
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Sends fail').props.onPress(),
    );
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Demo scenarios').props.onPress(),
    );
    expect(
      findPressable(tree.root, 'Sends fail').props.accessibilityState.selected,
    ).toBe(true);
    expect(
      findPressable(tree.root, 'Normal').props.accessibilityState.selected,
    ).toBeFalsy();
  });

  it('R7.3: renders nothing outside development builds', () => {
    setDev(false);
    render();
    expect(tree.toJSON()).toBeNull();
  });
});
