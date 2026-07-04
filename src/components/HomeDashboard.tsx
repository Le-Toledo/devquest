import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';
import { StreakState } from '../services/streakService';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';
import { ProgressBar } from './ProgressBar';

type ModeTile = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'secondary' | 'accent' | 'success' | 'premium' | 'muted';
  onPress: () => void;
};

export function HomeDashboard({ navigate, streak }: { navigate: Navigate; streak: StreakState }) {
  const { colors } = useSettings();
  const { user } = useAuth();
  const { profile } = usePlayer();
  const completedStages = Object.keys(profile.completedStages).length;
  const weekProgress = Math.min(1, streak.currentStreak / 7);
  const syncColor = user ? colors.success : colors.warning;

  const modeTiles: ModeTile[] = [
    { title: 'Campanha', subtitle: 'História guiada', icon: 'compass', tone: 'primary', onPress: () => navigate({ name: 'campaign' }) },
    { title: 'Academia Dev', subtitle: 'Aulas e base', icon: 'school', tone: 'secondary', onPress: () => navigate({ name: 'academy' }) },
    { title: 'Arena de Código', subtitle: 'Desafios práticos', icon: 'code-slash', tone: 'accent', onPress: () => navigate({ name: 'codeArena' }) },
    { title: 'Laboratório', subtitle: 'Treino com erros', icon: 'flask', tone: 'success', onPress: () => navigate({ name: 'reviewLab' }) },
    { title: 'Conquistas', subtitle: 'Metas e recompensas', icon: 'trophy', tone: 'success', onPress: () => navigate({ name: 'achievements' }) },
    { title: 'Perfil', subtitle: 'Estatísticas', icon: 'person-circle', tone: 'secondary', onPress: () => navigate({ name: 'profile' }) },
    { title: 'Loja', subtitle: 'Itens e moedas', icon: 'storefront', tone: 'accent', onPress: () => navigate({ name: 'shop' }) },
    { title: 'Premium', subtitle: 'Benefícios', icon: 'diamond', tone: 'premium', onPress: () => navigate({ name: 'premium' }) }
  ];

  const colorFor = (tone: ModeTile['tone']) => {
    if (tone === 'primary') return colors.primary;
    if (tone === 'secondary') return colors.secondary;
    if (tone === 'accent') return colors.accent;
    if (tone === 'success') return colors.success;
    if (tone === 'premium') return colors.premium;
    return colors.muted;
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <Text style={[styles.kicker, { color: colors.primary }]}>CodeQuest</Text>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>Olá, {profile.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir ranking"
            onPress={() => navigate({ name: 'ranking' })}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surfaceGlow, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="podium" size={18} color={colors.accent} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            onPress={() => navigate({ name: 'profile' })}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surfaceGlow, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="person" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir configurações"
            onPress={() => navigate({ name: 'settings' })}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surfaceGlow, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="settings" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.chipRow}>
        <InfoChip label="Nível" value={profile.level} color={colors.primary} />
        <InfoChip label="XP" value={profile.xp} color={colors.secondary} />
        <InfoChip label="Moedas" value={profile.coins} color={colors.accent} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil e sincronização"
          onPress={() => navigate({ name: 'profile' })}
          hitSlop={6}
          style={({ pressed }) => [styles.syncChip, { borderColor: syncColor, backgroundColor: colors.surfaceSoft, opacity: pressed ? 0.75 : 1 }]}
        >
          <Ionicons name={user ? 'cloud-done' : 'cloud-offline'} size={12} color={syncColor} />
          <Text style={[styles.syncText, { color: syncColor }]}>{user ? 'Sync' : 'Local'}</Text>
        </Pressable>
      </View>

      <GameCard style={{ ...styles.journeyCard, borderColor: colors.primary }}>
        <View style={styles.journeyRow}>
          <View style={styles.journeyCopy}>
            <Text style={[styles.cardKicker, { color: colors.primary }]}>Próximo passo</Text>
            <Text style={[styles.journeyTitle, { color: colors.text }]}>Continuar Jornada</Text>
            <Text style={[styles.journeySubtitle, { color: colors.muted }]}>{completedStages} fases concluídas na campanha</Text>
          </View>
          <GameButton title="Entrar" icon="arrow-forward" onPress={() => navigate({ name: 'campaign' })} style={styles.primaryAction} />
        </View>
      </GameCard>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Perguntar ao Professor Byte"
        onPress={() => navigate({ name: 'professorByte', initialPrompt: 'Qual é meu melhor próximo passo hoje?', context: { source: 'general', topic: 'Home' } })}
        style={({ pressed }) => [styles.byteBar, { backgroundColor: colors.surfaceSoft, borderColor: colors.border, opacity: pressed ? 0.76 : 1 }]}
      >
        <View style={[styles.byteIcon, { borderColor: colors.secondary, backgroundColor: colors.surfaceGlow }]}>
          <Ionicons name="chatbubbles" size={16} color={colors.secondary} />
        </View>
        <Text style={[styles.byteText, { color: colors.text }]}>Professor Byte</Text>
        <Text style={[styles.byteMeta, { color: colors.muted }]} numberOfLines={1}>dica rápida para estudar melhor</Text>
      </Pressable>

      <GameCard style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Progresso semanal</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>{streak.currentStreak} dias seguidos • {streak.todayXp} XP hoje</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir recompensa diária"
            onPress={() => navigate({ name: 'dailyReward' })}
            hitSlop={8}
            style={({ pressed }) => [styles.rewardButton, { borderColor: colors.accent, opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="gift" size={16} color={colors.accent} />
          </Pressable>
        </View>
        <ProgressBar value={weekProgress} color={colors.accent} />
        <Text style={[styles.progressFooter, { color: colors.muted }]}>Meta da semana: {Math.min(7, streak.currentStreak)}/7 • melhor sequência: {streak.bestStreak} dias</Text>
      </GameCard>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Modos principais</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>Escolha seu treino</Text>
      </View>
      <View style={styles.grid}>
        {modeTiles.map((tile) => {
          const tone = colorFor(tile.tone);
          return (
            <Pressable
              key={tile.title}
              accessibilityRole="button"
              accessibilityLabel={tile.title}
              onPress={tile.onPress}
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }
              ]}
            >
              <View style={[styles.modeIcon, { backgroundColor: colors.surfaceGlow, borderColor: tone }]}>
                <Ionicons name={tile.icon} size={18} color={tone} />
              </View>
              <Text style={[styles.modeTitle, { color: colors.text }]} numberOfLines={1}>{tile.title}</Text>
              <Text style={[styles.modeSubtitle, { color: colors.muted }]} numberOfLines={2}>{tile.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function InfoChip({ label, value, color }: { label: string; value: string | number; color: string }) {
  const { colors } = useSettings();
  return (
    <View style={[styles.infoChip, { borderColor: color, backgroundColor: colors.surfaceSoft }]}>
      <Text style={[styles.infoValue, { color }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.infoLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  topRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  greeting: { flex: 1 },
  kicker: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 23, lineHeight: 27, fontWeight: '900', marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 7 },
  iconButton: { width: 36, height: 36, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  infoChip: { minHeight: 38, minWidth: 72, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, justifyContent: 'center' },
  infoValue: { fontSize: 13, lineHeight: 15, fontWeight: '900' },
  infoLabel: { fontSize: 9, lineHeight: 11, fontWeight: '900', textTransform: 'uppercase' },
  syncChip: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10 },
  syncText: { fontSize: 11, fontWeight: '900' },
  journeyCard: { padding: 12 },
  journeyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  journeyCopy: { flex: 1 },
  cardKicker: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  journeyTitle: { fontSize: 22, lineHeight: 26, fontWeight: '900', marginTop: 1 },
  journeySubtitle: { fontSize: 12, lineHeight: 16, marginTop: 3 },
  primaryAction: { minHeight: 44, paddingHorizontal: 14 },
  byteBar: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10 },
  byteIcon: { width: 28, height: 28, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  byteText: { fontSize: 13, lineHeight: 16, fontWeight: '900' },
  byteMeta: { flex: 1, fontSize: 11, lineHeight: 14, fontWeight: '700' },
  progressCard: { padding: 12 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  sectionTitle: { fontSize: 16, lineHeight: 20, fontWeight: '900' },
  meta: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  rewardButton: { width: 36, height: 36, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  progressFooter: { fontSize: 11, lineHeight: 15, marginTop: 8, fontWeight: '700' },
  sectionHeader: { marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modeCard: { flexBasis: '47.5%', flexGrow: 1, minHeight: 96, borderWidth: 1, borderRadius: 10, padding: 10 },
  modeIcon: { width: 32, height: 32, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modeTitle: { fontSize: 14, lineHeight: 17, fontWeight: '900' },
  modeSubtitle: { fontSize: 11, lineHeight: 15, marginTop: 3, fontWeight: '700' }
});
