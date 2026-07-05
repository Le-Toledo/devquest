import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';
import { useSettings } from '@hooks';
import { AppCard } from './AppCard';

export function EmptyState({ title, message, icon = 'sparkles' }: { title: string; message: string; icon?: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useSettings();
  return (
    <AppCard style={styles.wrap}>
      <Ionicons name={icon} size={32} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, textAlign: 'center' }
});
