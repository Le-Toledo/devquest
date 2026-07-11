import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { QuickChallenge as QuickChallengeType } from '../types/academy';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';

export function QuickChallenge({
  challenge,
  onCorrect,
  onWrong
}: {
  challenge: QuickChallengeType;
  onCorrect: (selectedIndex: number) => void | Promise<void>;
  onWrong: (selectedIndex: number) => void | Promise<void>;
}) {
  const { colors } = useSettings();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const correct = selected === challenge.correctIndex;

  const choose = async (index: number) => {
    if (selected !== null || submitting) return;
    setSubmitting(true);
    setSelected(index);
    try {
      if (index === challenge.correctIndex) await onCorrect(index);
      else await onWrong(index);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GameCard>
      <Text style={[styles.title, { color: colors.text }]}>Desafio rápido</Text>
      <Text style={[styles.prompt, { color: colors.muted }]}>{challenge.prompt}</Text>
      <View style={styles.options}>
        {challenge.options.map((option, index) => {
          const isCorrect = selected !== null && index === challenge.correctIndex;
          const isWrong = selected === index && !isCorrect;
          return (
            <Pressable key={option} onPress={() => choose(index)} style={[styles.option, { borderColor: colors.border, backgroundColor: isCorrect ? colors.success : isWrong ? colors.danger : colors.surfaceSoft }]}>
              <Text style={[styles.optionText, { color: isCorrect || isWrong ? colors.onAccent : colors.text }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      {selected !== null ? (
        <>
          <Text style={[styles.feedback, { color: correct ? colors.success : colors.danger }]}>{correct ? 'Professor Byte: excelente! Aula concluída e progresso salvo.' : challenge.explanation}</Text>
          {!correct ? <GameButton title="Tentar novamente" icon="refresh" variant="secondary" onPress={() => setSelected(null)} /> : null}
        </>
      ) : null}
    </GameCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '900' },
  prompt: { marginTop: 6, fontSize: 14, lineHeight: 20 },
  options: { gap: 10, marginVertical: 14 },
  option: { borderWidth: 1, borderRadius: 8, padding: 14 },
  optionText: { fontWeight: '800' },
  feedback: { fontWeight: '900', marginBottom: 12 }
});
