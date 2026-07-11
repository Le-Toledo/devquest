import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ErrorReviewCard } from '../components/ErrorReviewCard';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { MentorExplanation } from '../components/MentorExplanation';
import { ProgressBar } from '../components/ProgressBar';
import { usePlayer } from '../hooks/usePlayer';
import { useReview } from '../hooks/useReview';
import { useSettings } from '../hooks/useSettings';
import { reviewService } from '../services/reviewService';
import { localAnalyticsService } from '../services/localAnalyticsService';
import { ReviewError } from '../types/review';
import { Navigate } from '../navigation/routes';
import { AreaId } from '../types/game';

type SourceFilter = 'todas' | ReviewError['source'];
type PriorityFilter = 'todas' | ReviewError['priority'];

const sourceLabels: Record<SourceFilter, string> = {
  todas: 'Todas',
  quiz: 'Quiz',
  campaign: 'Campanha',
  academy: 'Academia',
  arena: 'Arena',
  codeLab: 'Laboratório'
};

const priorityLabels: Record<PriorityFilter, string> = {
  todas: 'Todas',
  today: 'Hoje',
  tomorrow: 'Amanhã',
  'three-days': 'Três dias',
  'seven-days': 'Sete dias'
};

export function ReviewLabScreen({ goBack, navigate }: { goBack: () => void; navigate: Navigate }) {
  const { colors } = useSettings();
  const { awardCampaignReward } = usePlayer();
  const { errors, setErrors, stats } = useReview();
  const [selected, setSelected] = useState<ReviewError | null>(null);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('todas');
  const [languageFilter, setLanguageFilter] = useState<AreaId | 'todas'>('todas');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('todas');
  const dueToday = errors.filter((error) => !error.learnedAt && error.priority === 'today').length;
  const sourceCounts = errors.reduce<Record<ReviewError['source'], number>>(
    (acc, error) => ({ ...acc, [error.source]: (acc[error.source] ?? 0) + 1 }),
    { quiz: 0, campaign: 0, academy: 0, arena: 0, codeLab: 0 }
  );
  const languageOptions = Array.from(new Set(errors.map((error) => error.areaId)));
  const filteredErrors = errors.filter((error) => {
    const sourceMatches = sourceFilter === 'todas' || error.source === sourceFilter;
    const languageMatches = languageFilter === 'todas' || error.areaId === languageFilter;
    const priorityMatches = priorityFilter === 'todas' || error.priority === priorityFilter;
    return sourceMatches && languageMatches && priorityMatches;
  });

  const markLearned = async (errorId: string) => {
    const next = await reviewService.markLearned(errorId);
    setErrors(next);
    setSelected((current) => (current?.id === errorId ? next.find((error) => error.id === errorId) ?? null : current));
    const learnedCount = next.filter((error) => error.learnedAt).length;
    const achievements = ['review-learned-bug'];
    if (learnedCount >= 10) achievements.push('review-10-fixed');
    awardCampaignReward(35, 15, achievements);
  };

  const answerReview = async (correct: boolean) => {
    if (!selected) return;
    const next = await reviewService.answerReview(selected.id, correct);
    setErrors(next);
    const updated = next.find((error) => error.id === selected.id) ?? selected;
    setSelected(updated);
    setLastResult(correct ? 'correct' : 'wrong');
    if (correct) {
      const achievements = ['review-learned-bug'];
      if (updated.correctReviewCount + 1 >= 3) achievements.push('review-perfect');
      if (updated.intervalDays >= 7) achievements.push('review-persistence-master');
      awardCampaignReward(55, 25, achievements);
      localAnalyticsService.recordActivity({ review: true }).catch(() => undefined);
    } else {
      awardCampaignReward(10, 5, ['review-never-give-up']);
    }
  };

  if (selected) {
    const canOpenRelated = selected.source === 'academy' || selected.source === 'arena' || selected.source === 'codeLab';
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameButton title="Voltar ao laboratório" icon="chevron-back" variant="ghost" onPress={() => { setSelected(null); setLastResult(null); }} />
          <GameCard>
            <Text style={[styles.kicker, { color: colors.accent }]}>Sessão de revisão</Text>
            <Text style={[styles.title, { color: colors.text }]}>{selected.prompt}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Professor Byte vai desmontar esse bug em partes pequenas.</Text>
          </GameCard>
          <MentorExplanation error={selected} simplified={lastResult === 'wrong'} />
          {canOpenRelated ? (
            <GameButton
              title={selected.source === 'academy' ? 'Voltar para a aula' : selected.source === 'codeLab' ? 'Abrir Laboratório de Código' : 'Abrir desafio da Arena'}
              icon={selected.source === 'academy' ? 'school' : selected.source === 'codeLab' ? 'terminal' : 'code-slash'}
              variant="secondary"
              onPress={() =>
                selected.source === 'academy'
                  ? navigate({ name: 'lesson', lessonId: selected.sourceId })
                  : selected.source === 'codeLab'
                    ? navigate({ name: 'codeLabChallenge', challengeId: selected.sourceId, returnTo: { name: 'reviewLab' } })
                  : navigate({ name: 'codeChallenge', challengeId: selected.sourceId, challengeIds: [selected.sourceId] })
              }
            />
          ) : null}
          <GameButton
            title="Perguntar ao Professor Byte"
            icon="chatbubbles"
            variant="secondary"
            onPress={() =>
              navigate({
                name: 'professorByte',
                initialPrompt: 'Explique meu erro',
                context: {
                  source: 'review',
                  topic: selected.prompt,
                  language: selected.areaId,
                  concept: selected.concept,
                  errorPrompt: selected.prompt,
                  selectedAnswer: selected.selectedAnswer,
                  correctAnswer: selected.correctAnswer,
                  code: selected.codeExample
                },
                returnTo: { name: 'reviewLab' }
              })
            }
          />
          {lastResult ? (
            <GameCard style={{ borderColor: lastResult === 'correct' ? colors.success : colors.danger }}>
              <Text style={[styles.sectionTitle, { color: lastResult === 'correct' ? colors.success : colors.danger }]}>
                {lastResult === 'correct' ? 'Boa revisão!' : 'Tudo bem, vamos simplificar.'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {lastResult === 'correct'
                  ? 'Intervalo aumentado, XP entregue e o bug perdeu força.'
                  : 'Intervalo reduzido para revisar hoje. Persistência também dá recompensa.'}
              </Text>
            </GameCard>
          ) : null}
          <View style={styles.actions}>
            <GameButton title="Acertei" icon="checkmark" onPress={() => answerReview(true)} style={styles.actionButton} />
            <GameButton title="Errei" icon="refresh" variant="secondary" onPress={() => answerReview(false)} style={styles.actionButton} />
          </View>
          <GameButton title="Marcar como aprendido" icon="school" variant="ghost" onPress={() => markLearned(selected.id)} />
        </ScrollView>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard style={{ borderColor: colors.primary }}>
          <View style={styles.heroRow}>
            <View style={[styles.heroIcon, { backgroundColor: colors.surfaceGlow, borderColor: colors.primary }]}>
              <Ionicons name="flask" size={28} color={colors.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.kicker, { color: colors.primary }]}>Laboratório de Revisão</Text>
              <Text style={[styles.title, { color: colors.text }]}>Transforme bugs em XP.</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>O Professor Byte organiza seus erros por prioridade e usa repetição espaçada para fixar conceitos.</Text>
            </View>
          </View>
          <GameButton title="Perguntar ao Professor Byte" icon="chatbubbles" variant="secondary" onPress={() => navigate({ name: 'professorByte', initialPrompt: 'Explique meu erro', context: { source: 'review', topic: 'Laboratório de Revisão' }, returnTo: { name: 'reviewLab' } })} style={styles.inlineButton} />
          <View style={styles.progressRow}>
            <Text style={[styles.small, { color: colors.muted }]}>{stats.learnedErrors}/{stats.totalErrors} aprendidos</Text>
            <Text style={[styles.small, { color: colors.accent }]}>{stats.improvementRate}% melhora</Text>
          </View>
          <ProgressBar value={stats.totalErrors === 0 ? 0 : stats.learnedErrors / stats.totalErrors} color={colors.primary} />
        </GameCard>

        <View style={styles.statsGrid}>
          <GameCard style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.danger }]}>{dueToday}</Text>
            <Text style={[styles.small, { color: colors.muted }]}>revisar hoje</Text>
          </GameCard>
          <GameCard style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{stats.learnedErrors}</Text>
            <Text style={[styles.small, { color: colors.muted }]}>aprendidos</Text>
          </GameCard>
        </View>

        {stats.hardestLanguages.length ? (
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Maiores dificuldades</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Linguagens: {stats.hardestLanguages.map((item) => `${item.label} (${item.count})`).join(', ')}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Conceitos: {stats.hardestConcepts.map((item) => `${item.label} (${item.count})`).join(', ')}</Text>
          </GameCard>
        ) : null}

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Filtros</Text>
          <View style={styles.filterRow}>
            {(['todas', 'quiz', 'campaign', 'academy', 'arena', 'codeLab'] satisfies SourceFilter[]).map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: sourceFilter === item }}
                onPress={() => setSourceFilter(item)}
                style={[styles.filterPill, { borderColor: sourceFilter === item ? colors.primary : colors.border, backgroundColor: sourceFilter === item ? colors.primary : colors.surfaceGlow }]}
              >
                <Text style={[styles.filterText, { color: sourceFilter === item ? colors.onAccent : colors.text }]}>
                  {sourceLabels[item]}{item !== 'todas' ? ` ${sourceCounts[item]}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.filterRow}>
            <Pressable accessibilityRole="button" onPress={() => setLanguageFilter('todas')} style={[styles.filterPill, { borderColor: languageFilter === 'todas' ? colors.primary : colors.border, backgroundColor: languageFilter === 'todas' ? colors.primary : colors.surfaceGlow }]}>
              <Text style={[styles.filterText, { color: languageFilter === 'todas' ? colors.onAccent : colors.text }]}>Todas linguagens</Text>
            </Pressable>
            {languageOptions.map((item) => (
              <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: languageFilter === item }} onPress={() => setLanguageFilter(item)} style={[styles.filterPill, { borderColor: languageFilter === item ? colors.primary : colors.border, backgroundColor: languageFilter === item ? colors.primary : colors.surfaceGlow }]}>
                <Text style={[styles.filterText, { color: languageFilter === item ? colors.onAccent : colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.filterRow}>
            {(['todas', 'today', 'tomorrow', 'three-days', 'seven-days'] satisfies PriorityFilter[]).map((item) => (
              <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: priorityFilter === item }} onPress={() => setPriorityFilter(item)} style={[styles.filterPill, { borderColor: priorityFilter === item ? colors.primary : colors.border, backgroundColor: priorityFilter === item ? colors.primary : colors.surfaceGlow }]}>
                <Text style={[styles.filterText, { color: priorityFilter === item ? colors.onAccent : colors.text }]}>{priorityLabels[item]}</Text>
              </Pressable>
            ))}
          </View>
        </GameCard>

        {errors.length === 0 ? (
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nenhum erro salvo ainda</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Quando você errar quizzes, aulas, campanhas ou desafios da Arena, eles aparecerão aqui para revisão inteligente.</Text>
          </GameCard>
        ) : filteredErrors.length === 0 ? (
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nenhuma revisão para este filtro</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Troque a origem, linguagem ou prioridade para ver outros pontos salvos.</Text>
          </GameCard>
        ) : (
          filteredErrors.map((error) => <ErrorReviewCard key={error.id} error={error} onReview={() => setSelected(error)} onLearned={() => markLearned(error.id)} />)
        )}
      </ScrollView>
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
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  small: { fontSize: 12, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flexBasis: 140, flexGrow: 1, alignItems: 'center' },
  statNumber: { fontSize: 30, fontWeight: '900' },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionButton: { flexBasis: 132, flexGrow: 1 },
  inlineButton: { marginTop: 14 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filterPill: { minHeight: 48, borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 12, lineHeight: 15, fontWeight: '900', textTransform: 'uppercase' }
});
