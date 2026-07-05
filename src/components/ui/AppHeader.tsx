import { StyleSheet, Text } from 'react-native';
import { useSettings } from '@hooks';
import { typography } from '@theme';

export function AppHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  const { colors } = useSettings();
  return (
    <>
      {eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text> : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.caption, textTransform: 'uppercase' },
  title: typography.hero,
  subtitle: { ...typography.body, marginTop: 6 }
});
