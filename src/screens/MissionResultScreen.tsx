import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useSettings } from '../hooks/useSettings';
import { mentorMissionService } from '../services/mentorMissionService';
import { CampaignMission } from '../types/campaign';

export function MissionResultScreen({
  mission,
  victory,
  onContinue,
  onRetry
}: {
  mission: CampaignMission;
  victory: boolean;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const { colors } = useSettings();
  const tone = mentorMissionService.toneFor(mission);

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameCard>
          <Text style={[styles.kicker, { color: victory ? colors.success : colors.danger }]}>{victory ? 'Missao concluida' : 'Bug encontrado'}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{mission.title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{victory ? 'Bau aberto, progresso salvo e o proximo desafio ficou mais perto.' : 'O bug venceu esta rodada, mas deixou pistas claras para sua revisao.'}</Text>
          <View style={[styles.chest, { backgroundColor: victory ? colors.accent : colors.surfaceSoft }]}>
            <Text style={[styles.chestText, { color: victory ? colors.onAccent : colors.text }]}>{victory ? 'RECOMPENSA' : 'REVISAR'}</Text>
          </View>
          <Text style={[styles.reward, { color: colors.text }]}>
            {victory ? `+${mission.rewardXp} XP • +${mission.rewardCoins} moedas` : 'Erro salvo no Laboratorio de Revisao.'}
          </Text>
        </GameCard>
        <GameCard style={{ borderColor: victory ? colors.primary : colors.warning }}>
          <Text style={[styles.kicker, { color: victory ? colors.primary : colors.warning }]}>Professor Byte</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{victory ? 'Comentario do mentor' : 'Plano de revisao'}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{victory ? tone.victory : tone.defeat}</Text>
        </GameCard>
        <GameButton title={victory ? 'Continuar Jornada' : 'Tentar de novo com calma'} icon="book" variant="secondary" onPress={victory ? onContinue : onRetry} />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, fontWeight: '900', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  chest: { marginTop: 18, height: 96, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chestText: { fontSize: 20, fontWeight: '900' },
  reward: { marginTop: 12, fontWeight: '900', fontSize: 16 }
});
