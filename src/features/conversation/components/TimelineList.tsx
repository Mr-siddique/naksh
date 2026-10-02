import { type Ref, useMemo } from 'react';
import { type FlatList, type ListRenderItem, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { LAYOUT_TRANSITION } from '../../../theme/motion';
import { spacing } from '../../../theme/spacing';
import type { TimelineItem } from '../conversation.types';
import { useConversationStore } from '../store/useConversationStore';
import { buildTimeline } from '../utils/buildTimeline';
import { DateSeparator } from './DateSeparator';
import { MessageRow } from './MessageRow';

type TimelineListProps = {
  listRef?: Ref<FlatList<TimelineItem>>;
};

const MAINTAIN_POSITION = {
  minIndexForVisible: 0,
  autoscrollToTopThreshold: 40,
};

const keyExtractor = (item: TimelineItem) => item.key;

const renderItem: ListRenderItem<TimelineItem> = ({ item }) =>
  item.kind === 'date' ? (
    <DateSeparator label={item.label} />
  ) : (
    <MessageRow
      message={item.message}
      isGrouped={item.isGrouped}
      showSentStatus={item.showSentStatus}
    />
  );

export function TimelineList({ listRef }: TimelineListProps) {
  const messages = useConversationStore(s => s.messages);
  const items = useMemo(() => buildTimeline(messages, new Date()), [messages]);

  return (
    <Animated.FlatList
      ref={listRef}
      inverted
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      maintainVisibleContentPosition={MAINTAIN_POSITION}
      itemLayoutAnimation={LAYOUT_TRANSITION}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
