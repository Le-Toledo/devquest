import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { Lesson } from '../types/academy';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';

export function LessonCard({ lesson, completed, locked, onOpen }: { lesson: Lesson; completed: boolean; locked?: boolean; onOpen: () => void }) {
  const { colors } = useSettings();
  return (
    <GameCard style={{ borderColor: completed ? colors.success : locked ? colors.border : colors.primary, opacity: locked ? 0.62 : 1 }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: completed ? colors.success : locked ? colors.surfaceSoft : colors.secondary, borderColor: colors.glow }]}>
          <Ionicons name={completed ? 'checkmark' : locked ? 'lock-closed' : 'book'} size={20} color={locked ? colors.muted : colors.onAccent} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>{lesson.moduleTitle ?? lesson.concept} • {lesson.level ?? 'iniciante'} • {lesson.estimatedMinutes} min</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{lesson.description}</Text>
          {locked ? <Text style={[styles.lockedText, { color: colors.muted }]}>Conclua a aula anterior para liberar esta etapa.</Text> : null}
        </View>
      </View>
      <GameButton title={locked ? 'Bloqueada' : completed ? 'Rever aula' : 'Estudar'} icon={locked ? 'lock-closed' : 'arrow-forward'} variant="secondary" onPress={onOpen} disabled={locked} />
    </GameCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  icon: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '900' },
  meta: { marginTop: 4, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  description: { marginTop: 5, fontSize: 13, lineHeight: 18 },
  lockedText: { marginTop: 8, fontSize: 12, lineHeight: 16, fontWeight: '800' }
});
