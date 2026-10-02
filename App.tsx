import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { DevScenarioButton } from './src/features/conversation/components/DevScenarioButton';
import { ConversationScreen } from './src/features/conversation/screens/ConversationScreen';
import { type Colors, darkColors, lightColors } from './src/theme/colors';
import { useTheme } from './src/theme/useTheme';

type RootStackParamList = {
  Conversation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function toNavigationTheme(base: NavigationTheme, colors: Colors) {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };
}

const NAV_LIGHT = toNavigationTheme(DefaultTheme, lightColors);
const NAV_DARK = toNavigationTheme(DarkTheme, darkColors);

const conversationOptions: NativeStackNavigationOptions = {
  title: 'AI Astrologer',
  headerRight: () => <DevScenarioButton />,
};

function App() {
  const { dark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={dark ? NAV_DARK : NAV_LIGHT}>
        <Stack.Navigator>
          <Stack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={conversationOptions}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
