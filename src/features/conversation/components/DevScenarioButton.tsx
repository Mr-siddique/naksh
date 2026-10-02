import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  getScenario,
  type Scenario,
  setScenario,
} from '../../../services/chatApi';
import { MIN_TOUCH } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';
import { useConversationStore } from '../store/useConversationStore';
import { ActionSheet } from './ActionSheet';

const SCENARIOS: { scenario: Scenario; label: string }[] = [
  { scenario: 'normal', label: 'Normal' },
  { scenario: 'empty', label: 'Empty conversation' },
  { scenario: 'loadFails', label: 'Load fails' },
  { scenario: 'sendsFail', label: 'Sends fail' },
];

export function DevScenarioButton() {
  const { colors } = useTheme();
  const load = useConversationStore(s => s.load);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(getScenario);

  if (!__DEV__) {
    return null;
  }

  const choose = (scenario: Scenario) => {
    setVisible(false);
    setCurrent(scenario);
    setScenario(scenario);
    load();
  };

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Demo scenarios"
        style={styles.button}
      >
        <Text style={[styles.icon, { color: colors.primary }]}>⚙︎</Text>
      </Pressable>
      <ActionSheet
        visible={visible}
        title="Demo scenario"
        onClose={() => setVisible(false)}
        options={SCENARIOS.map(({ scenario, label }) => ({
          label,
          selected: scenario === current,
          onPress: () => choose(scenario),
        }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
});
