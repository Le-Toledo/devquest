import { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { GradientScreen } from '../GradientScreen';
import { spacing } from '@theme';

export function AppScreen({ children }: { children: ReactNode }) {
  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.screen, gap: spacing.lg, paddingBottom: 40 }
});
