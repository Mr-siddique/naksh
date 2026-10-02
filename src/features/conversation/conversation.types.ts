export type RecommendationType =
  | 'gemstone'
  | 'tarot'
  | 'consultation'
  | 'article'
  | 'promotion'
  | 'remedy';

export type Recommendation = {
  id: string;
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

export type ReplyRef = {
  messageId: string;
  text: string;
};

type BaseMessage = {
  id: string;
  text: string;
  createdAt: string;
};

export type SystemMessage = BaseMessage & { type: 'system' };

export type UserMessage = BaseMessage & {
  type: 'user';
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
