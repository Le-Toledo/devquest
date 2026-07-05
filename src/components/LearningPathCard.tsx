import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { lessonsByPath } from '../data/lessons';
import { useSettings } from '../hooks/useSettings';
import { AcademyProgress, LearningPath } from '../types/academy';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';
import { ProgressBar } from './ProgressBar';

export function LearningPathCard({ path, progress, onOpen }: { path: LearningPath; progress: AcademyProgress; onOpen: () => void }) {
  const { colors } = useSettings();
  const lessons = lessonsByPath(path.id);
  const completed = lessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
  const unlocked = progress.unlockedPathIds.includes(path.id);
  const done = completed === lessons.length;

  return (
    <GameCard style={{ borderColor: path.color, opacity: unlocked ? 1 : 0.55 }}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: path.color, borderColor: colors.glow }]}>
          <Ionicons name={done ? 'medal' : path.icon} size={26} color={colors.onAccent} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{path.title}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>Nível recomendado {path.recommendedLevel} • {completed}/{lessons.length} aulas</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{path.description}</Text>
        </View>
      </View>
      <ProgressBar value={lessons.length ? completed / lessons.length : 0} color={path.color} />
      <GameButton title={completed > 0 ? 'Continuar' : 'Comecar'} icon="school" variant="secondary" disabled={!unlocked} onPress={onOpen} style={styles.button} />
    </GameCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  icon: { width: 58, height: 58, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: '900' },
  meta: { marginTop: 4, fontSize: 12, fontWeight: '800' },
  description: { marginTop: 5, fontSize: 13, lineHeight: 18 },
  button: { marginTop: 12 }
});
