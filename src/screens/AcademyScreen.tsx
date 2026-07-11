import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { LearningPathCard } from '../components/LearningPathCard';
import { LessonCard } from '../components/LessonCard';
import { ProgressBar } from '../components/ProgressBar';
import { learningPaths } from '../data/learningPaths';
import { lessonsByPath, modulesByPath } from '../data/lessons';
import { useAcademy } from '../hooks/useAcademy';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';
import {
  AcademyLevelFilter,
  completionRatioForPath,
  filterLessons,
  filterPaths,
  lastOpenedLessonForPath,
  lessonStatusFor,
  moduleProgressForPath,
  nextRecommendedLesson
} from '../services/academyViewModel';
import { LearningPath, Lesson } from '../types/academy';

type AcademyListItem = LearningPath | Lesson | { id: string; kind: 'module-header'; title: string; description: string };

const levelFilters: AcademyLevelFilter[] = ['todos', 'iniciante', 'intermediario', 'avancado'];

export function AcademyScreen({ navigate, goBack }: { navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { progress, stats, loading } = useAcademy();
  const listRef = useRef<FlatList<AcademyListItem>>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<AcademyLevelFilter>('todos');

  const currentLessons = useMemo(() => (selectedPath ? lessonsByPath(selectedPath.id) : []), [selectedPath]);
  const filteredLessons = useMemo(() => filterLessons(currentLessons, query, level), [currentLessons, level, query]);
  const filteredPaths = useMemo(() => filterPaths(learningPaths, query, level), [level, query]);
  const nextLesson = useMemo(() => nextRecommendedLesson(progress, selectedPath?.id), [progress, selectedPath?.id]);
  const pathCompletion = useMemo(() => (selectedPath ? completionRatioForPath(selectedPath.id, progress) : undefined), [progress, selectedPath]);

  const listData: AcademyListItem[] = useMemo(() => {
    if (!selectedPath) return filteredPaths;
    return modulesByPath(selectedPath.id)
      .flatMap((module) => [
        { id: module.id, kind: 'module-header' as const, title: module.title, description: module.description },
        ...filteredLessons.filter((lesson) => lesson.moduleId === module.id)
      ])
      .filter((item) => !('kind' in item) || filteredLessons.some((lesson) => lesson.moduleId === item.id));
  }, [filteredLessons, filteredPaths, selectedPath]);

  const openLesson = useCallback((lessonId: string) => navigate({ name: 'lesson', lessonId }), [navigate]);

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
      const status = lessonStatusFor(item, currentLessons, progress);
      return (
        <LessonCard
          lesson={item}
          completed={status === 'completed'}
          status={status}
          locked={status === 'locked'}
          onOpen={() => openLesson(item.id)}
        />
      );
    },
    [colors.muted, colors.primary, colors.text, currentLessons, openLesson, progress, selectedPath?.color]
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [level, query, selectedPath?.id]);

  const header = (
    <>
      <GameButton title={selectedPath ? 'Voltar às trilhas' : 'Voltar'} icon="chevron-back" variant="ghost" onPress={() => (selectedPath ? setSelectedPath(null) : goBack())} />
      <GameCard style={{ borderColor: selectedPath?.color ?? colors.primary }}>
        <View style={styles.heroRow}>
          <View style={[styles.heroIcon, { backgroundColor: colors.surfaceGlow, borderColor: selectedPath?.color ?? colors.primary }]}>
            <Ionicons name={selectedPath?.icon ?? 'school'} size={28} color={selectedPath?.color ?? colors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.kicker, { color: selectedPath?.color ?? colors.primary }]}>Academia Dev</Text>
            <Text style={[styles.title, { color: colors.text }]}>{selectedPath?.title ?? 'Escolha sua próxima aula.'}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {selectedPath?.description ?? `${stats.completedLessons}/${stats.totalLessons} aulas concluídas • ${stats.totalMinutesStudied} min estudados • 17 trilhas guiadas`}
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

      <GameCard style={{ borderColor: colors.secondary }}>
        <Text style={[styles.kicker, { color: colors.secondary }]}>Continuar estudando</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{nextLesson?.title ?? 'Nenhuma aula pendente'}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {nextLesson ? `${nextLesson.moduleTitle ?? nextLesson.concept} • ${nextLesson.level ?? 'iniciante'} • ${nextLesson.estimatedMinutes} min` : 'Você concluiu as aulas disponíveis para os filtros atuais.'}
        </Text>
        {nextLesson ? <GameButton title="Abrir próxima aula" icon="play" variant="secondary" onPress={() => openLesson(nextLesson.id)} style={styles.inlineButton} /> : null}
      </GameCard>

      {selectedPath && pathCompletion ? (
        <GameCard>
          <View style={styles.progressRow}>
            <Text style={[styles.small, { color: colors.text }]}>Conclusão da trilha</Text>
            <Text style={[styles.small, { color: selectedPath.color }]}>{Math.round(pathCompletion.ratio * 100)}%</Text>
          </View>
          <ProgressBar value={pathCompletion.ratio} color={selectedPath.color} />
          <View style={styles.moduleGrid}>
            {moduleProgressForPath(selectedPath.id, progress).map((module) => (
              <View key={module.id} style={[styles.modulePill, { borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}>
                <Text style={[styles.modulePillTitle, { color: colors.text }]} numberOfLines={1}>{module.title}</Text>
                <Text style={[styles.small, { color: colors.muted }]}>{module.completed}/{module.total} • {Math.round(module.ratio * 100)}%</Text>
              </View>
            ))}
          </View>
        </GameCard>
      ) : null}

      {!selectedPath ? (
        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Última aula por trilha</Text>
          {learningPaths.slice(0, 6).map((path) => {
            const lesson = lastOpenedLessonForPath(path.id, progress);
            const ratio = completionRatioForPath(path.id, progress);
            return (
              <Pressable key={path.id} accessibilityRole="button" onPress={() => lesson && openLesson(lesson.id)} style={[styles.lastLessonRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.lastLessonPath, { color: path.color }]}>{path.title}</Text>
                <Text style={[styles.lastLessonTitle, { color: colors.text }]} numberOfLines={1}>{lesson?.title ?? 'Começar trilha'}</Text>
                <Text style={[styles.small, { color: colors.muted }]}>{Math.round(ratio.ratio * 100)}%</Text>
              </Pressable>
            );
          })}
        </GameCard>
      ) : null}

      <GameCard>
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar aula, conceito ou linguagem"
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <View style={styles.filterRow}>
          {levelFilters.map((item) => {
            const isSelected = level === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setLevel(item)}
                style={[styles.filterPill, { backgroundColor: isSelected ? colors.primary : colors.surfaceGlow, borderColor: isSelected ? colors.primary : colors.border }]}
              >
                <Text style={[styles.filterText, { color: isSelected ? colors.onAccent : colors.text }]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
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
        ListEmptyComponent={
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{loading ? 'Carregando Academia...' : 'Nenhum resultado encontrado'}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Ajuste a busca ou escolha outro nível para encontrar aulas compatíveis.</Text>
          </GameCard>
        }
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
  sectionTitle: { fontSize: 20, lineHeight: 24, fontWeight: '900' },
  moduleTitle: { fontSize: 21, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '800' },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  modulePill: { minHeight: 54, borderRadius: 8, borderWidth: 1, padding: 9, flexBasis: 136, flexGrow: 1 },
  modulePillTitle: { fontSize: 12, lineHeight: 15, fontWeight: '900' },
  lastLessonRow: { minHeight: 52, borderBottomWidth: 1, justifyContent: 'center', paddingVertical: 8 },
  lastLessonPath: { fontSize: 11, lineHeight: 14, fontWeight: '900', textTransform: 'uppercase' },
  lastLessonTitle: { fontSize: 14, lineHeight: 18, fontWeight: '900', marginTop: 2 },
  searchBox: { minHeight: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, minHeight: 48, fontSize: 14, fontWeight: '800' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filterPill: { minHeight: 48, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 12, lineHeight: 15, fontWeight: '900', textTransform: 'uppercase' },
  inlineButton: { marginTop: 14 },
  separator: { height: 14 }
});
