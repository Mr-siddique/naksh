import { useTheme } from '../../../theme/useTheme';
import { HUMAN_SENDER } from '../constants';
import type { HumanMessage as HumanMessageType } from '../conversation.types';
import { Bubble } from './Bubble';

type HumanMessageProps = {
  message: HumanMessageType;
  isGrouped: boolean;
};

export function HumanMessage({ message, isGrouped }: HumanMessageProps) {
  const { colors } = useTheme();

  return (
    <Bubble
      align="left"
      sender={HUMAN_SENDER}
      senderColor={colors.humanAccent}
      backgroundColor={colors.humanBubble}
      isGrouped={isGrouped}
      text={message.text}
      textColor={colors.text}
    />
  );
}
