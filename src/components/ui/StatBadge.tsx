import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '@hooks';
import { radius, spacing } from '@theme';

export function StatBadge({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const { colors } = useSettings();
  return (
    <View style={[styles.badge, { borderColor: color ?? colors.border, backgroundColor: colors.surfaceSoft }]}>
      <Text style={[styles.value, { color: color ?? colors.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, minWidth: 92 },
  value: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 11, fontWeight: '800', marginTop: 2 }
});
