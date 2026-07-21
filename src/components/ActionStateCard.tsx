import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { radius, spacing, typography } from '../theme';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';

type Action = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
};

type Props = {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'info' | 'warning' | 'error' | 'success';
  primaryAction?: Action;
  secondaryAction?: Action;
  embedded?: boolean;
};

export function ActionStateCard({ title, message, icon = 'sparkles', tone = 'info', primaryAction, secondaryAction, embedded = false }: Props) {
  const { colors } = useSettings();
  const toneColor = tone === 'error' ? colors.danger : tone === 'warning' ? colors.warning : tone === 'success' ? colors.success : colors.primary;

  const content: ReactNode = (
    <>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceGlow, borderColor: toneColor }]}>
          <Ionicons name={icon} size={22} color={toneColor} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
        </View>
      </View>
      {primaryAction || secondaryAction ? (
        <View style={styles.actions}>
          {primaryAction ? <GameButton {...primaryAction} variant={primaryAction.variant ?? 'primary'} style={styles.button} /> : null}
          {secondaryAction ? <GameButton {...secondaryAction} variant={secondaryAction.variant ?? 'secondary'} style={styles.button} /> : null}
        </View>
      ) : null}
    </>
  );

  if (embedded) {
    return <View style={[styles.embedded, { backgroundColor: colors.surfaceSoft, borderColor: toneColor }]}>{content}</View>;
  }

  return (
    <GameCard style={{ borderColor: toneColor }}>
      {content}
    </GameCard>
  );
}

const styles = StyleSheet.create({
  embedded: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: { width: 48, height: 48, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  title: { ...typography.body, fontWeight: '900' },
  message: { ...typography.caption, lineHeight: 18, marginTop: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  button: { flexBasis: 136, flexGrow: 1, minHeight: spacing.touch }
});
