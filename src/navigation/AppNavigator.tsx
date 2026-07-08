import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppRoute } from './routes';
import {
  AcademyScreen,
  AchievementsScreen,
  CareerScreen,
  CodeArenaScreen,
  CodeChallengeScreen,
  CampaignScreen,
  DailyRewardScreen,
  FeedbackScreen,
  HomeScreen,
  LessonScreen,
  LoginScreen,
  MapScreen,
  OnboardingScreen,
  PremiumScreen,
  ProfessorByteScreen,
  ProfileScreen,
  QuizScreen,
  RankingScreen,
  ReviewLabScreen,
  SettingsScreen,
  ShopScreen
} from '@screens';
import { onboardingVersion, streakService } from '@services';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { syncService } from '../services/syncService';

export function AppNavigator() {
  const { session, loading: checkingAuth } = useAuth();
  const { profile, loading: playerLoading, reloadProfile, recentAchievements, clearRecentAchievements } = usePlayer();
  const [route, setRoute] = useState<AppRoute>({ name: 'home' });
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const hydratedUserId = useRef<string | null>(null);
  const lastPushSignature = useRef('');
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goHome = () => setRoute({ name: 'home' });
  const user = session?.user ?? null;
  const profileSyncSignature = useMemo(
    () =>
      JSON.stringify({
        xp: profile.xp,
        coins: profile.coins,
        level: profile.level,
        name: profile.name,
        avatar: profile.avatar,
        streak: profile.streak,
        achievements: profile.achievements,
        completedStages: profile.completedStages,
        unlockedAreaIds: profile.unlockedAreaIds,
        ownedItems: profile.ownedItems,
        selectedTheme: profile.selectedTheme
      }),
    [profile]
  );

  useEffect(() => {
    streakService.loadOnboarding().then((state) => setNeedsOnboarding(!state.completed || state.version !== onboardingVersion)).finally(() => setCheckingOnboarding(false));
  }, []);

  useEffect(() => {
    if (!session) setRoute({ name: 'home' });
  }, [session]);

  useEffect(() => {
    if (!recentAchievements.length) return;
    const timeout = setTimeout(clearRecentAchievements, 4200);
    return () => clearTimeout(timeout);
  }, [clearRecentAchievements, recentAchievements.length]);

  useEffect(() => {
    if (!user) {
      hydratedUserId.current = null;
      lastPushSignature.current = '';
      return;
    }
    if (hydratedUserId.current === user.id || hydratedUserId.current === `syncing:${user.id}`) return;

    hydratedUserId.current = `syncing:${user.id}`;
    syncService.syncNow(user).then((result) => {
      if (result.status === 'synced') {
        lastPushSignature.current = '';
        reloadProfile().catch(() => undefined).finally(() => {
          hydratedUserId.current = user.id;
        });
        return;
      }
      hydratedUserId.current = user.id;
    }).catch(() => {
      hydratedUserId.current = user.id;
    });
  }, [reloadProfile, user]);

  useEffect(() => {
    if (!user || playerLoading || hydratedUserId.current !== user.id) return;
    if (!profileSyncSignature || lastPushSignature.current === profileSyncSignature) return;

    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      syncService.pushLocal(user).then((result) => {
        if (result.status === 'synced') lastPushSignature.current = profileSyncSignature;
      }).catch(() => undefined);
    }, 900);

    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [playerLoading, profileSyncSignature, user]);

  if (checkingAuth || checkingOnboarding || playerLoading) return <AuthLoadingScreen />;
  if (!session) return <LoginScreen goBack={() => undefined} openRegister={() => undefined} openAccount={goHome} showBackButton={false} />;
  if (needsOnboarding) return <OnboardingScreen onDone={() => setNeedsOnboarding(false)} />;
  const withToast = (screen: ReactElement) => (
    <>
      {screen}
      <AchievementToast achievements={recentAchievements} onDismiss={clearRecentAchievements} />
    </>
  );

  if (route.name === 'account') return withToast(<ProfileScreen navigate={setRoute} goBack={goHome} initialSection="account" />);
  if (route.name === 'map') return withToast(<MapScreen navigate={setRoute} goBack={goHome} />);
  if (route.name === 'premium') return withToast(<PremiumScreen goBack={goHome} />);
  if (route.name === 'dailyReward') return withToast(<DailyRewardScreen goBack={goHome} />);
  if (route.name === 'achievements') return withToast(<AchievementsScreen goBack={goHome} />);
  if (route.name === 'academy') return withToast(<AcademyScreen navigate={setRoute} goBack={goHome} />);
  if (route.name === 'lesson') return withToast(<LessonScreen lessonId={route.lessonId} navigate={setRoute} goBack={() => setRoute({ name: 'academy' })} />);
  if (route.name === 'codeArena') return withToast(<CodeArenaScreen navigate={setRoute} goBack={goHome} />);
  if (route.name === 'codeChallenge') return withToast(<CodeChallengeScreen challengeId={route.challengeId} challengeIds={route.challengeIds} goBack={() => setRoute({ name: 'codeArena' })} />);
  if (route.name === 'quiz') return withToast(<QuizScreen stage={route.stage} navigate={setRoute} goBack={() => setRoute({ name: 'map' })} />);
  if (route.name === 'profile') return withToast(<ProfileScreen navigate={setRoute} goBack={goHome} />);
  if (route.name === 'professorByte') return withToast(<ProfessorByteScreen goBack={() => setRoute(route.returnTo ?? { name: 'home' })} initialPrompt={route.initialPrompt} context={route.context} />);
  if (route.name === 'ranking') return withToast(<RankingScreen goBack={goHome} openProfile={() => setRoute({ name: 'profile' })} />);
  if (route.name === 'shop') return withToast(<ShopScreen goBack={goHome} openPremium={() => setRoute({ name: 'premium' })} openProfile={() => setRoute({ name: 'profile' })} />);
  if (route.name === 'settings') return withToast(<SettingsScreen goBack={goHome} openAccount={() => setRoute({ name: 'account' })} openFeedback={() => setRoute({ name: 'feedback' })} />);
  if (route.name === 'feedback') return withToast(<FeedbackScreen goBack={goHome} />);
  if (route.name === 'career') return withToast(<CareerScreen navigate={setRoute} goBack={goHome} />);
  if (route.name === 'campaign') return withToast(<CampaignScreen navigate={setRoute} goBack={goHome} />);
  if (route.name === 'reviewLab') return withToast(<ReviewLabScreen navigate={setRoute} goBack={goHome} />);

  return withToast(<HomeScreen navigate={setRoute} />);
}

function AchievementToast({ achievements, onDismiss }: { achievements: { title: string; icon: string; reward?: { xp?: number; coins?: number } }[]; onDismiss: () => void }) {
  const { colors } = useSettings();
  if (!achievements.length) return null;
  const first = achievements[0];
  const extra = achievements.length > 1 ? ` +${achievements.length - 1}` : '';
  const reward = first.reward ? ` • +${first.reward.xp ?? 0} XP / +${first.reward.coins ?? 0} moedas` : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Fechar conquista desbloqueada"
      onPress={onDismiss}
      style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.success }]}
    >
      <Text style={styles.toastIcon}>{first.icon}</Text>
      <View style={styles.toastCopy}>
        <Text style={[styles.toastKicker, { color: colors.success }]}>Conquista desbloqueada{extra}</Text>
        <Text style={[styles.toastTitle, { color: colors.text }]} numberOfLines={1}>{first.title}{reward}</Text>
      </View>
    </Pressable>
  );
}

function AuthLoadingScreen() {
  const { colors } = useSettings();
  return (
    <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.muted }]}>Verificando sessão...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontSize: 13, fontWeight: '800' },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  toastIcon: { fontSize: 24 },
  toastCopy: { flex: 1 },
  toastKicker: { fontSize: 11, lineHeight: 14, fontWeight: '900', textTransform: 'uppercase' },
  toastTitle: { fontSize: 13, lineHeight: 17, fontWeight: '900' }
});
