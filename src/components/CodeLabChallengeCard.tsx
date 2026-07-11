import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { CodeLabChallenge, CodeLabProgress } from '../types/codeLab';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';

export function CodeLabChallengeCard({ challenge, progress, onOpen }: { challenge: CodeLabChallenge; progress: CodeLabProgress; onOpen: () => void }) {
  const { colors } = useSettings();
  const attempt = progress.attemptsByChallengeId[challenge.id];
  const completed = Boolean(attempt?.completed);
  const color = completed ? colors.success : colors.primary;
  return (
    <GameCard style={{ borderColor: color }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.surfaceGlow, borderColor: color }]}>
          <Ionicons name={completed ? 'checkmark-circle' : 'terminal'} size={20} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.kicker, { color }]}>{challenge.language} • {challenge.difficulty}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{challenge.title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{challenge.concept} • melhor pontuação {attempt?.bestScore ?? 0}%</Text>
        </View>
      </View>
      <Text style={[styles.description, { color: colors.muted }]}>{challenge.description}</Text>
      <GameButton title={completed ? 'Rever prática' : 'Praticar'} icon="code-slash" variant="secondary" onPress={onOpen} style={styles.button} />
    </GameCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  kicker: { fontSize: 11, lineHeight: 14, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 16, lineHeight: 20, fontWeight: '900', marginTop: 2 },
  subtitle: { fontSize: 12, lineHeight: 16, marginTop: 3, fontWeight: '800' },
  description: { fontSize: 13, lineHeight: 18, marginTop: 10 },
  button: { marginTop: 12 }
});
