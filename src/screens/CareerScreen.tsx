import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { careerTips } from '../data/career';
import { stages } from '../data/worlds';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';

export function CareerScreen({ navigate, goBack }: { navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const proStage = stages.find((stage) => stage.id === 'pro-world-rest') ?? stages[stages.length - 1];

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <Text style={[styles.title, { color: colors.text }]}>Carreira Dev</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Git, APIs, banco de dados, front-end, back-end, entrevistas, portfolio e plano de estudo.</Text>
        <GameButton title="Desafio profissional" icon="briefcase" onPress={() => navigate({ name: 'quiz', stage: proStage })} />
        {careerTips.map((tip) => (
          <GameCard key={tip.id}>
            <View style={styles.tagRow}>
              <Text style={[styles.tag, { color: colors.accent }]}>{tip.tag}</Text>
            </View>
            <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{tip.body}</Text>
          </GameCard>
        ))}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  tagRow: { flexDirection: 'row', marginBottom: 8 },
  tag: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  tipTitle: { fontSize: 19, fontWeight: '900', marginBottom: 5 }
});
