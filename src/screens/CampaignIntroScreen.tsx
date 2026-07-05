import { ScrollView, StyleSheet, Text } from 'react-native';
import { DialogueBox } from '../components/DialogueBox';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { dialogueById } from '../data/mentorDialogues';
import { campaignProgressService } from '../services/campaignProgressService';
import { CampaignProgress } from '../types/campaign';
import { useSettings } from '../hooks/useSettings';

export function CampaignIntroScreen({
  progress,
  onProgress,
  onDone
}: {
  progress: CampaignProgress;
  onProgress: (progress: CampaignProgress) => void;
  onDone: () => void;
}) {
  const { colors } = useSettings();

  const finish = async () => {
    const next = await campaignProgressService.markIntroSeen(progress);
    onProgress(next);
    onDone();
  };

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameCard>
          <Text style={[styles.kicker, { color: colors.accent }]}>A Jornada do Desenvolvedor</Text>
          <Text style={[styles.title, { color: colors.text }]}>CodeQuest Academy está sob ataque.</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Entre na campanha, escolha sua trilha e restaure os sistemas da academia enfrentando bugs, chefes e desafios profissionais.</Text>
        </GameCard>
        <DialogueBox sequence={dialogueById('campaign-intro')} onDone={finish} finalLabel="Entrar na Campanha" />
        <GameButton title="Pular introducao" variant="ghost" onPress={finish} />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 6 },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 20 }
});
