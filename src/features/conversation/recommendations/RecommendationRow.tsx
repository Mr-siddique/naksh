import { ScrollView, StyleSheet } from 'react-native';
import { MESSAGE_GUTTER, spacing } from '../../../theme/spacing';
import type { Recommendation } from '../conversation.types';
import { RecommendationItem } from './RecommendationItem';

type RecommendationRowProps = {
  messageId: string;
  recommendations?: Recommendation[];
};

export function RecommendationRow({
  messageId,
  recommendations,
}: RecommendationRowProps) {
  if (!recommendations?.length) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
    >
      {recommendations.map(recommendation => (
        <RecommendationItem
          key={`${messageId}-${recommendation.id}`}
          recommendation={recommendation}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    marginHorizontal: -MESSAGE_GUTTER,
    marginTop: spacing.sm,
  },
  content: {
    paddingHorizontal: MESSAGE_GUTTER,
    gap: spacing.sm,
  },
});
