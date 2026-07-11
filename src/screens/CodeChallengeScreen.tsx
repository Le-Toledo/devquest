import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { CodeEditorSimulated } from '../components/CodeEditorSimulated';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { codeChallengeById } from '../data/codeChallenges';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { codeArenaService, defaultCodeArenaProgress } from '../services/codeArenaService';
import { reviewService } from '../services/reviewService';
import { localAnalyticsService } from '../services/localAnalyticsService';
import { professorByteAi } from '../services/professorByteAi';
import { CodeArenaProgress } from '../types/codeArena';

export function CodeChallengeScreen({ challengeId, challengeIds, goBack }: { challengeId: string; challengeIds?: string[]; goBack: () => void }) {
  const { colors } = useSettings();
  const { awardCampaignReward } = usePlayer();
  const [progress, setProgress] = useState<CodeArenaProgress>(defaultCodeArenaProgress);
  const [sessionIds] = useState(() => {
    const ids = challengeIds?.length ? challengeIds : [challengeId];
    return ids.includes(challengeId) ? ids : [challengeId, ...ids];
  });
  const [currentIndex, setCurrentIndex] = useState(() => Math.max(0, sessionIds.indexOf(challengeId)));
  const [selected, setSelected] = useState<number | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [correctInSession, setCorrectInSession] = useState(0);
  const [earnedInSession, setEarnedInSession] = useState({ xp: 0, coins: 0 });
  const [lastAnswerRewarded, setLastAnswerRewarded] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);
  const currentChallengeId = sessionIds[currentIndex] ?? challengeId;
  const challenge = codeChallengeById(currentChallengeId);
  const hasNextChallenge = currentIndex + 1 < sessionIds.length;

  useEffect(() => {
    codeArenaService.load().then(setProgress).catch(() => undefined);
  }, []);

  useEffect(() => {
    setSelected(null);
    setResolving(false);
    setAiHint('');
    setLoadingHint(false);
    setLastAnswerRewarded(false);
  }, [currentChallengeId]);

  if (!challenge) {
    return (
      <GradientScreen>
        <GameCard>
          <Text style={{ color: colors.text }}>Desafio não encontrado.</Text>
          <GameButton title="Voltar" onPress={goBack} />
        </GameCard>
      </GradientScreen>
    );
  }

  const choose = async (index: number) => {
    if (selected !== null || resolving) return;
    setResolving(true);
    setSelected(index);
    if (index === challenge.correctIndex) {
      const alreadyCompleted = progress.completedChallengeIds.includes(challenge.id);
      const next = alreadyCompleted ? progress : await codeArenaService.complete(progress, challenge.id);
      setProgress(next);
      setCorrectInSession((value) => value + 1);
      setLastAnswerRewarded(!alreadyCompleted);
      if (!alreadyCompleted) {
        setEarnedInSession((value) => ({ xp: value.xp + challenge.xpReward, coins: value.coins + challenge.coinReward }));
        awardCampaignReward(challenge.xpReward, challenge.coinReward, next.medals.includes('Arena Pro') ? ['code-arena-pro'] : [], {
          type: 'arena_challenge',
          xp: challenge.xpReward,
          language: challenge.areaId
        });
        localAnalyticsService.recordActivity({ challenge: true, areaId: challenge.areaId, combo: next.combo }).catch(() => undefined);
      }
    } else {
      setLastAnswerRewarded(false);
      const next = await codeArenaService.markReview(progress, challenge.id);
      setProgress(next);
      await reviewService.saveArenaError({
        challengeId: challenge.id,
        prompt: challenge.title,
        areaId: challenge.areaId,
        concept: challenge.concept,
        difficulty: challenge.difficulty,
        selectedAnswer: challenge.options[index] ?? 'Sem resposta',
        correctAnswer: challenge.options[challenge.correctIndex] ?? 'Resposta correta',
        explanation: challenge.explanation,
        hint: challenge.hint,
        codeExample: challenge.code
      });
    }
    setResolving(false);
  };

  const advance = () => {
    if (hasNextChallenge) {
      setCurrentIndex((value) => value + 1);
      return;
    }
    setSessionFinished(true);
  };

  const askHint = async () => {
    if (!challenge || loadingHint) return;
    setLoadingHint(true);
    try {
      const result = await professorByteAi.ask('Preciso de uma dica para resolver este desafio de código.', {
        source: 'arena',
        aiMode: selected === null ? 'hint' : 'explanation',
        topic: challenge.title,
        language: challenge.language,
        concept: challenge.concept,
        code: challenge.code,
        options: challenge.options,
        selectedAnswer: selected === null ? undefined : challenge.options[selected],
        correctAnswer: selected === null ? undefined : challenge.options[challenge.correctIndex]
      });
      setAiHint(result.answer);
    } finally {
      setLoadingHint(false);
    }
  };

  if (sessionFinished) {
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameCard style={{ borderColor: colors.success }}>
            <Text style={[styles.kicker, { color: colors.success }]}>Bloco concluído</Text>
            <Text style={[styles.title, { color: colors.text }]}>Arena finalizada</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Você resolveu {correctInSession} de {sessionIds.length} desafios neste bloco.</Text>
            <Text style={[styles.reward, { color: colors.text }]}>+{earnedInSession.xp} XP • +{earnedInSession.coins} moedas</Text>
          </GameCard>
          <GameButton title="Continuar Jornada" icon="arrow-forward" onPress={goBack} />
        </ScrollView>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar para Arena" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard style={{ borderColor: colors.secondary }}>
          <Text style={[styles.kicker, { color: colors.secondary }]}>{challenge.language} • {challenge.difficulty}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{challenge.title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Desafio {currentIndex + 1} de {sessionIds.length} • {challenge.description}</Text>
        </GameCard>
        <CodeEditorSimulated challenge={challenge} selected={selected} onSelect={choose} />
        <GameButton
          title={aiHint ? 'Pedir outra dica ao Byte' : 'Pedir dica ao Byte'}
          icon="bulb"
          variant="secondary"
          onPress={askHint}
          loading={loadingHint}
          disabled={loadingHint}
        />
        {aiHint || loadingHint ? (
          <GameCard style={{ borderColor: colors.primary }}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Professor Byte</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{loadingHint ? 'Professor Byte está pensando...' : aiHint}</Text>
          </GameCard>
        ) : null}
        {selected !== null ? (
          <GameCard style={{ borderColor: selected === challenge.correctIndex ? colors.success : colors.danger }}>
            <Text style={[styles.sectionTitle, { color: selected === challenge.correctIndex ? colors.success : colors.danger }]}>
              {selected === challenge.correctIndex ? 'Desafio concluído' : 'Bug enviado para revisão'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{challenge.explanation}</Text>
            <Text style={[styles.reward, { color: colors.text }]}>
              {selected === challenge.correctIndex
                ? lastAnswerRewarded
                  ? `+${challenge.xpReward} XP • +${challenge.coinReward} moedas`
                  : 'Desafio já concluído antes; XP e moedas não foram duplicados.'
                : 'Professor Byte salvou este ponto para revisar depois.'}
            </Text>
            {selected !== challenge.correctIndex ? <GameButton title="Tentar novamente" icon="refresh" variant="secondary" onPress={() => setSelected(null)} /> : null}
            {selected === challenge.correctIndex ? <GameButton title={hasNextChallenge ? 'Próximo desafio' : 'Ver resultado'} icon="arrow-forward" onPress={advance} /> : null}
          </GameCard>
        ) : null}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  reward: { marginTop: 8, marginBottom: 12, fontWeight: '900' }
});
