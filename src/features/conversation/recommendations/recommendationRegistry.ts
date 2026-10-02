import type { ComponentType } from 'react';
import type { Recommendation, RecommendationType } from '../conversation.types';

export type RecommendationCardProps = {
  recommendation: Recommendation;
  config: RecommendationConfig;
  onPress: () => void;
};

export type RecommendationConfig = {
  icon: string;
  label: string;
  accent: string;
  Component?: ComponentType<RecommendationCardProps>;
};

export const RECOMMENDATION_CONFIG: Record<
  RecommendationType,
  RecommendationConfig
> = {
  gemstone: { icon: '💎', label: 'Gemstone', accent: '#3B6FE0' },
  tarot: { icon: '🔮', label: 'Tarot', accent: '#8E5BD9' },
  consultation: { icon: '👨‍🏫', label: 'Consultation', accent: '#1F9D74' },
  article: { icon: '📖', label: 'Article', accent: '#D08A1E' },
  promotion: { icon: '🎁', label: 'Offer', accent: '#D9445B' },
  remedy: { icon: '🪔', label: 'Remedy', accent: '#E0702B' },
};

export const FALLBACK_CONFIG: RecommendationConfig = {
  icon: '✨',
  label: 'Recommendation',
  accent: '#7A7F8C',
};

function isKnownType(type: string): type is RecommendationType {
  return Object.prototype.hasOwnProperty.call(RECOMMENDATION_CONFIG, type);
}

export function getRecommendationConfig(type: string): RecommendationConfig {
  return isKnownType(type) ? RECOMMENDATION_CONFIG[type] : FALLBACK_CONFIG;
}
