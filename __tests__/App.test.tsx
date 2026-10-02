/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { darkColors, lightColors } from '../src/theme/colors';

async function renderApp() {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });
  return tree;
}

afterEach(() => jest.restoreAllMocks());

it('NFR3: renders the Conversation screen titled "AI Astrologer"', async () => {
  const tree = await renderApp();

  tree.root.findByProps({ testID: 'conversation-screen' });
  const header = tree.root.findByProps({ title: 'AI Astrologer' });
  expect(header.props.backgroundColor).toBe(lightColors.surface);

  await ReactTestRenderer.act(() => tree.unmount());
});

it('NFR3: themes the header with the dark tokens in dark mode', async () => {
  jest.spyOn(require('react-native'), 'useColorScheme').mockReturnValue('dark');
  const tree = await renderApp();

  const header = tree.root.findByProps({ title: 'AI Astrologer' });
  expect(header.props.backgroundColor).toBe(darkColors.surface);
  expect(header.props.titleColor).toBe(darkColors.text);

  await ReactTestRenderer.act(() => tree.unmount());
});
