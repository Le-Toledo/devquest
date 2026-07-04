import { StyleSheet, Text } from 'react-native';
import { useSettings } from '@hooks';
import { typography } from '@theme';

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useSettings();
  return (
    <>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: typography.section,
  subtitle: { ...typography.body, marginTop: 4 }
});
