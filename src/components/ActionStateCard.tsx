import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
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
  const color = tone === 'error' ? colors.danger : tone === 'warning' ? colors.warning : tone === 'success' ? colors.success : colors.primary;
  const content: ReactNode = (
    <>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceGlow, borderColor: color }]}>
          <Ionicons name={icon} size={22} color={color} />
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
    return <View style={[styles.embedded, { backgroundColor: colors.surfaceSoft, borderColor: color }]}>{content}</View>;
  }

  return (
    <GameCard style={{ borderColor: color }}>
      {content}
    </GameCard>
  );
}

const styles = StyleSheet.create({
  embedded: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '900' },
  message: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  button: { flexBasis: 136, flexGrow: 1, minHeight: 48 }
});
