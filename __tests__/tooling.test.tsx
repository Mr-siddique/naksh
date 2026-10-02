import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Clipboard from '@react-native-clipboard/clipboard';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

describe('test tooling', () => {
  it('NFR6: renders Reanimated layout animations under Jest', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Animated.View
          testID="animated"
          entering={FadeIn}
          layout={LinearTransition}
        />,
      );
    });
    expect(tree?.root.findByProps({ testID: 'animated' })).toBeDefined();
  });

  it('NFR6: mocks the native Clipboard module', () => {
    Clipboard.setString('hello');
    expect(Clipboard.setString).toHaveBeenCalledWith('hello');
  });

  it('NFR6: transforms ESM-only React Navigation packages', () => {
    expect(() => require('@react-navigation/native-stack')).not.toThrow();
  });
});
