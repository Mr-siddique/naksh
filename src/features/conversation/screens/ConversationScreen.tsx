import { useCallback, useEffect, useRef } from 'react';
import {
  type FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { Composer } from '../components/Composer';
import { StatusView } from '../components/StatusView';
import { TimelineList } from '../components/TimelineList';
import type { TimelineItem } from '../conversation.types';
import { useConversationStore } from '../store/useConversationStore';

export function ConversationScreen() {
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<TimelineItem>>(null);
  const loadState = useConversationStore(s => s.loadState);
  const hasMessages = useConversationStore(s => s.messages.length > 0);
  const load = useConversationStore(s => s.load);

  useEffect(() => {
    load();
    return useConversationStore.getState().reset;
  }, [load]);

  const scrollToLatest = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  let body;
  if (loadState === 'loading') {
    body = <StatusView variant="loading" />;
  } else if (loadState === 'error') {
    body = <StatusView variant="error" onRetry={load} />;
  } else if (hasMessages) {
    body = <TimelineList listRef={listRef} />;
  } else {
    body = <StatusView variant="empty" />;
  }

  const isReady = loadState === 'ready';
  const bottomInsetColor = isReady ? colors.surface : colors.background;

  return (
    <View
      style={[
        styles.screen,
        {
          paddingBottom: insets.bottom,
          backgroundColor: bottomInsetColor,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
      >
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          {body}
        </View>
        {isReady && <Composer onSent={scrollToLatest} />}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
