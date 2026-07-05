import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProgressBar } from '../components/ProgressBar';
import { stages, worlds } from '../data/worlds';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';

export function MapScreen({ navigate, goBack }: { navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { profile } = usePlayer();
  const completed = Object.keys(profile.completedStages).length;
  const progress = completed / stages.length;

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <ProfileHeader />
        <GameCard>
          <Text style={[styles.title, { color: colors.text }]}>Mapa de Fases</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Complete mundos, ganhe estrelas e desbloqueie trilhas profissionais.</Text>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.muted }]}>{completed}/{stages.length} fases</Text>
            <Text style={[styles.progressText, { color: colors.muted }]}>{Math.round(progress * 100)}%</Text>
          </View>
          <ProgressBar value={progress} color={colors.accent} />
        </GameCard>

        {worlds.map((world) => {
          const worldStages = stages.filter((stage) => stage.worldId === world.id);
          const locked = profile.level < world.requiredLevel;
          return (
            <GameCard key={world.id} style={{ borderColor: world.color }}>
              <View style={styles.worldHeader}>
                <View style={[styles.worldIcon, { backgroundColor: world.color }]}>
                  <Ionicons name={locked ? 'lock-closed' : 'planet'} size={22} color={colors.onAccent} />
                </View>
                <View style={styles.worldInfo}>
                  <Text style={[styles.worldTitle, { color: colors.text }]}>{world.title}</Text>
                  <Text style={[styles.subtitle, { color: colors.muted }]}>{world.subtitle}</Text>
                </View>
                {world.premium ? <Text style={[styles.premium, { color: colors.accent }]}>PRO</Text> : null}
              </View>

              {worldStages.map((stage) => {
                const result = profile.completedStages[stage.id];
                const stageLocked = locked || profile.level < stage.requiredLevel;
                return (
                  <View key={stage.id} style={[styles.stage, { borderColor: colors.border }]}>
                    <View style={styles.stageText}>
                      <Text style={[styles.stageTitle, { color: colors.text }]}>{stage.title}</Text>
                      <Text style={[styles.subtitle, { color: colors.muted }]}>
                        {stageLocked ? `Desbloqueia no nível ${stage.requiredLevel}` : `${stage.questionIds.length} desafios`}
                      </Text>
                    </View>
                    <Text style={[styles.stars, { color: colors.accent }]}>{'★'.repeat(result?.stars ?? 0)}{'☆'.repeat(3 - (result?.stars ?? 0))}</Text>
                    <GameButton title={stageLocked ? 'Bloq.' : 'Entrar'} variant={stageLocked ? 'ghost' : 'secondary'} disabled={stageLocked} onPress={() => navigate({ name: 'quiz', stage })} style={styles.enterButton} />
                  </View>
                );
              })}
            </GameCard>
          );
        })}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
    paddingBottom: 36
  },
  title: {
    fontSize: 28,
    fontWeight: '900'
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18
  },
  progressRow: {
    marginTop: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800'
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  worldIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  worldInfo: {
    flex: 1
  },
  worldTitle: {
    fontSize: 18,
    fontWeight: '900'
  },
  premium: {
    fontWeight: '900'
  },
  stage: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stageText: {
    flex: 1
  },
  stageTitle: {
    fontWeight: '900'
  },
  stars: {
    minWidth: 54,
    fontWeight: '900'
  },
  enterButton: {
    minHeight: 48,
    paddingHorizontal: 12
  }
});
