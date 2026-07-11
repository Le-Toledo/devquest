import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CodeBlock } from '../components/CodeBlock';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { QuickChallenge } from '../components/QuickChallenge';
import { ProgressBar } from '../components/ProgressBar';
import { learningPathById } from '../data/learningPaths';
import { lessonById, lessonsByPath } from '../data/lessons';
import { recommendedCodeChallengeFor } from '../data/codeChallenges';
import { codeLabChallengesForConcept } from '../data/codeLabChallenges';
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
  const [rewardGranted, setRewardGranted] = useState(false);
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
  const recommendedChallenge = lesson ? recommendedCodeChallengeFor(lesson.areaId, lesson.concept) : undefined;
  const recommendedLabChallenge = lesson ? codeLabChallengesForConcept(lesson.areaId, lesson.concept)[0] : undefined;
  const attempts = lesson ? progress.lessonAttempts[lesson.id] ?? [] : [];
  const completedExercises = lesson?.exercises?.filter((exercise) => progress.completedExerciseIds.includes(exercise.id)).length ?? 0;
  const totalExercises = lesson?.exercises?.length ?? 0;
  const pathProgress = pathLessons.length ? (lessonIndex + 1) / pathLessons.length : 0;
  const professionalCodeIsRepeated = Boolean(lesson?.professionalExample?.code && lesson.professionalExample.code === lesson.codeExample);
  const sectionsWithoutRepeatedCode = useMemo(
    () => lesson?.sections?.filter((section) => section.title !== 'Exemplo em código' || section.code !== lesson.codeExample) ?? [],
    [lesson]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setShowChallenge(false);
    setCompletedNow(false);
    setRewardGranted(false);
    setSavingCompletion(false);
    setProgressLoaded(false);
    academyProgressService.load()
      .then((loaded) => academyProgressService.markOpened(loaded, lessonId))
      .then(setProgress)
      .catch(() => undefined)
      .finally(() => setProgressLoaded(true));
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

  const completeLesson = async (selectedIndex: number) => {
    if (savingCompletion) return;
    setSavingCompletion(true);
    try {
      const currentProgress = await academyProgressService.load();
      const alreadyCompleted = currentProgress.completedLessonIds.includes(lesson.id);
      const alreadyRewarded = currentProgress.rewardedLessonIds.includes(lesson.id);
      const attempted = await academyProgressService.recordChallengeAttempt(currentProgress, { lessonId: lesson.id, selectedIndex, correct: true });
      const next = await academyProgressService.completeLesson(attempted, lesson.id);
      const finalProgress = alreadyRewarded ? next : await academyProgressService.markRewarded(next, lesson.id);
      setProgress(finalProgress);
      setCompletedNow(true);
      setRewardGranted(!alreadyRewarded);
      const achievements = ['academy-first-lesson'];
      if (next.completedLessonIds.length >= 10) achievements.push('academy-10-lessons');
      if (next.completedLessonIds.length >= 25) achievements.push('academy-dedicated-student');
      if (next.completedLessonIds.length === 50) achievements.push('academy-master');
      if (lesson.pathId === 'backend-path' || lesson.pathId === 'frontend-path') achievements.push('academy-fullstack-training');
      if (lesson.pathId === 'kotlin-path') achievements.push('academy-kotlin-scholar');
      if (lesson.pathId === 'git-path') achievements.push('academy-git-guardian');
      if (!alreadyRewarded) awardCampaignReward(lesson.xpReward, lesson.coinReward, achievements, { type: 'academy_lesson', xp: lesson.xpReward, language: lesson.areaId });
      if (!alreadyCompleted) {
        localAnalyticsService.recordActivity({ lesson: true, minutes: lesson.estimatedMinutes, areaId: lesson.areaId }).catch(() => undefined);
      }
    } finally {
      setSavingCompletion(false);
    }
  };

  const wrongChallenge = async (selectedIndex: number) => {
    const error = await reviewService.saveAcademyError({
      lessonId: lesson.id,
      prompt: lesson.challenge.prompt,
      areaId: lesson.areaId,
      concept: lesson.concept,
      difficulty: 'iniciante',
      selectedAnswer: lesson.challenge.options[selectedIndex] ?? 'Sem resposta',
      correctAnswer: lesson.challenge.options[lesson.challenge.correctIndex] ?? 'Resposta correta',
      explanation: lesson.challenge.explanation,
      hint: lesson.professorTip,
      codeExample: lesson.codeExample
    });
    const currentProgress = await academyProgressService.load();
    const next = await academyProgressService.recordChallengeAttempt(currentProgress, {
      lessonId: lesson.id,
      selectedIndex,
      correct: false,
      reviewErrorId: error.id
    });
    setProgress(next);
  };

  const completeExercise = async (exerciseId: string) => {
    const currentProgress = await academyProgressService.load();
    const next = await academyProgressService.completeExercise(currentProgress, exerciseId);
    setProgress(next);
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
          <View style={styles.lessonProgressBlock}>
            <View style={styles.progressRow}>
              <Text style={[styles.supportTextInline, { color: colors.muted }]}>Aula {lessonIndex + 1} de {pathLessons.length}</Text>
              <Text style={[styles.supportTextInline, { color: path?.color ?? colors.primary }]}>{Math.round(pathProgress * 100)}% da trilha</Text>
            </View>
            <ProgressBar value={pathProgress} color={path?.color ?? colors.primary} />
            <Text style={[styles.supportText, { color: colors.muted }]}>{completedExercises}/{totalExercises} exercícios concluídos nesta aula.</Text>
          </View>
          <GameButton
            title="Perguntar ao Professor Byte"
            icon="chatbubbles"
            variant="secondary"
            onPress={() =>
              navigate({
                name: 'professorByte',
                initialPrompt: `Explique a aula ${lesson.title}`,
                context: {
                  source: 'academy',
                  topic: lesson.title,
                  language: path?.title,
                  concept: lesson.concept,
                  code: lesson.codeExample
                },
                returnTo: { name: 'lesson', lessonId: lesson.id }
              })
            }
            style={styles.inlineButton}
          />
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

        {sectionsWithoutRepeatedCode.map((section) => (
          <GameCard key={section.title}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.body, { color: colors.text }]}>{section.body}</Text>
            {section.code ? <CodeBlock code={section.code} /> : null}
          </GameCard>
        ))}

        {lesson.professionalExample ? (
          <GameCard style={{ borderColor: colors.secondary }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exemplo profissional</Text>
            <Text style={[styles.body, { color: colors.text }]}>{lesson.professionalExample.scenario}</Text>
            {lesson.professionalExample.code && !professionalCodeIsRepeated ? <CodeBlock code={lesson.professionalExample.code} /> : null}
            <Text style={[styles.supportText, { color: colors.muted }]}>{lesson.professionalExample.walkthrough}</Text>
          </GameCard>
        ) : null}

        {lesson.exercises?.length ? (
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercícios progressivos</Text>
            {lesson.exercises.map((exercise, index) => (
              <View key={exercise.id} style={[styles.exerciseBlock, index > 0 ? { borderTopColor: colors.border, borderTopWidth: 1 } : null]}>
                <Text style={[styles.kicker, { color: colors.accent }]}>{exercise.level}</Text>
                <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exercise.title}</Text>
                <Text style={[styles.body, { color: colors.text }]}>{exercise.prompt}</Text>
                {exercise.acceptanceCriteria.map((criterion) => (
                  <Text key={criterion} style={[styles.listItem, { color: colors.muted }]}>• {criterion}</Text>
                ))}
                <Text style={[styles.supportText, { color: colors.muted }]}>Dica: {exercise.hint}</Text>
                <Text style={[styles.supportText, { color: colors.muted }]}>Solução esperada: {exercise.solution}</Text>
                <GameButton
                  title={progress.completedExerciseIds.includes(exercise.id) ? 'Exercício concluído' : 'Marcar exercício como concluído'}
                  icon={progress.completedExerciseIds.includes(exercise.id) ? 'checkmark' : 'school'}
                  variant="secondary"
                  disabled={progress.completedExerciseIds.includes(exercise.id)}
                  onPress={() => completeExercise(exercise.id)}
                  style={styles.inlineButton}
                />
              </View>
            ))}
          </GameCard>
        ) : null}

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

        {attempts.length ? (
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tentativas salvas</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {attempts.length} tentativa{attempts.length === 1 ? '' : 's'} registrada{attempts.length === 1 ? '' : 's'} nesta aula • {attempts.filter((attempt) => attempt.correct).length} correta{attempts.filter((attempt) => attempt.correct).length === 1 ? '' : 's'}.
            </Text>
          </GameCard>
        ) : null}

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
            <Text style={[styles.subtitle, { color: colors.muted }]}>Depois desta aula, treine {lesson.concept} na Arena com um desafio simulado selecionado por conceito.</Text>
            <GameButton
              title="Abrir desafio na Arena"
              icon="code-slash"
              variant="secondary"
              onPress={() => navigate({ name: 'codeChallenge', challengeId: recommendedChallenge.id, challengeIds: [recommendedChallenge.id] })}
              style={styles.inlineButton}
            />
          </GameCard>
        ) : null}
        {recommendedLabChallenge ? (
          <GameCard style={{ borderColor: colors.primary }}>
            <Text style={[styles.kicker, { color: colors.primary }]}>Laboratório de Código</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{recommendedLabChallenge.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Escreva uma solução relacionada a {lesson.concept} com validação segura, sem execução arbitrária.</Text>
            <GameButton
              title="Abrir no Laboratório"
              icon="terminal"
              variant="secondary"
              onPress={() => navigate({ name: 'codeLabChallenge', challengeId: recommendedLabChallenge.id, returnTo: { name: 'lesson', lessonId: lesson.id } })}
              style={styles.inlineButton}
            />
          </GameCard>
        ) : (
          <GameButton title="Buscar no Laboratório de Código" icon="terminal" variant="secondary" onPress={() => navigate({ name: 'codeLab', initialConcept: lesson.concept })} />
        )}
        {completedNow ? (
          <GameCard style={{ borderColor: colors.success }}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>Professor Byte: aula registrada!</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {rewardGranted ? `+${lesson.xpReward} XP • +${lesson.coinReward} moedas.` : 'Progresso atualizado. Recompensas antigas foram preservadas sem duplicar XP ou moedas.'}
            </Text>
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
  supportTextInline: { fontSize: 12, lineHeight: 16, fontWeight: '800' },
  lessonProgressBlock: { marginTop: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  progressMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metaPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  listItem: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  exerciseBlock: { paddingTop: 12, marginTop: 12 },
  exerciseTitle: { fontSize: 16, lineHeight: 20, fontWeight: '900', marginTop: 2, marginBottom: 6 },
  inlineButton: { marginTop: 14 }
});
