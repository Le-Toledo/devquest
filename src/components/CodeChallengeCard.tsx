import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { CodeChallenge, CodeChallengeStatus } from '../types/codeArena';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';

export function CodeChallengeCard({ challenge, status, onOpen }: { challenge: CodeChallenge; status: CodeChallengeStatus; onOpen: () => void }) {
  const { colors } = useSettings();
  const color = status === 'completed' ? colors.success : status === 'review' ? colors.accent : colors.secondary;
  return (
    <GameCard style={{ borderColor: color }}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: color, borderColor: colors.glow }]}>
          <Text style={[styles.badgeText, { color: colors.onAccent }]}>{challenge.language.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{challenge.title}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.muted }]}>{challenge.kind} • {challenge.difficulty}</Text>
            <View style={[styles.statusPill, { backgroundColor: colors.surfaceGlow, borderColor: color }]}>
              <Ionicons name={status === 'completed' ? 'checkmark-circle' : status === 'review' ? 'refresh-circle' : 'sparkles'} size={13} color={color} />
              <Text style={[styles.statusText, { color }]}>{status}</Text>
            </View>
          </View>
          <Text style={[styles.description, { color: colors.muted }]}>{challenge.description}</Text>
        </View>
      </View>
      <GameButton title={status === 'completed' ? 'Rever' : 'Resolver'} icon="code-slash" variant="secondary" onPress={onOpen} />
    </GameCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  badge: { width: 54, height: 54, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontWeight: '900', fontSize: 15 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  meta: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  description: { marginTop: 5, fontSize: 13, lineHeight: 18 }
});
