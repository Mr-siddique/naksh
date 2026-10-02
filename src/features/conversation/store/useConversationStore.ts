import { create } from 'zustand';
import {
  fetchConversation,
  sendMessage as sendToApi,
} from '../../../services/chatApi';
import type { Message, SendStatus } from '../conversation.types';

export type LoadState = 'loading' | 'ready' | 'error';

type ConversationState = {
  loadState: LoadState;
  messages: Message[];

  load(): Promise<void>;
  reset(): void;
  sendMessage(text: string): Promise<void>;
  retryMessage(id: string): Promise<void>;
};

const initialState: Pick<ConversationState, 'loadState' | 'messages'> = {
  loadState: 'loading',
  messages: [],
};

let session = 0;
let localIdCounter = 0;

export const selectIsBusy = (state: ConversationState): boolean =>
  state.messages.some(m => m.type === 'user' && m.status === 'sending');

export const useConversationStore = create<ConversationState>()((set, get) => {
  const setStatus = (id: string, status: SendStatus) =>
    set(state => ({
      messages: state.messages.map(m =>
        m.id === id && m.type === 'user' ? { ...m, status } : m,
      ),
    }));

  const deliver = async (id: string, text: string) => {
    const startedIn = session;
    try {
      await sendToApi(text);
      if (startedIn === session) {
        setStatus(id, 'sent');
      }
    } catch {
      if (startedIn === session) {
        setStatus(id, 'failed');
      }
    }
  };

  return {
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

    async sendMessage(rawText) {
      const text = rawText.trim();
      if (!text || selectIsBusy(get())) {
        return;
      }
      const id = `local-${++localIdCounter}`;
      set(state => ({
        messages: [
          ...state.messages,
          {
            id,
            type: 'user',
            text,
            createdAt: new Date().toISOString(),
            status: 'sending',
          },
        ],
      }));
      await deliver(id, text);
    },

    async retryMessage(id) {
      const message = get().messages.find(m => m.id === id);
      if (
        message?.type !== 'user' ||
        message.status !== 'failed' ||
        selectIsBusy(get())
      ) {
        return;
      }
      setStatus(id, 'sending');
      await deliver(id, message.text);
    },
  };
});
