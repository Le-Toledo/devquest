import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { streakService } from '../services/streakService';
import { InitialTrack, OnboardingGoal } from '../types/monetization';

const goals: { id: OnboardingGoal; title: string }[] = [
  { id: 'zero', title: 'Aprender do zero' },
  { id: 'practice', title: 'Praticar código' },
  { id: 'interview', title: 'Preparar entrevista' },
  { id: 'career', title: 'Carreira dev' }
];
const tracks: { id: InitialTrack; title: string }[] = [
  { id: 'frontend', title: 'Front-end' },
  { id: 'backend', title: 'Back-end' },
  { id: 'mobile', title: 'Mobile' },
  { id: 'fullstack', title: 'Full Stack' },
  { id: 'career', title: 'Carreira' }
];
const avatars = ['CQ', 'JS', 'KT', 'PY', 'API'];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { colors } = useSettings();
  const { updateAvatar } = usePlayer();
  const [goal, setGoal] = useState<OnboardingGoal>('zero');
  const [track, setTrack] = useState<InitialTrack>('fullstack');
  const [avatar, setAvatar] = useState('CQ');

  const finish = async () => {
    updateAvatar(avatar);
    await streakService.completeOnboarding(goal, track, avatar);
    await streakService.recordStudy(25);
    onDone();
  };

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameCard style={{ borderColor: colors.primary }}>
          <Text style={[styles.kicker, { color: colors.primary }]}>Bem-vindo</Text>
          <Text style={[styles.title, { color: colors.text }]}>Sua jornada dev começa com um plano.</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Escolha um objetivo, uma trilha e um avatar. O CodeQuest ajusta a primeira experiência para você evoluir sem se perder.</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Qual seu objetivo?</Text>
          <View style={styles.grid}>{goals.map((item) => <GameButton key={item.id} title={item.title} variant={goal === item.id ? 'primary' : 'secondary'} onPress={() => setGoal(item.id)} style={styles.option} />)}</View>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Trilha inicial</Text>
          <View style={styles.grid}>{tracks.map((item) => <GameButton key={item.id} title={item.title} variant={track === item.id ? 'primary' : 'secondary'} onPress={() => setTrack(item.id)} style={styles.option} />)}</View>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Escolha seu avatar</Text>
          <View style={styles.avatarRow}>
            {avatars.map((item) => (
              <GameButton key={item} title={item} variant={avatar === item ? 'primary' : 'secondary'} onPress={() => setAvatar(item)} style={styles.avatarButton} />
            ))}
          </View>
        </GameCard>

        <GameButton title="Começar minha primeira missão" icon="rocket" onPress={finish} />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 34, lineHeight: 38, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: { flexBasis: '48%', flexGrow: 1 },
  avatarRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  avatarButton: { minWidth: 56 }
});
