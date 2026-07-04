import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CodeBlock } from '../components/CodeBlock';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { QuickChallenge } from '../components/QuickChallenge';
import { learningPathById } from '../data/learningPaths';
import { lessonById, lessonsByPath } from '../data/lessons';
import { recommendedCodeChallengeFor } from '../data/codeChallenges';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { academyProgressService, defaultAcademyProgress } from '../services/academyProgressService';
import { reviewService } from '../services/reviewService';
import { localAnalyticsService } from '../services/localAnalyticsService';
import { Navigate } from '../navigation/routes';
import { AcademyProgress } from '../types/academy';

export function LessonScreen({ lessonId, navigate, goBack }: { lessonId: string; navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { awardCampaignReward } = usePlayer();
  const scrollRef = useRef<ScrollView>(null);
  const [progress, setProgress] = useState<AcademyProgress>(defaultAcademyProgress);
  const [showChallenge, setShowChallenge] = useState(false);
  const [completedNow, setCompletedNow] = useState(false);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const lesson = lessonById(lessonId);
  const path = lesson ? learningPathById(lesson.pathId) : undefined;
  const pathLessons = lesson ? lessonsByPath(lesson.pathId) : [];
  const lessonIndex = lesson ? pathLessons.findIndex((item) => item.id === lesson.id) : -1;
  const nextLesson = lessonIndex >= 0 ? pathLessons[lessonIndex + 1] : undefined;
  const previousLesson = lessonIndex > 0 ? pathLessons[lessonIndex - 1] : undefined;
  const lessonCompleted = lesson ? progress.completedLessonIds.includes(lesson.id) : false;
  const lessonUnlocked = lessonIndex <= 0 || lessonCompleted || (previousLesson ? progress.completedLessonIds.includes(previousLesson.id) : false);
  const recommendedChallenge = lesson ? recommendedCodeChallengeFor(lesson.areaId) : undefined;

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setShowChallenge(false);
    setCompletedNow(false);
    setSavingCompletion(false);
    setProgressLoaded(false);
    academyProgressService.load().then(setProgress).catch(() => undefined).finally(() => setProgressLoaded(true));
  }, [lessonId]);

  if (!lesson) {
    return (
      <GradientScreen>
        <GameCard>
          <Text style={{ color: colors.text }}>Aula não encontrada.</Text>
          <GameButton title="Voltar" onPress={goBack} />
        </GameCard>
      </GradientScreen>
    );
  }

  if (progressLoaded && !lessonUnlocked) {
    return (
      <GradientScreen>
        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aula bloqueada</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Conclua a etapa anterior e acerte o desafio rápido para liberar esta fase.</Text>
          <GameButton title="Voltar para Academia" icon="chevron-back" variant="secondary" onPress={goBack} />
        </GameCard>
      </GradientScreen>
    );
  }

  const completeLesson = async () => {
    if (savingCompletion) return;
    setSavingCompletion(true);
    try {
      const currentProgress = await academyProgressService.load();
      const alreadyCompleted = currentProgress.completedLessonIds.includes(lesson.id);
      const next = await academyProgressService.completeLesson(currentProgress, lesson.id);
      setProgress(next);
      setCompletedNow(true);
      const achievements = ['academy-first-lesson'];
      if (next.completedLessonIds.length >= 10) achievements.push('academy-10-lessons');
      if (next.completedLessonIds.length >= 25) achievements.push('academy-dedicated-student');
      if (next.completedLessonIds.length === 50) achievements.push('academy-master');
      if (lesson.pathId === 'backend-path' || lesson.pathId === 'frontend-path') achievements.push('academy-fullstack-training');
      if (lesson.pathId === 'kotlin-path') achievements.push('academy-kotlin-scholar');
      if (lesson.pathId === 'git-path') achievements.push('academy-git-guardian');
      if (!alreadyCompleted) awardCampaignReward(lesson.xpReward, lesson.coinReward, achievements);
      if (!alreadyCompleted) {
        localAnalyticsService.recordActivity({ lesson: true, minutes: lesson.estimatedMinutes, areaId: lesson.areaId }).catch(() => undefined);
      }
    } finally {
      setSavingCompletion(false);
    }
  };

  const wrongChallenge = async (selectedIndex: number) => {
    await reviewService.saveCampaignError({
      missionId: `lesson-${lesson.id}`,
      prompt: lesson.challenge.prompt,
      areaId: lesson.areaId,
      concept: lesson.concept,
      difficulty: 'iniciante',
      explanation: lesson.challenge.explanation,
      hint: lesson.professorTip
    });
  };

  return (
    <GradientScreen>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        <GameButton title="Voltar para Academia" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard style={{ borderColor: path?.color ?? colors.primary }}>
          <Text style={[styles.kicker, { color: path?.color ?? colors.primary }]}>{path?.title ?? 'Academia Dev'} • {lesson.estimatedMinutes} min</Text>
          <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{lesson.description}</Text>
          <View style={styles.progressMeta}>
            <Text style={[styles.metaPill, { color: colors.primary, borderColor: colors.primary }]}>{lesson.level ?? 'iniciante'}</Text>
            <Text style={[styles.metaPill, { color: colors.accent, borderColor: colors.accent }]}>{lesson.moduleTitle ?? lesson.concept}</Text>
          </View>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Objetivo da aula</Text>
          <Text style={[styles.body, { color: colors.text }]}>{lesson.objective ?? lesson.description}</Text>
          {lesson.prerequisites?.length ? (
          <Text style={[styles.supportText, { color: colors.muted }]}>Pré-requisitos: {lesson.prerequisites.join(' • ')}</Text>
          ) : null}
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Explicação completa</Text>
          <Text style={[styles.body, { color: colors.text }]}>{lesson.content}</Text>
        </GameCard>

        {lesson.sections?.map((section) => (
          <GameCard key={section.title}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.body, { color: colors.text }]}>{section.body}</Text>
            {section.code ? <CodeBlock code={section.code} /> : null}
          </GameCard>
        ))}

        {lesson.codeExample ? <CodeBlock code={lesson.codeExample} /> : null}

        {lesson.commonMistakes?.length ? (
          <GameCard style={{ borderColor: colors.danger }}>
            <Text style={[styles.sectionTitle, { color: colors.danger }]}>Erros comuns</Text>
            {lesson.commonMistakes.map((item) => (
              <Text key={item} style={[styles.listItem, { color: colors.text }]}>• {item}</Text>
            ))}
          </GameCard>
        ) : null}

        {lesson.bestPractices?.length ? (
          <GameCard style={{ borderColor: colors.success }}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>Boas práticas</Text>
            {lesson.bestPractices.map((item) => (
              <Text key={item} style={[styles.listItem, { color: colors.text }]}>• {item}</Text>
            ))}
          </GameCard>
        ) : null}

        <GameCard style={{ borderColor: colors.primary }}>
          <Text style={[styles.kicker, { color: colors.primary }]}>Dica do Professor Byte</Text>
          <Text style={[styles.body, { color: colors.text }]}>{lesson.professorTip}</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumo final</Text>
          <Text style={[styles.body, { color: colors.text }]}>{lesson.summary ?? lesson.content}</Text>
          {lesson.tags?.length ? <Text style={[styles.supportText, { color: colors.muted }]}>Tags: {lesson.tags.join(', ')}</Text> : null}
        </GameCard>

        {showChallenge ? (
          <QuickChallenge challenge={lesson.challenge} onCorrect={completeLesson} onWrong={wrongChallenge} />
        ) : (
          <GameButton title="Responder desafio rápido" icon="flash" onPress={() => setShowChallenge(true)} disabled={!progressLoaded} loading={!progressLoaded} />
        )}

        {lessonCompleted || completedNow ? (
          <GameCard style={{ borderColor: colors.success }}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>Aula concluída</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Progresso salvo. {nextLesson ? `A próxima etapa está liberada: ${nextLesson.title}.` : 'Você concluiu a última etapa desta trilha.'}
            </Text>
            <GameButton
              title={nextLesson ? 'Continuar para próxima fase' : 'Voltar para Academia'}
              icon={nextLesson ? 'arrow-forward' : 'school'}
              variant="secondary"
              onPress={() => (nextLesson ? navigate({ name: 'lesson', lessonId: nextLesson.id }) : goBack())}
              style={styles.inlineButton}
            />
          </GameCard>
        ) : (
          <GameCard style={{ borderColor: colors.primary }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Desbloqueio da etapa</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Para concluir esta aula e liberar a próxima fase, responda corretamente o desafio rápido.</Text>
          </GameCard>
        )}
        {recommendedChallenge ? (
          <GameCard style={{ borderColor: colors.secondary }}>
            <Text style={[styles.kicker, { color: colors.secondary }]}>Prática recomendada</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{recommendedChallenge.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Depois desta aula, procure a Arena de Código para treinar esse conceito em um desafio simulado.</Text>
          </GameCard>
        ) : null}
        {completedNow ? (
          <GameCard style={{ borderColor: colors.success }}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>Professor Byte: aula registrada!</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>+{lesson.xpReward} XP • +{lesson.coinReward} moedas. Essa base agora ajuda nas missões, bosses e revisões.</Text>
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
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22 },
  supportText: { marginTop: 10, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  progressMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metaPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  listItem: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  inlineButton: { marginTop: 14 }
});
