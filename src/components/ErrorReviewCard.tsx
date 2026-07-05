import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { areaName } from '../data/worlds';
import { useSettings } from '../hooks/useSettings';
import { ReviewError } from '../types/review';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';

const priorityLabels: Record<ReviewError['priority'], string> = {
  today: 'Revisar hoje',
  tomorrow: 'Revisar amanha',
  'three-days': 'Revisar em 3 dias',
  'seven-days': 'Revisar em 7 dias'
};

export function ErrorReviewCard({
  error,
  onReview,
  onLearned
}: {
  error: ReviewError;
  onReview: () => void;
  onLearned: () => void;
}) {
  const { colors } = useSettings();
  const learned = Boolean(error.learnedAt);
  const priorityColor = error.priority === 'today' ? colors.danger : error.priority === 'tomorrow' ? colors.accent : colors.secondary;

  return (
    <GameCard style={{ borderColor: learned ? colors.success : priorityColor, opacity: learned ? 0.68 : 1 }}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: learned ? colors.success : priorityColor, borderColor: colors.glow }]}>
          <Ionicons name={learned ? 'school' : 'flask'} size={18} color={colors.onAccent} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{error.prompt}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>
            {areaName(error.areaId)} • {error.concept} • {error.difficulty}
          </Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <Text style={[styles.pill, { color: priorityColor, borderColor: priorityColor }]}>{learned ? 'Aprendido' : priorityLabels[error.priority]}</Text>
        <Text style={[styles.small, { color: colors.muted }]}>Erros: {error.wrongCount}</Text>
        <Text style={[styles.small, { color: colors.muted }]}>{new Date(error.lastWrongAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.actions}>
        <GameButton title="Revisar" icon="book" variant="secondary" onPress={onReview} style={styles.button} />
        <GameButton title="Aprendido" icon="checkmark" variant="ghost" onPress={onLearned} disabled={learned} style={styles.button} />
      </View>
    </GameCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 12 },
  badge: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 16, lineHeight: 21, fontWeight: '900' },
  meta: { marginTop: 4, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: '900' },
  small: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  button: { flexBasis: 120, flexGrow: 1, minHeight: 48 }
});
