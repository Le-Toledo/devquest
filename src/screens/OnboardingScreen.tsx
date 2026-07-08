import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { streakService } from '../services/streakService';

const slides = [
  {
    icon: 'game-controller' as const,
    kicker: 'Aprenda programação jogando',
    title: 'Cada fase ensina um conceito de verdade.',
    body: 'Você estuda em missões curtas, responde desafios e aprende com feedback imediato. Nada de aula solta sem objetivo.'
  },
  {
    icon: 'trophy' as const,
    kicker: 'Ganhe XP, moedas e conquistas',
    title: 'Seu progresso aparece a cada passo.',
    body: 'Complete aulas, vença desafios, mantenha sequência de estudos e desbloqueie recompensas enquanto evolui.'
  },
  {
    icon: 'hardware-chip' as const,
    kicker: 'Peça ajuda ao Professor Byte',
    title: 'Travou? O mentor entra junto.',
    body: 'Use o Professor Byte para entender erros, pedir dicas e transformar bugs em aprendizado sem sair da jornada.'
  }
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { colors } = useSettings();
  const { updateAvatar } = usePlayer();
  const [index, setIndex] = useState(0);
  const current = slides[index];
  const isLast = index === slides.length - 1;

  const finish = async () => {
    updateAvatar('CQ');
    await streakService.completeOnboarding('zero', 'fullstack', 'CQ');
    await streakService.recordStudy(25);
    onDone();
  };

  const next = () => {
    if (isLast) {
      finish().catch(() => undefined);
      return;
    }
    setIndex((value) => value + 1);
  };

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameCard style={{ borderColor: colors.primary }}>
          <View style={styles.hero}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceGlow, borderColor: colors.primary }]}>
              <Ionicons name={current.icon} size={34} color={colors.primary} />
            </View>
            <Text style={[styles.kicker, { color: colors.primary }]}>{current.kicker}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{current.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{current.body}</Text>
          </View>
        </GameCard>

        <View style={styles.progressRow}>
          {slides.map((slide, slideIndex) => (
            <Pressable
              key={slide.kicker}
              accessibilityRole="button"
              accessibilityLabel={`Ir para onboarding ${slideIndex + 1}`}
              onPress={() => setIndex(slideIndex)}
              style={[styles.dot, { backgroundColor: slideIndex === index ? colors.primary : colors.surfaceGlow, borderColor: slideIndex === index ? colors.primary : colors.border }]}
            />
          ))}
        </View>

        <GameCard>
          <View style={styles.summaryRow}>
            <Ionicons name="map" size={20} color={colors.accent} />
            <Text style={[styles.summary, { color: colors.text }]}>Depois disso, você entra direto no Hub e pode continuar a jornada, abrir a Academia Dev ou pedir ajuda ao Professor Byte.</Text>
          </View>
        </GameCard>

        <View style={styles.actions}>
          {index > 0 ? <GameButton title="Voltar" icon="chevron-back" variant="secondary" onPress={() => setIndex((value) => Math.max(0, value - 1))} style={styles.actionButton} /> : null}
          <GameButton title={isLast ? 'Começar jornada' : 'Próximo'} icon={isLast ? 'rocket' : 'chevron-forward'} onPress={next} style={styles.actionButton} />
        </View>
        <GameButton title="Pular introdução" icon="play-skip-forward" variant="ghost" onPress={() => finish().catch(() => undefined)} />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36, flexGrow: 1, justifyContent: 'center' },
  hero: { alignItems: 'center' },
  iconWrap: { width: 76, height: 76, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: 'center' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 34, height: 8, borderRadius: 999, borderWidth: 1 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  summary: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionButton: { flexBasis: 136, flexGrow: 1 }
});
