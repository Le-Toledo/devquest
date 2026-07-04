import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { LearningPathCard } from '../components/LearningPathCard';
import { LessonCard } from '../components/LessonCard';
import { learningPaths } from '../data/learningPaths';
import { lessonsByPath, modulesByPath } from '../data/lessons';
import { useSettings } from '../hooks/useSettings';
import { useAcademy } from '../hooks/useAcademy';
import { LearningPath, Lesson } from '../types/academy';
import { Navigate } from '../navigation/routes';

type AcademyListItem = LearningPath | Lesson | { id: string; kind: 'module-header'; title: string; description: string };

export function AcademyScreen({ navigate, goBack }: { navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { progress, stats } = useAcademy();
  const listRef = useRef<FlatList<AcademyListItem>>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const currentLessons = useMemo(() => (selectedPath ? lessonsByPath(selectedPath.id) : []), [selectedPath]);
  const listData: AcademyListItem[] = selectedPath
    ? modulesByPath(selectedPath.id).flatMap((module) => [
        { id: module.id, kind: 'module-header' as const, title: module.title, description: module.description },
        ...currentLessons.filter((lesson) => lesson.moduleId === module.id)
      ])
    : learningPaths;

  const renderItem = useCallback(
    ({ item }: { item: AcademyListItem }) => {
      if ('kind' in item) {
        return (
          <GameCard style={{ borderColor: selectedPath?.color ?? colors.primary }}>
            <Text style={[styles.moduleTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{item.description}</Text>
          </GameCard>
        );
      }
      if ('recommendedLevel' in item) {
        return <LearningPathCard path={item} progress={progress} onOpen={() => setSelectedPath(item)} />;
      }
      const lessonIndex = currentLessons.findIndex((lesson) => lesson.id === item.id);
      const completed = progress.completedLessonIds.includes(item.id);
      const previousLesson = lessonIndex > 0 ? currentLessons[lessonIndex - 1] : undefined;
      const unlocked = completed || lessonIndex === 0 || (previousLesson ? progress.completedLessonIds.includes(previousLesson.id) : false);
      return <LessonCard lesson={item} completed={completed} locked={!unlocked} onOpen={() => navigate({ name: 'lesson', lessonId: item.id })} />;
    },
    [colors.muted, colors.primary, colors.text, currentLessons, navigate, progress, selectedPath?.color]
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedPath?.id]);

  const header = (
    <>
      <GameButton title={selectedPath ? 'Voltar as trilhas' : 'Voltar'} icon="chevron-back" variant="ghost" onPress={() => (selectedPath ? setSelectedPath(null) : goBack())} />
      <GameCard style={{ borderColor: selectedPath?.color ?? colors.primary }}>
        <View style={styles.heroRow}>
          <View style={[styles.heroIcon, { backgroundColor: colors.surfaceGlow, borderColor: selectedPath?.color ?? colors.primary }]}>
            <Ionicons name={selectedPath?.icon ?? 'school'} size={28} color={selectedPath?.color ?? colors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.kicker, { color: selectedPath?.color ?? colors.primary }]}>Academia Dev</Text>
            <Text style={[styles.title, { color: colors.text }]}>{selectedPath?.title ?? 'Escolha sua proxima aula.'}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {selectedPath?.description ?? `${stats.completedLessons}/${stats.totalLessons} aulas concluidas • ${stats.totalMinutesStudied} min estudados • 17 trilhas guiadas para estudar de verdade`}
            </Text>
          </View>
        </View>
        <GameButton
          title="Perguntar ao Professor Byte"
          icon="chatbubbles"
          variant="secondary"
          onPress={() =>
            navigate({
                name: 'professorByte',
                initialPrompt: selectedPath ? `Me ajude a estudar ${selectedPath.title}` : 'Me ajude a escolher uma trilha de estudo',
                context: { source: 'academy', topic: selectedPath?.title ?? 'Academia Dev', concept: selectedPath?.description },
                returnTo: { name: 'academy' }
              })
            }
          style={styles.inlineButton}
        />
      </GameCard>
    </>
  );

  return (
    <GradientScreen>
      <FlatList
        ref={listRef}
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcon: { width: 66, height: 66, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 4 },
  moduleTitle: { fontSize: 21, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  inlineButton: { marginTop: 14 },
  separator: { height: 14 }
});
