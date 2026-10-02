export type RecommendationType =
  | 'gemstone'
  | 'tarot'
  | 'consultation'
  | 'article'
  | 'promotion'
  | 'remedy';

export type Recommendation = {
  /** Unique only within its parent message (R1.8). */
  id: string;
  /** Open string: unknown types render the fallback card (R3.5). */
  type: string;
  title: string;
  subtitle?: string;
};

export type SendStatus = 'sending' | 'sent' | 'failed';

export type FeedbackReason =
  | 'inaccurate'
  | 'too_generic'
  | 'didnt_help'
  | 'too_long';

export type Feedback = {
  rating: 'like' | 'dislike';
  reasons: FeedbackReason[];
};

/** Snapshot of the replied-to message, so the quote survives its deletion. */
export type ReplyRef = {
  messageId: string;
  text: string;
};

type BaseMessage = {
  id: string;
  text: string;
  /** ISO 8601. */
  createdAt: string;
};

export type SystemMessage = BaseMessage & { type: 'system' };

export type UserMessage = BaseMessage & {
  type: 'user';
  /** Absent for messages that arrived with the conversation. */
  status?: SendStatus;
  replyTo?: ReplyRef;
};

export type AiMessage = BaseMessage & {
  type: 'ai';
  recommendations?: Recommendation[];
  feedback?: Feedback;
};

export type HumanMessage = BaseMessage & { type: 'human' };

export type Message = SystemMessage | UserMessage | AiMessage | HumanMessage;

export type TimelineItem =
  | { kind: 'date'; key: string; label: string }
  | {
      kind: 'message';
      key: string;
      message: Message;
      isGrouped: boolean;
      showSentStatus: boolean;
    };
