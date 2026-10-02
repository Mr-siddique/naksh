import type { RecommendationType } from '../../conversation.types';
import {
  FALLBACK_CONFIG,
  getRecommendationConfig,
  RECOMMENDATION_CONFIG,
} from '../recommendationRegistry';

const TYPES: RecommendationType[] = [
  'gemstone',
  'tarot',
  'consultation',
  'article',
  'promotion',
  'remedy',
];

describe('recommendationRegistry', () => {
  it('R3.4: configures every supported type with an icon, label and accent', () => {
    expect(Object.keys(RECOMMENDATION_CONFIG).sort()).toEqual(
      [...TYPES].sort(),
    );
    for (const type of TYPES) {
      const config = getRecommendationConfig(type);
      expect(config).toBe(RECOMMENDATION_CONFIG[type]);
      expect(config.icon).toBeTruthy();
      expect(config.label).toBeTruthy();
      expect(config.accent).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('R3.4: gives each type a distinct icon and accent', () => {
    const configs = TYPES.map(type => RECOMMENDATION_CONFIG[type]);
    expect(new Set(configs.map(c => c.icon)).size).toBe(TYPES.length);
    expect(new Set(configs.map(c => c.accent)).size).toBe(TYPES.length);
  });

  it('R3.5: falls back to the generic config for an unknown type', () => {
    expect(getRecommendationConfig('unknown-future-type')).toBe(
      FALLBACK_CONFIG,
    );
    expect(getRecommendationConfig('')).toBe(FALLBACK_CONFIG);
  });

  it('R3.5: does not treat built-in object keys as known types', () => {
    expect(getRecommendationConfig('toString')).toBe(FALLBACK_CONFIG);
    expect(getRecommendationConfig('__proto__')).toBe(FALLBACK_CONFIG);
  });
});
