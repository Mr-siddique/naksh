import Clipboard from '@react-native-clipboard/clipboard';
import { create } from 'zustand';
import {
  fetchConversation,
  sendMessage as sendToApi,
} from '../../../services/chatApi';
import type {
  Feedback,
  FeedbackReason,
  Message,
  ReplyRef,
  SendStatus,
} from '../conversation.types';
import { applyRating, toggleFeedbackReason } from '../utils/nextFeedback';

export type LoadState = 'loading' | 'ready' | 'error';

type ConversationState = {
  loadState: LoadState;
  messages: Message[];
  actionMessageId: string | null;
  toast: string | null;
  replyTo: ReplyRef | null;

  load(): Promise<void>;
  reset(): void;

  sendMessage(text: string): Promise<void>;
  retryMessage(id: string): Promise<void>;
  openActions(id: string): void;
  closeActions(): void;
  copyMessage(id: string): void;
  deleteMessage(id: string): void;
  setReplyTo(id: string): void;
  clearReply(): void;
  rate(id: string, rating: Feedback['rating']): void;
  toggleReason(id: string, reason: FeedbackReason): void;
};

const initialState: Pick<
  ConversationState,
  'loadState' | 'messages' | 'actionMessageId' | 'toast' | 'replyTo'
> = {
  loadState: 'loading',
  messages: [],
  actionMessageId: null,
  toast: null,
  replyTo: null,
};

export const TOAST_MS = 1500;

let session = 0;
let localIdCounter = 0;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const clearToastTimer = () => {
  clearTimeout(toastTimer);
  toastTimer = undefined;
};

export const selectIsBusy = (state: ConversationState): boolean =>
  state.messages.some(m => m.type === 'user' && m.status === 'sending');

export const useConversationStore = create<ConversationState>()((set, get) => {
  const setStatus = (id: string, status: SendStatus) =>
    set(state => ({
      messages: state.messages.map(m =>
        m.id === id && m.type === 'user' ? { ...m, status } : m,
      ),
    }));

  const updateFeedback = (
    id: string,
    next: (current: Feedback | undefined) => Feedback | undefined,
  ) =>
    set(state => {
      const index = state.messages.findIndex(m => m.id === id);
      const message = state.messages[index];
      if (message?.type !== 'ai') {
        return state;
      }
      const feedback = next(message.feedback);
      if (feedback === message.feedback) {
        return state;
      }
      const messages = [...state.messages];
      messages[index] = { ...message, feedback };
      return { messages };
    });

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
      clearToastTimer();
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
      clearToastTimer();
      set(initialState);
    },

    async sendMessage(rawText) {
      const text = rawText.trim();
      if (!text || selectIsBusy(get())) {
        return;
      }
      const id = `local-${++localIdCounter}`;
      set(state => ({
        replyTo: null,
        messages: [
          ...state.messages,
          {
            id,
            type: 'user',
            text,
            createdAt: new Date().toISOString(),
            status: 'sending',
            ...(state.replyTo && { replyTo: state.replyTo }),
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

    openActions(id) {
      const message = get().messages.find(m => m.id === id);
      if (message?.type === 'ai') {
        set({ actionMessageId: id });
      }
    },

    closeActions() {
      set({ actionMessageId: null });
    },

    copyMessage(id) {
      const message = get().messages.find(m => m.id === id);
      if (!message) {
        set({ actionMessageId: null });
        return;
      }
      Clipboard.setString(message.text);
      clearToastTimer();
      set({ toast: 'Copied', actionMessageId: null });
      toastTimer = setTimeout(() => {
        toastTimer = undefined;
        set({ toast: null });
      }, TOAST_MS);
    },

    deleteMessage(id) {
      set(state => ({
        messages: state.messages.filter(m => m.id !== id),
        actionMessageId:
          state.actionMessageId === id ? null : state.actionMessageId,
        replyTo: state.replyTo?.messageId === id ? null : state.replyTo,
      }));
    },

    setReplyTo(id) {
      const message = get().messages.find(m => m.id === id);
      if (message?.type !== 'ai') {
        set({ actionMessageId: null });
        return;
      }
      set({
        replyTo: { messageId: id, text: message.text },
        actionMessageId: null,
      });
    },

    clearReply() {
      set({ replyTo: null });
    },

    rate(id, rating) {
      updateFeedback(id, current => applyRating(current, rating));
    },

    toggleReason(id, reason) {
      updateFeedback(id, current => toggleFeedbackReason(current, reason));
    },
  };
});
