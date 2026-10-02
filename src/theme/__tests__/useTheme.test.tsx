import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { darkColors, lightColors } from '../colors';
import { type Theme, useTheme } from '../useTheme';

function readTheme(scheme: 'light' | 'dark' | null): Theme {
  jest.spyOn(require('react-native'), 'useColorScheme').mockReturnValue(scheme);

  let theme!: Theme;
  function Probe() {
    theme = useTheme();
    return null;
  }
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  ReactTestRenderer.act(() => renderer.unmount());
  return theme;
}

afterEach(() => jest.restoreAllMocks());

describe('useTheme', () => {
  it('NFR3: returns the dark tokens when the scheme is dark', () => {
    expect(readTheme('dark')).toEqual({ dark: true, colors: darkColors });
  });

  it('NFR3: returns the light tokens when the scheme is light', () => {
    expect(readTheme('light')).toEqual({ dark: false, colors: lightColors });
  });

  it('NFR3: falls back to light when the scheme is unknown', () => {
    expect(readTheme(null).dark).toBe(false);
  });
});
