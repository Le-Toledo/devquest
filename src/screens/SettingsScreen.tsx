import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useSettings } from '../hooks/useSettings';
import { soundService } from '../services/soundService';

export function SettingsScreen({ goBack, openAccount, openFeedback }: { goBack: () => void; openAccount: () => void; openFeedback: () => void }) {
  const { colors, theme, toggleTheme } = useSettings();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    soundService.getSoundSettings().then((settings) => setSoundEnabled(settings.enabled)).catch(() => undefined);
  }, []);

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundService.setSoundEnabled(enabled).catch(() => undefined);
  };

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
        <GameCard>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Tema claro</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Alterna entre visual escuro premium e modo claro de estudo.</Text>
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
              <Text style={[styles.itemTitle, { color: colors.text }]}>Feedback do beta</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Reporte bugs, ideias, dúvidas de conteúdo ou pontos confusos da experiência.</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  info: { flex: 1 },
  itemTitle: { fontWeight: '900', fontSize: 17 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  cardAction: { marginTop: 12 }
});
