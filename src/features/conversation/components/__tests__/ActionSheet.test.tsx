import React from 'react';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import { findPressable, isHost } from '../../../../testUtils';
import { ActionSheet } from '../ActionSheet';

let tree: ReactTestRenderer.ReactTestRenderer;
const onClose = jest.fn();
const onCopy = jest.fn();
const onDelete = jest.fn();

function render(visible = true) {
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ActionSheet
        visible={visible}
        onClose={onClose}
        options={[
          { label: 'Copy', onPress: onCopy },
          { label: 'Delete', onPress: onDelete, destructive: true },
        ]}
      />,
    );
  });
}

const labels = () =>
  tree.root
    .findAll(
      (node: ReactTestInstance) =>
        isHost(node, 'Text') && typeof node.props.children === 'string',
    )
    .map(node => node.props.children as string);

beforeEach(() => {
  onClose.mockReset();
  onCopy.mockReset();
  onDelete.mockReset();
});

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
});

describe('ActionSheet', () => {
  it('R4.1: lists the options followed by Cancel', () => {
    render();
    expect(labels()).toEqual(['Copy', 'Delete', 'Cancel']);
  });

  it('R4.1: runs the chosen option', () => {
    render();
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Delete').props.onPress(),
    );
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('R4.1: closes on Cancel, on the backdrop and on Android back', () => {
    render();
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Cancel').props.onPress(),
    );
    ReactTestRenderer.act(() =>
      findPressable(tree.root, 'Close actions').props.onPress(),
    );
    const modal = tree.root.find(
      (node: ReactTestInstance) =>
        typeof node.props.onRequestClose === 'function',
    );
    ReactTestRenderer.act(() => modal.props.onRequestClose());
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('R4.1: renders nothing while closed', () => {
    render(false);
    expect(labels()).toEqual([]);
  });
});
