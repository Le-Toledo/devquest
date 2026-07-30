import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useSettings } from '../hooks/useSettings';
import { soundService } from '../services/soundService';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { leaderboardConsentService, LeaderboardConsentStatus } from '../services/leaderboardConsentService';
import { leaderboardService } from '../services/leaderboardService';
import { releaseConfig } from '../services/releaseConfig';

export function SettingsScreen({ goBack, openAccount, openFeedback }: { goBack: () => void; openAccount: () => void; openFeedback: () => void }) {
  const { colors, theme, toggleTheme } = useSettings();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [leaderboardConsent, setLeaderboardConsent] = useState<LeaderboardConsentStatus>('unknown');
  const { user } = useAuth();
  const { profile } = usePlayer();

  useEffect(() => {
    soundService.getSoundSettings().then((settings) => setSoundEnabled(settings.enabled)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) leaderboardConsentService.get(user.id).then(setLeaderboardConsent).catch(() => undefined);
  }, [user]);

  const changeLeaderboardParticipation = (enabled: boolean) => {
    if (!user) return;
    if (!enabled) {
      leaderboardConsentService.set(user.id, 'declined').then(() => setLeaderboardConsent('declined'));
      return;
    }
    Alert.alert(
      'Participar do Ranking Global?',
      'Seu nome de perfil e sua pontuação serão enviados aos nossos servidores e poderão aparecer para outros jogadores. A participação é opcional.',
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Participar', onPress: () => leaderboardConsentService.set(user.id, 'accepted').then(async () => {
          setLeaderboardConsent('accepted');
          await leaderboardService.publish(user.id, profile);
        }) }
      ]
    );
  };

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundService.setSoundEnabled(enabled).catch(() => undefined);
  };

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacidade</Text>
        <GameCard>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Participar do Ranking Global</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Permite publicar seu nome de perfil, XP e nível para outros jogadores.</Text>
            </View>
            <Switch disabled={!user} value={leaderboardConsent === 'accepted'} onValueChange={changeLeaderboardParticipation} />
          </View>
        </GameCard>
        {releaseConfig.privacyPolicyUrl ? (
          <GameButton title="Política de Privacidade" icon="document-text" variant="secondary" onPress={() => Linking.openURL(releaseConfig.privacyPolicyUrl as string)} />
        ) : null}
        <GameCard>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Tema claro</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Alterna entre o visual escuro e o modo claro de estudo.</Text>
            </View>
            <Switch value={theme === 'light'} onValueChange={toggleTheme} />
          </View>
        </GameCard>
        <GameCard>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Sons de jogo</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Sistema preparado para cliques, vitórias, erros, recompensas e chefes.</Text>
            </View>
            <Switch value={soundEnabled} onValueChange={toggleSound} />
          </View>
        </GameCard>
        <GameCard>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Perfil do jogador</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Conta, sincronização, segurança e ações de progresso ficam centralizadas no Perfil.</Text>
            </View>
          </View>
          <View style={styles.cardAction}>
            <GameButton title="Abrir perfil" icon="person-circle" variant="secondary" onPress={openAccount} />
          </View>
        </GameCard>
        <GameCard>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Enviar feedback</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Reporte um problema ou envie uma sugestão.</Text>
            </View>
          </View>
          <View style={styles.cardAction}>
            <GameButton title="Enviar feedback" icon="chatbubbles" variant="secondary" onPress={openFeedback} />
          </View>
        </GameCard>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  title: { fontSize: 30, fontWeight: '900' },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  info: { flex: 1 },
  itemTitle: { fontWeight: '900', fontSize: 17 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  cardAction: { marginTop: 12 }
});
