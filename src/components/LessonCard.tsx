import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { Lesson } from '../types/academy';
import { AcademyLessonStatus } from '../services/academyViewModel';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';

const statusLabel: Record<AcademyLessonStatus, string> = {
  completed: 'Concluída',
  current: 'Atual',
  available: 'Disponível',
  locked: 'Bloqueada'
};

export function LessonCard({
  lesson,
  completed,
  locked,
  status,
  onOpen
}: {
  lesson: Lesson;
  completed: boolean;
  locked?: boolean;
  status?: AcademyLessonStatus;
  onOpen: () => void;
}) {
  const { colors } = useSettings();
  const resolvedStatus: AcademyLessonStatus = status ?? (completed ? 'completed' : locked ? 'locked' : 'available');
  const disabled = resolvedStatus === 'locked';
  const color = resolvedStatus === 'completed' ? colors.success : resolvedStatus === 'current' ? colors.primary : resolvedStatus === 'available' ? colors.secondary : colors.border;
  return (
    <GameCard style={{ borderColor: color, opacity: disabled ? 0.62 : 1 }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: disabled ? colors.surfaceSoft : color, borderColor: colors.glow }]}>
          <Ionicons name={resolvedStatus === 'completed' ? 'checkmark' : disabled ? 'lock-closed' : resolvedStatus === 'current' ? 'play' : 'book'} size={20} color={disabled ? colors.muted : colors.onAccent} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.status, { color }]}>{statusLabel[resolvedStatus]}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>{lesson.moduleTitle ?? lesson.concept} • {lesson.level ?? 'iniciante'} • {lesson.estimatedMinutes} min</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{lesson.description}</Text>
          {disabled ? <Text style={[styles.lockedText, { color: colors.muted }]}>Conclua a aula anterior para liberar esta etapa.</Text> : null}
        </View>
      </View>
      <GameButton title={disabled ? 'Bloqueada' : completed ? 'Rever aula' : 'Estudar'} icon={disabled ? 'lock-closed' : 'arrow-forward'} variant="secondary" onPress={onOpen} disabled={disabled} />
    </GameCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  icon: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  status: { fontSize: 11, lineHeight: 14, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 16, fontWeight: '900' },
  meta: { marginTop: 4, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  description: { marginTop: 5, fontSize: 13, lineHeight: 18 },
  lockedText: { marginTop: 8, fontSize: 12, lineHeight: 16, fontWeight: '800' }
});
