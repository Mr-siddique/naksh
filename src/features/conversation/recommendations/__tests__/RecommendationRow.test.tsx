import React from 'react';
import { Alert, Text } from 'react-native';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import type { Recommendation } from '../../conversation.types';
import {
  RECOMMENDATION_CONFIG,
  type RecommendationCardProps,
  type RecommendationConfig,
} from '../recommendationRegistry';
import { RecommendationRow } from '../RecommendationRow';

const isHost = (node: ReactTestInstance, name: string) =>
  (node.type as unknown) === name;

const RECS: Recommendation[] = [
  {
    id: '1',
    type: 'gemstone',
    title: 'Blue Sapphire',
    subtitle: 'Recommended for Saturn',
  },
  { id: '2', type: 'tarot', title: 'Career Tarot Reading' },
  { id: '3', type: 'unknown-future-type', title: 'Something new' },
];

let tree: ReactTestRenderer.ReactTestRenderer;

function render(recommendations: Recommendation[] | undefined) {
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <RecommendationRow messageId="m1" recommendations={recommendations} />,
    );
  });
}

const cards = () =>
  tree.root.findAll(
    (node: ReactTestInstance) =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function',
  );

const textsIn = (node: ReactTestInstance) =>
  node
    .findAll(
      (child: ReactTestInstance) =>
        isHost(child, 'Text') && typeof child.props.children === 'string',
    )
    .map(child => child.props.children as string);

afterEach(() => {
  ReactTestRenderer.act(() => tree.unmount());
  jest.restoreAllMocks();
});

describe('RecommendationRow', () => {
  it('R3.1: renders one card per recommendation in a horizontal row', () => {
    render(RECS);
    expect(cards()).toHaveLength(3);
    const scroll = tree.root.find(
      (node: ReactTestInstance) => node.props.horizontal === true,
    );
    expect(scroll).toBeDefined();
  });

  it('R3.2: renders nothing when there are no recommendations', () => {
    render([]);
    expect(tree.toJSON()).toBeNull();
    render(undefined);
    expect(tree.toJSON()).toBeNull();
  });

  it('R3.3: shows the type icon, type label, title and subtitle', () => {
    render(RECS);
    const { icon, label } = RECOMMENDATION_CONFIG.gemstone;
    expect(textsIn(cards()[0])).toEqual([
      icon,
      label,
      'Blue Sapphire',
      'Recommended for Saturn',
    ]);
  });

  it('R3.3: omits the subtitle when there is none', () => {
    render(RECS);
    const { icon, label } = RECOMMENDATION_CONFIG.tarot;
    expect(textsIn(cards()[1])).toEqual([icon, label, 'Career Tarot Reading']);
  });

  it('R3.5: renders an unknown type with the generic fallback card', () => {
    render(RECS);
    expect(textsIn(cards()[2])).toEqual([
      '✨',
      'Recommendation',
      'Something new',
    ]);
  });

  it('R3.6: shows an Alert with the card title when a card is tapped', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(RECS);
    ReactTestRenderer.act(() => cards()[1].props.onPress());
    expect(alert).toHaveBeenCalledWith('Career Tarot Reading', undefined);
  });

  it('R3.6: includes the subtitle in the Alert when there is one', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(RECS);
    ReactTestRenderer.act(() => cards()[0].props.onPress());
    expect(alert).toHaveBeenCalledWith(
      'Blue Sapphire',
      'Recommended for Saturn',
    );
  });

  it('R3.7: renders a type through its custom Component when one is registered', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const received: RecommendationCardProps[] = [];
    function CustomTarotCard(props: RecommendationCardProps) {
      received.push(props);
      return <Text onPress={props.onPress}>custom tarot</Text>;
    }
    const original: RecommendationConfig = RECOMMENDATION_CONFIG.tarot;
    jest.replaceProperty(RECOMMENDATION_CONFIG, 'tarot', {
      ...original,
      Component: CustomTarotCard,
    });
    render(RECS);

    expect(cards()).toHaveLength(2);
    const custom = tree.root.findByType(CustomTarotCard);
    expect(received[0].recommendation).toBe(RECS[1]);
    expect(received[0].config.label).toBe(original.label);

    ReactTestRenderer.act(() => custom.props.onPress());
    expect(alert).toHaveBeenCalledWith('Career Tarot Reading', undefined);
  });

  it('NFR4: cards are accessible buttons that announce type and title', () => {
    render(RECS);
    expect(cards()[0].props.accessibilityLabel).toBe(
      'Gemstone: Blue Sapphire, Recommended for Saturn',
    );
  });
});
