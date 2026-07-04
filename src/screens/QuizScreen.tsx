import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressBar } from '../components/ProgressBar';
import { questions } from '../data/questions';
import { areaName } from '../data/worlds';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';
import { reviewService } from '../services/reviewService';
import { questionSelectionService } from '../services/questionSelectionService';
import { Question, Stage } from '../types/game';

type Answer = { question: Question; correct: boolean };

const isQuestion = (question: Question | undefined): question is Question => Boolean(question);

export function QuizScreen({ stage, navigate, goBack }: { stage: Stage; navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { completeStage, profile } = usePlayer();
  const initialAnswerHistory = useRef(profile.answerHistory);
  const [stageQuestions, setStageQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [combo, setCombo] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stageSaved, setStageSaved] = useState(false);
  const current = stageQuestions[index];
  const score = answers.reduce((total, answer, answerIndex) => total + (answer.correct ? answer.question.points + answerIndex * 4 : 0), 0);
  const maxScore = stageQuestions.reduce((total, question) => total + question.points, 0);

  useEffect(() => {
    let mounted = true;
    setLoadingQuestions(true);
    setIndex(0);
    setSelected(null);
    setShowHint(false);
    setAnswers([]);
    setCombo(0);
    setFinished(false);
    setStageSaved(false);

    questionSelectionService
      .selectForStage(stage, initialAnswerHistory.current)
      .then((selectedQuestions) => {
        if (mounted) {
          const fallback = stage.questionIds.map((id) => questions.find((question) => question.id === id)).filter(isQuestion).slice(0, 8);
          setStageQuestions(selectedQuestions.length ? selectedQuestions : fallback);
        }
      })
      .finally(() => {
        if (mounted) setLoadingQuestions(false);
      });

    return () => {
      mounted = false;
    };
  }, [stage]);

  if (loadingQuestions) {
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameCard>
            <Text style={[styles.finishedTitle, { color: colors.text }]}>Preparando desafios</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Selecionando perguntas novas para esta sessao.</Text>
          </GameCard>
        </ScrollView>
      </GradientScreen>
    );
  }

  if (!current) {
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameCard>
            <Text style={[styles.finishedTitle, { color: colors.text }]}>Fase sem perguntas</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Nao encontramos perguntas validas para esta fase.</Text>
            <GameButton title="Voltar ao mapa" icon="map" onPress={goBack} />
          </GameCard>
        </ScrollView>
      </GradientScreen>
    );
  }

  const choose = (optionIndex: number) => {
    if (selected !== null) return;
    const correct = optionIndex === current.correctIndex;
    if (!correct) {
      reviewService.saveQuestionError(current, optionIndex).catch(() => undefined);
    }
    setSelected(optionIndex);
    setCombo((value) => (correct ? value + 1 : 0));
    setAnswers((value) => [...value, { question: current, correct }]);
  };

  const next = () => {
    if (index + 1 >= stageQuestions.length) {
      if (!stageSaved) {
        const finalAnswers = answers;
        completeStage({ stageId: stage.id, score, maxScore, answers: finalAnswers });
        setStageSaved(true);
      }
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setShowHint(false);
  };

  if (finished) {
    const correct = answers.filter((answer) => answer.correct).length;
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameCard>
            <Text style={[styles.finishedTitle, { color: colors.text }]}>Fase concluida</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Voce acertou {correct} de {stageQuestions.length} desafios em {areaName(stage.areaId)}.</Text>
            <Text style={[styles.bigScore, { color: colors.accent }]}>{score} XP</Text>
            <Text style={[styles.confetti, { color: colors.primary }]}>★ ★ ★</Text>
            <GameButton title="Continuar jornada" icon="arrow-forward" onPress={() => navigate({ name: 'map' })} />
          </GameCard>
        </ScrollView>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Sair da fase" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard>
          <View style={styles.topRow}>
            <Text style={[styles.area, { color: colors.accent }]}>{areaName(stage.areaId)} • {current.difficulty}</Text>
            <Text style={[styles.area, { color: colors.primary }]}>Combo {combo}x</Text>
          </View>
          <ProgressBar value={(index + (selected === null ? 0 : 1)) / stageQuestions.length} />
          <Text style={[styles.questionCount, { color: colors.muted }]}>Desafio {index + 1} de {stageQuestions.length} • {current.points} pontos</Text>
          <Text style={[styles.prompt, { color: colors.text }]}>{current.prompt}</Text>
          {current.code ? <Text style={[styles.code, { backgroundColor: colors.surfaceSoft, color: colors.text }]}>{current.code}</Text> : null}
          <GameButton title={showHint ? current.hint : 'Mostrar dica'} icon="bulb" variant="secondary" onPress={() => setShowHint(true)} />
        </GameCard>

        <View style={styles.options}>
          {current.options.map((option, optionIndex) => {
            const isPicked = selected === optionIndex;
            const isCorrect = selected !== null && optionIndex === current.correctIndex;
            const isWrong = isPicked && !isCorrect;
            const backgroundColor = isCorrect ? colors.success : isWrong ? colors.danger : colors.surface;
            const textColor = isCorrect || isWrong ? colors.onAccent : colors.text;
            return (
              <Pressable key={option} onPress={() => choose(optionIndex)} style={({ pressed }) => [styles.option, { backgroundColor, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
                <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {selected !== null ? (
          <GameCard>
            <Text style={[styles.feedbackTitle, { color: selected === current.correctIndex ? colors.success : colors.danger }]}>
              {selected === current.correctIndex ? 'Resposta correta' : 'Quase la'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{current.explanation}</Text>
            <GameButton title={index + 1 >= stageQuestions.length ? 'Ver Resultado' : 'Proxima Pergunta'} icon="arrow-forward" onPress={next} />
          </GameCard>
        ) : null}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
    paddingBottom: 36
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  area: {
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 12
  },
  questionCount: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '800'
  },
  prompt: {
    marginTop: 10,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900'
  },
  code: {
    marginVertical: 12,
    padding: 14,
    borderRadius: 8,
    fontFamily: 'Courier',
    fontSize: 14
  },
  options: {
    gap: 10
  },
  option: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16
  },
  optionText: {
    fontWeight: '800',
    fontSize: 15
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14
  },
  finishedTitle: {
    fontSize: 30,
    fontWeight: '900'
  },
  bigScore: {
    fontSize: 42,
    fontWeight: '900',
    marginVertical: 8
  },
  confetti: {
    fontSize: 28,
    letterSpacing: 0,
    marginBottom: 18
  }
});
