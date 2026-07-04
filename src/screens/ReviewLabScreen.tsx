import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

export function ReviewLabScreen({ goBack, navigate }: { goBack: () => void; navigate: Navigate }) {
  const { colors } = useSettings();
  const { awardCampaignReward } = usePlayer();
  const { errors, setErrors, stats } = useReview();
  const [selected, setSelected] = useState<ReviewError | null>(null);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const dueToday = errors.filter((error) => !error.learnedAt && error.priority === 'today').length;

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
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameButton title="Voltar ao laboratorio" icon="chevron-back" variant="ghost" onPress={() => { setSelected(null); setLastResult(null); }} />
          <GameCard>
            <Text style={[styles.kicker, { color: colors.accent }]}>Sessao de revisao</Text>
            <Text style={[styles.title, { color: colors.text }]}>{selected.prompt}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Professor Byte vai desmontar esse bug em partes pequenas.</Text>
          </GameCard>
          <MentorExplanation error={selected} simplified={lastResult === 'wrong'} />
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
                {lastResult === 'correct' ? 'Boa revisao!' : 'Tudo bem, vamos simplificar.'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {lastResult === 'correct'
                  ? 'Intervalo aumentado, XP entregue e o bug perdeu forca.'
                  : 'Intervalo reduzido para revisar hoje. Persistencia tambem da recompensa.'}
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
              <Text style={[styles.kicker, { color: colors.primary }]}>Laboratorio de Revisao</Text>
              <Text style={[styles.title, { color: colors.text }]}>Transforme bugs em XP.</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>O Professor Byte organiza seus erros por prioridade e usa repeticao espacada para fixar conceitos.</Text>
            </View>
          </View>
          <GameButton title="Perguntar ao Professor Byte" icon="chatbubbles" variant="secondary" onPress={() => navigate({ name: 'professorByte', initialPrompt: 'Explique meu erro', context: { source: 'review', topic: 'Laboratorio de Revisao' }, returnTo: { name: 'reviewLab' } })} style={styles.inlineButton} />
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

        {errors.length === 0 ? (
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nenhum erro salvo ainda</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Quando voce errar quizzes ou missoes de campanha, eles aparecerao aqui para revisao inteligente.</Text>
          </GameCard>
        ) : (
          errors.map((error) => <ErrorReviewCard key={error.id} error={error} onReview={() => setSelected(error)} onLearned={() => markLearned(error.id)} />)
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
  inlineButton: { marginTop: 14 }
});
