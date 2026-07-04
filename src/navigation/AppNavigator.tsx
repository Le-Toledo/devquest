import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppRoute } from './routes';
import {
  AcademyScreen,
  CareerScreen,
  CodeArenaScreen,
  CodeChallengeScreen,
  CampaignScreen,
  DailyRewardScreen,
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
import { streakService } from '@services';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { syncService } from '../services/syncService';

export function AppNavigator() {
  const { session, loading: checkingAuth } = useAuth();
  const { profile, loading: playerLoading, reloadProfile } = usePlayer();
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
    streakService.loadOnboarding().then((state) => setNeedsOnboarding(!state.completed)).finally(() => setCheckingOnboarding(false));
  }, []);

  useEffect(() => {
    if (!session) setRoute({ name: 'home' });
  }, [session]);

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
  if (route.name === 'account') return <ProfileScreen navigate={setRoute} goBack={goHome} initialSection="account" />;
  if (route.name === 'map') return <MapScreen navigate={setRoute} goBack={goHome} />;
  if (route.name === 'premium') return <PremiumScreen goBack={goHome} />;
  if (route.name === 'dailyReward') return <DailyRewardScreen goBack={goHome} />;
  if (route.name === 'academy') return <AcademyScreen navigate={setRoute} goBack={goHome} />;
  if (route.name === 'lesson') return <LessonScreen lessonId={route.lessonId} navigate={setRoute} goBack={() => setRoute({ name: 'academy' })} />;
  if (route.name === 'codeArena') return <CodeArenaScreen navigate={setRoute} goBack={goHome} />;
  if (route.name === 'codeChallenge') return <CodeChallengeScreen challengeId={route.challengeId} challengeIds={route.challengeIds} goBack={() => setRoute({ name: 'codeArena' })} />;
  if (route.name === 'quiz') return <QuizScreen stage={route.stage} navigate={setRoute} goBack={() => setRoute({ name: 'map' })} />;
  if (route.name === 'profile') return <ProfileScreen navigate={setRoute} goBack={goHome} />;
  if (route.name === 'professorByte') return <ProfessorByteScreen goBack={() => setRoute(route.returnTo ?? { name: 'home' })} initialPrompt={route.initialPrompt} context={route.context} />;
  if (route.name === 'ranking') return <RankingScreen goBack={goHome} />;
  if (route.name === 'shop') return <ShopScreen goBack={goHome} openPremium={() => setRoute({ name: 'premium' })} />;
  if (route.name === 'settings') return <SettingsScreen goBack={goHome} openAccount={() => setRoute({ name: 'account' })} />;
  if (route.name === 'career') return <CareerScreen navigate={setRoute} goBack={goHome} />;
  if (route.name === 'campaign') return <CampaignScreen navigate={setRoute} goBack={goHome} />;
  if (route.name === 'reviewLab') return <ReviewLabScreen navigate={setRoute} goBack={goHome} />;

  return <HomeScreen navigate={setRoute} />;
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
  loadingText: { fontSize: 13, fontWeight: '800' }
});
