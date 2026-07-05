import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';

export function RecommendedActionCard({
  title,
  subtitle,
  icon,
  color,
  cta,
  onPress
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  cta: string;
  onPress: () => void;
}) {
  const { colors } = useSettings();
  return (
    <GameCard style={{ borderColor: color }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={22} color={colors.onAccent} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
          <Text style={[styles.next, { color }]}>Recomendado para agora</Text>
        </View>
      </View>
      <GameButton title={cta} icon="arrow-forward" variant="secondary" onPress={onPress} />
    </GameCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' },
  icon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 17, fontWeight: '900' },
  subtitle: { marginTop: 5, fontSize: 13, lineHeight: 18 },
  next: { marginTop: 6, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }
});
