import { create } from 'zustand';
import { fetchConversation } from '../../../services/chatApi';
import type { Message } from '../conversation.types';

export type LoadState = 'loading' | 'ready' | 'error';

type ConversationState = {
  loadState: LoadState;
  messages: Message[];

  load(): Promise<void>;
  reset(): void;
};

const initialState: Pick<ConversationState, 'loadState' | 'messages'> = {
  loadState: 'loading',
  messages: [],
};

let session = 0;

export const useConversationStore = create<ConversationState>()(set => ({
  ...initialState,

  async load() {
    const startedIn = ++session;
    set(initialState);
    try {
      const messages = await fetchConversation();
      if (startedIn === session) {
        set({ loadState: 'ready', messages });
      }
    } catch {
      if (startedIn === session) {
        set({ loadState: 'error' });
      }
    }
  },

  reset() {
    session++;
    set(initialState);
  },
}));
