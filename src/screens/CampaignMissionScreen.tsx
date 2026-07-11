import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressBar } from '../components/ProgressBar';
import { questions } from '../data/questions';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { mentorMissionService } from '../services/mentorMissionService';
import { professorByteAi } from '../services/professorByteAi';
import { questionSelectionService } from '../services/questionSelectionService';
import { reviewService } from '../services/reviewService';
import { CampaignMission } from '../types/campaign';
import { Question } from '../types/game';

type Answer = { question: Question; selectedIndex: number; correct: boolean };

const isQuestion = (question: Question | undefined): question is Question => Boolean(question);

export function CampaignMissionScreen({
  mission,
  onBack,
  onFinish
}: {
  mission: CampaignMission;
  onBack: () => void;
  onFinish: (mission: CampaignMission, victory: boolean) => void;
}) {
  const { colors } = useSettings();
  const { profile } = usePlayer();
  const initialAnswerHistory = useRef(profile.answerHistory);
  const tone = mentorMissionService.toneFor(mission);
  const questionLimit = mission.type === 'battle' ? 4 : 3;
  const stage = useMemo(() => mentorMissionService.buildStage(mission), [mission]);
  const [phase, setPhase] = useState<'briefing' | 'challenge'>('briefing');
  const [missionQuestions, setMissionQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [aiHelp, setAiHelp] = useState('');
  const [loadingHelp, setLoadingHelp] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finishing, setFinishing] = useState(false);
  const current = missionQuestions[index];
  const correctCount = answers.filter((answer) => answer.correct).length;
  const passingScore = Math.max(1, Math.ceil(missionQuestions.length * 0.6));

  useEffect(() => {
    let mounted = true;
    setLoadingQuestions(true);
    setPhase('briefing');
    setIndex(0);
    setSelected(null);
    setShowHelp(false);
    setAiHelp('');
    setLoadingHelp(false);
    setAnswers([]);
    setFinishing(false);

    questionSelectionService
      .selectForStage(stage, initialAnswerHistory.current, questionLimit)
      .then((selectedQuestions) => {
        if (!mounted) return;
        const fallback = stage.questionIds.map((id) => questions.find((question) => question.id === id)).filter(isQuestion).slice(0, 4);
        setMissionQuestions(selectedQuestions.length ? selectedQuestions : fallback);
      })
      .finally(() => {
        if (mounted) setLoadingQuestions(false);
      });

    return () => {
      mounted = false;
    };
  }, [questionLimit, stage]);

  const choose = (optionIndex: number) => {
    if (!current || selected !== null) return;
    const correct = optionIndex === current.correctIndex;
    if (!correct) {
      reviewService.saveQuestionError(current, optionIndex).catch(() => undefined);
      setShowHelp(true);
    }
    setSelected(optionIndex);
    setAnswers((value) => [...value, { question: current, selectedIndex: optionIndex, correct }]);
  };

  const askByteHint = async () => {
    if (!current || loadingHelp) return;
    setShowHelp(true);
    setLoadingHelp(true);
    try {
      const result = await professorByteAi.ask('Preciso de uma dica para esta pergunta.', {
        source: 'campaign',
        aiMode: selected === null ? 'hint' : 'explanation',
        topic: current.prompt,
        language: current.areaId,
        concept: current.difficulty,
        code: current.code,
        options: current.options,
        selectedAnswer: selected === null ? undefined : current.options[selected],
        correctAnswer: selected === null ? undefined : current.options[current.correctIndex]
      });
      setAiHelp(result.answer);
    } finally {
      setLoadingHelp(false);
    }
  };

  const next = () => {
    if (finishing) return;
    if (index + 1 >= missionQuestions.length) {
      setFinishing(true);
      onFinish(mission, correctCount >= passingScore);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setShowHelp(false);
    setAiHelp('');
    setLoadingHelp(false);
  };

  if (loadingQuestions) {
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameCard>
            <Text style={[styles.title, { color: colors.text }]}>Professor Byte está preparando a missão</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Selecionando desafios novos para {mission.concept}.</Text>
          </GameCard>
        </ScrollView>
      </GradientScreen>
    );
  }

  if (!current) {
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={onBack} />
          <GameCard>
            <Text style={[styles.title, { color: colors.text }]}>Missão sem desafios</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Não encontramos perguntas válidas para esta missão.</Text>
          </GameCard>
        </ScrollView>
      </GradientScreen>
    );
  }

  if (phase === 'briefing') {
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={onBack} />
          <GameCard style={{ borderColor: colors.primary }}>
            <Text style={[styles.kicker, { color: colors.primary }]}>Professor Byte prepara você</Text>
            <Text style={[styles.title, { color: colors.text }]}>{mission.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{tone.intro}</Text>
            <View style={[styles.mentorPanel, { backgroundColor: colors.surfaceGlow, borderColor: colors.border }]}>
              <Text style={[styles.panelLabel, { color: colors.accent }]}>Dica do mentor</Text>
              <Text style={[styles.panelText, { color: colors.text }]}>{tone.hint}</Text>
            </View>
          </GameCard>

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Objetivo da missão</Text>
            <InfoRow label="Linguagem" value={tone.label} />
            <InfoRow label="Dificuldade" value={current.difficulty} />
            <InfoRow label="XP" value={`+${mission.rewardXp}`} />
            <InfoRow label="Moedas" value={`+${mission.rewardCoins}`} />
            <InfoRow label="Objetivo" value={mentorMissionService.objectiveFor(mission)} />
            <GameButton title="Começar desafio" icon="play" onPress={() => setPhase('challenge')} style={styles.inlineButton} />
          </GameCard>
        </ScrollView>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Sair da missão" icon="chevron-back" variant="ghost" onPress={onBack} />
        <GameCard style={{ borderColor: colors.accent }}>
          <View style={styles.topRow}>
            <Text style={[styles.kicker, { color: colors.accent }]}>{tone.label} • {mission.concept}</Text>
            <Text style={[styles.kicker, { color: colors.primary }]}>{correctCount}/{missionQuestions.length}</Text>
          </View>
          <ProgressBar value={(index + (selected === null ? 0 : 1)) / missionQuestions.length} color={colors.accent} />
          <Text style={[styles.questionCount, { color: colors.muted }]}>Pergunta {index + 1} de {missionQuestions.length} • {current.points} pontos</Text>
          <Text style={[styles.prompt, { color: colors.text }]}>{current.prompt}</Text>
          {current.code ? <Text style={[styles.code, { backgroundColor: colors.surfaceSoft, color: colors.text }]}>{current.code}</Text> : null}
          <GameButton title="Pedir ajuda ao Byte" icon="bulb" variant="secondary" onPress={askByteHint} loading={loadingHelp} disabled={loadingHelp} />
        </GameCard>

        {showHelp ? (
          <GameCard style={{ borderColor: colors.primary }}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Professor Byte</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {loadingHelp ? 'Professor Byte está pensando...' : aiHelp || (selected === null ? tone.mid : current.hint)}
            </Text>
          </GameCard>
        ) : null}

        <View style={styles.options}>
          {current.options.map((option, optionIndex) => {
            const isPicked = selected === optionIndex;
            const isCorrect = selected !== null && optionIndex === current.correctIndex;
            const isWrong = isPicked && !isCorrect;
            const backgroundColor = isCorrect ? colors.success : isWrong ? colors.danger : colors.surface;
            const textColor = isCorrect || isWrong ? colors.onAccent : colors.text;
            return (
              <Pressable key={option} onPress={() => choose(optionIndex)} style={({ pressed }) => [styles.option, { backgroundColor, borderColor: colors.border, opacity: pressed ? 0.84 : 1 }]}>
                <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {selected !== null ? (
          <GameCard>
            <Text style={[styles.feedbackTitle, { color: selected === current.correctIndex ? colors.success : colors.danger }]}>
              {selected === current.correctIndex ? 'Resposta correta' : 'Professor Byte entrou na revisão'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{current.explanation}</Text>
            <GameButton title={index + 1 >= missionQuestions.length ? 'Ver resultado' : 'Próxima pergunta'} icon="arrow-forward" onPress={next} disabled={finishing} />
          </GameCard>
        ) : null}
      </ScrollView>
    </GradientScreen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useSettings();
  return (
    <View style={[styles.infoRow, { borderColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionTitle: { fontSize: 19, fontWeight: '900', marginBottom: 8 },
  mentorPanel: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 16 },
  panelLabel: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  panelText: { marginTop: 6, fontSize: 15, lineHeight: 21, fontWeight: '800' },
  infoRow: { borderTopWidth: 1, paddingVertical: 10, gap: 4 },
  infoLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '800', lineHeight: 19 },
  inlineButton: { marginTop: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  questionCount: { marginTop: 12, fontSize: 12, fontWeight: '800' },
  prompt: { marginTop: 10, fontSize: 22, lineHeight: 28, fontWeight: '900' },
  code: { marginVertical: 12, padding: 14, borderRadius: 8, fontFamily: 'Courier', fontSize: 14 },
  options: { gap: 10 },
  option: { borderWidth: 1, borderRadius: 12, padding: 16 },
  optionText: { fontWeight: '800', fontSize: 15 },
  feedbackTitle: { fontSize: 20, fontWeight: '900', marginBottom: 6 }
});
