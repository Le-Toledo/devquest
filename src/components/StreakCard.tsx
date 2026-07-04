import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { StreakState } from '../services/streakService';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';
import { ProgressBar } from './ProgressBar';

export function StreakCard({ streak, onReward }: { streak: StreakState; onReward: () => void }) {
  const { colors } = useSettings();
  return (
    <GameCard style={{ borderColor: colors.accent }}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.kicker, { color: colors.accent }]}>Streak de estudo</Text>
          <Text style={[styles.title, { color: colors.text }]}>{streak.currentStreak} dias seguidos</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>Meta da semana: {Math.min(7, streak.currentStreak)}/7 • XP hoje: {streak.todayXp}</Text>
        </View>
        <GameButton title="Recompensa" icon="gift" variant="secondary" onPress={onReward} style={styles.button} />
      </View>
      <ProgressBar value={Math.min(1, streak.currentStreak / 7)} color={colors.accent} />
      <Text style={[styles.footer, { color: colors.muted }]}>Melhor sequência: {streak.bestStreak} dias. Volte amanhã para manter o ritmo.</Text>
    </GameCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 },
  info: { flex: 1 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  meta: { fontSize: 12, marginTop: 4 },
  footer: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  button: { minHeight: 48, paddingHorizontal: 12 }
});
