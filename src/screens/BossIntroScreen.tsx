import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DialogueBox } from '../components/DialogueBox';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { characterById } from '../data/characters';
import { dialogueById } from '../data/mentorDialogues';
import { useSettings } from '../hooks/useSettings';
import { CampaignBoss } from '../types/campaign';

export function BossIntroScreen({ boss, onFight, onBack }: { boss: CampaignBoss; onFight: () => void; onBack: () => void }) {
  const { colors } = useSettings();
  const character = characterById(boss.characterId);
  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={onBack} />
        <GameCard style={{ borderColor: character.color }}>
          <View style={styles.bossRow}>
            <View style={[styles.avatar, { backgroundColor: character.color }]}>
              <Text style={[styles.avatarText, { color: colors.onAccent }]}>{character.avatar}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.kicker, { color: colors.accent }]}>Boss final</Text>
              <Text style={[styles.title, { color: colors.text }]}>{boss.name}</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>{boss.description}</Text>
            </View>
          </View>
          <Text style={[styles.stats, { color: colors.text }]}>Vida {boss.health} • Ataque {boss.attack}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Fraqueza: {boss.weakness}</Text>
        </GameCard>
        <DialogueBox sequence={dialogueById(boss.introDialogueId)} onDone={onFight} finalLabel="Iniciar batalha" />
        <GameButton title="Iniciar batalha" icon="flash" onPress={onFight} />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  bossRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '900', fontSize: 18 },
  info: { flex: 1 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 5 },
  stats: { marginTop: 16, fontWeight: '900', fontSize: 16 }
});
