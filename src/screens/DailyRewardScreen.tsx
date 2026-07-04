import { ScrollView, StyleSheet, Text } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { streakService } from '../services/streakService';

export function DailyRewardScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useSettings();
  const { awardCampaignReward } = usePlayer();

  const claim = async () => {
    const result = await streakService.claimDailyReward();
    if (result.claimed) {
      awardCampaignReward(80, 120, ['daily-reward']);
    }
    goBack();
  };

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameCard style={{ borderColor: colors.accent }}>
          <Text style={[styles.kicker, { color: colors.accent }]}>Recompensa diaria</Text>
          <Text style={[styles.title, { color: colors.text }]}>Voltar tambem e treinar.</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Receba moedas e XP por manter consistencia. Se ficar sem estudar, o streak recomeca.</Text>
          <Text style={[styles.reward, { color: colors.primary }]}>+80 XP • +120 moedas</Text>
        </GameCard>
        <GameButton title="Coletar recompensa" icon="gift" onPress={claim} />
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 34, lineHeight: 38, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  reward: { fontSize: 26, fontWeight: '900', marginTop: 18 }
});
