import { StyleSheet, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const { colors } = useSettings();
  const normalized = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: normalized }} style={[styles.track, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
      <View style={[styles.fill, { width: `${normalized}%`, backgroundColor: color ?? colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 9,
    borderRadius: 99,
    overflow: 'hidden',
    borderWidth: 1
  },
  fill: {
    height: '100%',
    borderRadius: 99
  }
});
