import { memo, useCallback } from 'react';
import { Alert } from 'react-native';
import type { Recommendation } from '../conversation.types';
import { RecommendationCard } from './RecommendationCard';
import { getRecommendationConfig } from './recommendationRegistry';

type RecommendationItemProps = {
  recommendation: Recommendation;
};

function RecommendationItemView({ recommendation }: RecommendationItemProps) {
  const config = getRecommendationConfig(recommendation.type);
  const Card = config.Component ?? RecommendationCard;
  const { title, subtitle } = recommendation;
  const onPress = useCallback(
    () => Alert.alert(title, subtitle),
    [title, subtitle],
  );

  return (
    <Card recommendation={recommendation} config={config} onPress={onPress} />
  );
}

export const RecommendationItem = memo(RecommendationItemView);
