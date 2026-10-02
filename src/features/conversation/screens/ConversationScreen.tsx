import { useEffect } from 'react';
import { StatusView } from '../components/StatusView';
import { TimelineList } from '../components/TimelineList';
import { useConversationStore } from '../store/useConversationStore';

export function ConversationScreen() {
  const loadState = useConversationStore(s => s.loadState);
  const hasMessages = useConversationStore(s => s.messages.length > 0);
  const load = useConversationStore(s => s.load);

  useEffect(() => {
    load();
    return useConversationStore.getState().reset;
  }, [load]);

  if (loadState === 'loading') {
    return <StatusView variant="loading" />;
  }
  if (loadState === 'error') {
    return <StatusView variant="error" onRetry={load} />;
  }
  if (!hasMessages) {
    return <StatusView variant="empty" />;
  }
  return <TimelineList />;
}
