import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { CloudProgress, SyncResult } from '../types/backend';
import { syncService } from '../services/syncService';

type Props = {
  goBack: () => void;
  openLogin: () => void;
};

export function AccountScreen({ goBack, openLogin }: Props) {
  const { colors } = useSettings();
  const { profile } = usePlayer();
  const { user, configured, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [localProgress, setLocalProgress] = useState<CloudProgress | null>(null);
  const autoSyncedUserId = useRef<string | null>(null);

  const loadLocalSummary = useCallback(() => {
    if (!user) {
      setLocalProgress(null);
      return;
    }
    syncService.buildLocalProgress(user).then(setLocalProgress).catch(() => undefined);
  }, [user]);

  useEffect(() => {
    loadLocalSummary();
  }, [loadLocalSummary]);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    const next = await syncService.syncNow(user);
    setResult(next);
    setSyncing(false);
    loadLocalSummary();
  }, [loadLocalSummary, user]);

  useEffect(() => {
    if (!user || !configured || autoSyncedUserId.current === user.id) return;
    autoSyncedUserId.current = user.id;
    syncNow().catch(() => undefined);
  }, [configured, syncNow, user]);

  const logout = async () => {
    const response = await signOut();
    if (response.error) setResult({ status: 'error', message: response.error });
  };

  const statusText = result?.message ?? (user ? 'Pronto para sincronizar.' : 'Entre para salvar progresso na nuvem.');

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <Text style={[styles.title, { color: colors.text }]}>Conta e progresso</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Seu save nasce offline, fica seguro no aparelho e pode ganhar backup quando você entrar.</Text>

        {!configured ? (
          <GameCard style={{ borderColor: colors.warning }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Nuvem em modo de preparo</Text>
            <Text style={[styles.copy, { color: colors.muted }]}>Login e sync aparecem quando as variáveis públicas do Supabase forem configuradas. Até lá, nada do progresso local é perdido.</Text>
          </GameCard>
        ) : null}

        <GameCard style={{ borderColor: user ? colors.success : colors.border }}>
          <View style={styles.statusHeader}>
            <View style={styles.statusDotWrap}>
              <View style={[styles.statusDot, { backgroundColor: user ? colors.success : colors.warning }]} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{user ? 'Progresso sincronizável' : 'Salvar progresso na nuvem'}</Text>
              <Text style={[styles.copy, { color: colors.muted }]}>{user?.email ?? 'Login necessário para backup e ranking online.'}</Text>
            </View>
          </View>
          <Text style={[styles.status, { color: result?.status === 'error' ? colors.danger : colors.primary }]}>{statusText}</Text>
          {result?.lastSyncAt ? <Text style={[styles.copy, { color: colors.muted }]}>Última sincronização: {new Date(result.lastSyncAt).toLocaleString()}</Text> : null}
          <View style={styles.actions}>
            {user ? (
              <>
                <GameButton title="Sincronizar agora" icon="sync" onPress={syncNow} loading={syncing} />
                <GameButton title="Sair" icon="log-out" variant="secondary" onPress={logout} />
              </>
            ) : (
              <GameButton title="Entrar ou criar conta" icon="cloud-upload" onPress={openLogin} disabled={!configured} />
            )}
          </View>
        </GameCard>

        <GameCard>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Resumo local</Text>
          <View style={styles.grid}>
            <Metric label="XP" value={profile.xp} />
            <Metric label="Nível" value={profile.level} />
            <Metric label="Moedas" value={profile.coins} />
            <Metric label="Streak" value={localProgress?.streak?.currentStreak ?? profile.streak} />
            <Metric label="Missões" value={localProgress?.campaign?.completedMissionIds.length ?? 0} />
            <Metric label="Aulas" value={localProgress?.academy?.completedLessonIds.length ?? 0} />
            <Metric label="Arena" value={localProgress?.arena?.completedChallengeIds.length ?? 0} />
            <Metric label="Revisões" value={localProgress?.reviewErrors?.length ?? 0} />
          </View>
        </GameCard>
      </ScrollView>
    </GradientScreen>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const { colors } = useSettings();
  return (
    <View style={[styles.metric, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 15, lineHeight: 21 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  copy: { marginTop: 4, lineHeight: 20 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDotWrap: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  info: { flex: 1 },
  status: { marginTop: 14, fontWeight: '900', lineHeight: 20 },
  actions: { marginTop: 14, gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  metric: { borderRadius: 8, borderWidth: 1, padding: 12, flexBasis: '47%', flexGrow: 1 },
  metricValue: { fontSize: 20, fontWeight: '900' },
  metricLabel: { marginTop: 2, fontSize: 12, fontWeight: '800' }
});
