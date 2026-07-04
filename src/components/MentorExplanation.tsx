import { StyleSheet, Text, View } from 'react-native';
import { lessonForArea } from '../data/reviewLessons';
import { useSettings } from '../hooks/useSettings';
import { ReviewError } from '../types/review';
import { GameCard } from './GameCard';

export function MentorExplanation({ error, simplified = false }: { error: ReviewError; simplified?: boolean }) {
  const { colors } = useSettings();
  const lesson = lessonForArea(error.areaId);

  return (
    <GameCard style={{ borderColor: colors.primary }}>
      <View style={styles.mentorRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.onAccent }]}>PB</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.kicker, { color: colors.accent }]}>Professor Byte explica</Text>
          <Text style={[styles.title, { color: colors.text }]}>{simplified ? 'Vamos simplificar o bug' : lesson.title}</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: colors.muted }]}>Resposta escolhida</Text>
      <Text style={[styles.answer, { color: colors.danger }]}>{error.selectedAnswer}</Text>

      <Text style={[styles.label, { color: colors.muted }]}>Resposta correta</Text>
      <Text style={[styles.answer, { color: colors.success }]}>{error.correctAnswer}</Text>

      <Text style={[styles.label, { color: colors.muted }]}>Explicacao</Text>
      <Text style={[styles.body, { color: colors.text }]}>{simplified ? `O ponto principal: ${error.hint}` : error.explanation}</Text>

      <Text style={[styles.label, { color: colors.muted }]}>Mini-aula</Text>
      <Text style={[styles.body, { color: colors.text }]}>{lesson.lesson}</Text>

      <Text style={[styles.label, { color: colors.muted }]}>Dica personalizada</Text>
      <Text style={[styles.body, { color: colors.text }]}>Na proxima tentativa, procure por: {error.hint}</Text>

      {error.codeExample || lesson.code ? <Text style={[styles.code, { backgroundColor: colors.surfaceSoft, color: colors.text }]}>{error.codeExample ?? lesson.code}</Text> : null}
    </GameCard>
  );
}

const styles = StyleSheet.create({
  mentorRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  avatar: { width: 52, height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '900' },
  info: { flex: 1 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  label: { marginTop: 12, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  answer: { marginTop: 4, fontSize: 15, fontWeight: '900' },
  body: { marginTop: 5, fontSize: 14, lineHeight: 20 },
  code: { marginTop: 14, padding: 14, borderRadius: 8, fontFamily: 'Courier', fontSize: 13 }
});
