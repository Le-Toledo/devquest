import { StyleSheet, Text } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { CodeLabValidationResult } from '../types/codeLab';
import { GameCard } from './GameCard';
import { ProgressBar } from './ProgressBar';

export function CodeLabValidationFeedback({ result }: { result: CodeLabValidationResult }) {
  const { colors } = useSettings();
  const color = result.passed ? colors.success : colors.warning;
  return (
    <GameCard style={{ borderColor: color }}>
      <Text style={[styles.title, { color }]}>{result.passed ? 'Solução validada' : 'Ajustes necessários'}</Text>
      <Text style={[styles.feedback, { color: colors.muted }]}>{result.feedback}</Text>
      <ProgressBar value={result.score / 100} color={color} />
      <Text style={[styles.score, { color: colors.text }]}>Pontuação: {result.score}%</Text>
    </GameCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, lineHeight: 24, fontWeight: '900' },
  feedback: { fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 12 },
  score: { fontSize: 13, lineHeight: 18, fontWeight: '900', marginTop: 8 }
});
