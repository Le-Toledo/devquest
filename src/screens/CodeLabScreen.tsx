import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CodeLabChallengeCard } from '../components/CodeLabChallengeCard';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressBar } from '../components/ProgressBar';
import { codeLabChallenges } from '../data/codeLabChallenges';
import { useCodeLab } from '../hooks/useCodeLab';
import { useReview } from '../hooks/useReview';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';
import { CodeLabChallenge, CodeLabChallengeKind } from '../types/codeLab';
import { Difficulty } from '../types/game';

const languages = ['Todas', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'HTML', 'CSS', 'React', 'React Native', 'Node.js', 'APIs REST', 'Git'];
const difficulties: (Difficulty | 'todas')[] = ['todas', 'iniciante', 'intermediario', 'avancado'];
const kinds: (CodeLabChallengeKind | 'todos')[] = ['todos', 'complete-code', 'fix-bug', 'predict-output', 'implement-function', 'refactor', 'sql-query', 'html-structure', 'css-layout', 'order-blocks', 'mini-project'];

export function CodeLabScreen({ navigate, goBack, initialConcept }: { navigate: Navigate; goBack: () => void; initialConcept?: string }) {
  const { colors } = useSettings();
  const { progress, stats, loading } = useCodeLab();
  const { stats: reviewStats } = useReview();
  const [language, setLanguage] = useState('Todas');
  const [difficulty, setDifficulty] = useState<Difficulty | 'todas'>('todas');
  const [kind, setKind] = useState<CodeLabChallengeKind | 'todos'>('todos');
  const [query, setQuery] = useState(initialConcept ?? '');

  const recommended = useMemo(() => {
    const hardConcept = reviewStats.hardestConcepts[0]?.label.toLowerCase();
    return codeLabChallenges.find((challenge) => hardConcept && challenge.concept.toLowerCase().includes(hardConcept)) ?? codeLabChallenges.find((challenge) => challenge.id === progress.currentChallengeId) ?? codeLabChallenges[0];
  }, [progress.currentChallengeId, reviewStats.hardestConcepts]);

  const filtered = useMemo(
    () =>
      codeLabChallenges.filter((challenge) => {
        const matchesLanguage = language === 'Todas' || challenge.language === language;
        const matchesDifficulty = difficulty === 'todas' || challenge.difficulty === difficulty;
        const matchesKind = kind === 'todos' || challenge.kind === kind;
        const text = [challenge.title, challenge.concept, challenge.language, challenge.tags.join(' ')].join(' ').toLowerCase();
        return matchesLanguage && matchesDifficulty && matchesKind && text.includes(query.trim().toLowerCase());
      }),
    [difficulty, kind, language, query]
  );

  const header = (
    <>
      <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
      <GameCard style={{ borderColor: colors.primary }}>
        <View style={styles.heroRow}>
          <View style={[styles.heroIcon, { borderColor: colors.primary, backgroundColor: colors.surfaceGlow }]}>
            <Ionicons name="terminal" size={28} color={colors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.kicker, { color: colors.primary }]}>Laboratório de Código</Text>
            <Text style={[styles.title, { color: colors.text }]}>Escreva, valide e aprenda.</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Validações seguras analisam estrutura e intenção. Nenhum código é executado no app.</Text>
          </View>
        </View>
        <ProgressBar value={stats.ratio} color={colors.primary} />
        <Text style={[styles.subtitle, { color: colors.muted }]}>{stats.completed}/{stats.total} concluídos • sequência atual {progress.currentStreak} • melhor sequência {progress.bestStreak}</Text>
        <GameButton title="Perguntar ao Professor Byte" icon="chatbubbles" variant="secondary" onPress={() => navigate({ name: 'professorByte', initialPrompt: 'Me ajude a praticar no Laboratório de Código', context: { source: 'codeLab', topic: 'Laboratório de Código' }, returnTo: { name: 'codeLab' } })} style={styles.inlineButton} />
      </GameCard>
      {recommended ? (
        <GameCard style={{ borderColor: colors.secondary }}>
          <Text style={[styles.kicker, { color: colors.secondary }]}>Recomendado</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{recommended.title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{recommended.language} • {recommended.concept}</Text>
          <GameButton title="Continuar praticando" icon="play" variant="secondary" onPress={() => navigate({ name: 'codeLabChallenge', challengeId: recommended.id, returnTo: { name: 'codeLab' } })} style={styles.inlineButton} />
        </GameCard>
      ) : null}
      <GameCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Progresso por linguagem</Text>
        {Object.entries(stats.byLanguage).slice(0, 8).map(([label, item]) => (
          <View key={label} style={styles.languageRow}>
            <Text style={[styles.small, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.small, { color: colors.muted }]}>{item.completed}/{item.total}</Text>
          </View>
        ))}
      </GameCard>
      <GameCard>
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar conceito" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text }]} />
        </View>
        <FilterRow values={languages} selected={language} onSelect={setLanguage} />
        <FilterRow values={difficulties} selected={difficulty} onSelect={setDifficulty} />
        <FilterRow values={kinds} selected={kind} onSelect={setKind} />
      </GameCard>
    </>
  );

  return (
    <GradientScreen>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: CodeLabChallenge }) => <CodeLabChallengeCard challenge={item} progress={progress} onOpen={() => navigate({ name: 'codeLabChallenge', challengeId: item.id, returnTo: { name: 'codeLab' } })} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{loading ? 'Carregando laboratório...' : 'Nenhum exercício encontrado'}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Ajuste os filtros ou busque outro conceito.</Text>
          </GameCard>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.container}
      />
    </GradientScreen>
  );
}

function FilterRow<T extends string>({ values, selected, onSelect }: { values: readonly T[]; selected: T; onSelect: (value: T) => void }) {
  const { colors } = useSettings();
  return (
    <View style={styles.filterRow}>
      {values.map((value) => {
        const active = value === selected;
        return (
          <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onSelect(value)} style={[styles.filterPill, { backgroundColor: active ? colors.primary : colors.surfaceGlow, borderColor: active ? colors.primary : colors.border }]}>
            <Text style={[styles.filterText, { color: active ? colors.onAccent : colors.text }]}>{value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  heroIcon: { width: 66, height: 66, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 28, lineHeight: 32, fontWeight: '900' },
  sectionTitle: { fontSize: 20, lineHeight: 24, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '800' },
  languageRow: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchBox: { minHeight: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, minHeight: 48, fontSize: 14, fontWeight: '800' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filterPill: { minHeight: 48, borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 12, lineHeight: 15, fontWeight: '900' },
  inlineButton: { marginTop: 14 },
  separator: { height: 12 }
});
