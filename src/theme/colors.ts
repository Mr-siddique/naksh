export type Colors = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  danger: string;
  userBubble: string;
  onUserBubble: string;
  aiBubble: string;
  humanBubble: string;
  humanAccent: string;
  chip: string;
  chipSelected: string;
  overlay: string;
};

export const lightColors: Colors = {
  background: '#F6F5FA',
  surface: '#FFFFFF',
  border: '#E3E1EC',
  text: '#1B1A22',
  textMuted: '#6E6B7B',
  primary: '#5B3FD9',
  onPrimary: '#FFFFFF',
  danger: '#C23340',
  userBubble: '#5B3FD9',
  onUserBubble: '#FFFFFF',
  aiBubble: '#FFFFFF',
  humanBubble: '#FFF4E0',
  humanAccent: '#9A5B00',
  chip: '#EEECF5',
  chipSelected: '#E2DBFF',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const darkColors: Colors = {
  background: '#111016',
  surface: '#1C1B23',
  border: '#2E2C38',
  text: '#F2F1F7',
  textMuted: '#A09DAF',
  primary: '#9B85FF',
  onPrimary: '#14121C',
  danger: '#FF6B76',
  userBubble: '#6C52E6',
  onUserBubble: '#FFFFFF',
  aiBubble: '#1C1B23',
  humanBubble: '#2E2414',
  humanAccent: '#F2A93B',
  chip: '#26242F',
  chipSelected: '#3A3160',
  overlay: 'rgba(0, 0, 0, 0.6)',
};
