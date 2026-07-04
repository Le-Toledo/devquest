import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CodeChallengeCard } from '../components/CodeChallengeCard';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { codeChallenges } from '../data/codeChallenges';
import { useArena } from '../hooks/useArena';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';
import { CodeChallenge, CodeChallengeStatus } from '../types/codeArena';
import { Difficulty } from '../types/game';

const languages = ['Todas', 'JavaScript', 'TypeScript', 'Python', 'Java', 'Kotlin', 'SQL', 'HTML', 'CSS', 'React', 'Node.js', 'APIs REST', 'Git', 'Entrevista'];
const levels: (Difficulty | 'todos')[] = ['todos', 'iniciante', 'intermediario', 'avancado'];

export function CodeArenaScreen({ navigate, goBack }: { navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { progress } = useArena();
  const [language, setLanguage] = useState('Todas');
  const [level, setLevel] = useState<Difficulty | 'todos'>('todos');

  const statusFor = useCallback((id: string): CodeChallengeStatus => {
    if (progress.completedChallengeIds.includes(id)) return 'completed';
    if (progress.reviewChallengeIds.includes(id)) return 'review';
    return 'new';
  }, [progress.completedChallengeIds, progress.reviewChallengeIds]);

  const filtered = useMemo(
    () => codeChallenges.filter((challenge) => (language === 'Todas' || challenge.language === language) && (level === 'todos' || challenge.difficulty === level)),
    [language, level]
  );

  const renderChallenge = useCallback(
    ({ item }: { item: CodeChallenge }) => (
      <CodeChallengeCard challenge={item} status={statusFor(item.id)} onOpen={() => navigate({ name: 'codeChallenge', challengeId: item.id, challengeIds: filtered.map((challenge) => challenge.id) })} />
    ),
    [filtered, navigate, statusFor]
  );

  const openProfessorByte = () =>
    navigate({
      name: 'professorByte',
      initialPrompt: language === 'Todas' ? 'Crie um desafio de JavaScript' : `Crie um desafio de ${language}`,
      context: { source: 'arena', topic: 'Arena de Codigo', language: language === 'Todas' ? undefined : language, concept: level === 'todos' ? undefined : level },
      returnTo: { name: 'codeArena' }
    });

  const header = (
    <>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} hitSlop={8} style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.72 : 1 }]}>
            <Ionicons name="chevron-back" size={18} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Voltar</Text>
          </Pressable>
        </View>
        <GameCard style={{ ...styles.heroCard, borderColor: colors.secondary }}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: colors.surfaceGlow, borderColor: colors.secondary }]}>
              <Ionicons name="code-slash" size={20} color={colors.secondary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.kicker, { color: colors.secondary }]}>Arena de Codigo</Text>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>Treine como dev profissional.</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {progress.completedChallengeIds.length}/{codeChallenges.length} concluidos • combo {progress.combo}x • {progress.medals.length} medalhas
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Perguntar ao Professor Byte"
              onPress={openProfessorByte}
              hitSlop={8}
              style={({ pressed }) => [styles.byteButton, { backgroundColor: colors.surfaceGlow, borderColor: colors.secondary, opacity: pressed ? 0.78 : 1 }]}
            >
              <Ionicons name="chatbubbles" size={18} color={colors.secondary} />
            </Pressable>
          </View>
        </GameCard>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {languages.map((item) => {
            const selected = language === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setLanguage(item)}
                style={({ pressed }) => [
                  styles.filterPill,
                  {
                    backgroundColor: selected ? colors.primary : colors.surfaceGlow,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1
                  }
                ]}
              >
                <Text style={[styles.filterText, { color: selected ? colors.onAccent : colors.text }]} numberOfLines={1}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {levels.map((item) => {
            const selected = level === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setLevel(item)}
                style={({ pressed }) => [
                  styles.levelPill,
                  {
                    backgroundColor: selected ? colors.primary : 'transparent',
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1
                  }
                ]}
              >
                <Text style={[styles.filterText, { color: selected ? colors.onAccent : colors.text }]} numberOfLines={1}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
    </>
  );

  return (
    <GradientScreen>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderChallenge}
        ListHeaderComponent={header}
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 8, paddingBottom: 36 },
  topBar: { minHeight: 40, justifyContent: 'center' },
  backButton: { minHeight: 36, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 12 },
  backText: { fontSize: 14, fontWeight: '900' },
  heroCard: { padding: 10 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroIcon: { width: 40, height: 40, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  kicker: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 20, lineHeight: 23, fontWeight: '900', marginTop: 1 },
  subtitle: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  byteButton: { width: 38, height: 38, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterRow: { gap: 7, paddingRight: 16 },
  filterPill: { minHeight: 38, borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  levelPill: { minHeight: 36, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 12, lineHeight: 15, fontWeight: '900' },
  separator: { height: 10 }
});
