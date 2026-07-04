import { useEffect, useState } from 'react';
import { AppRoute } from './routes';
import {
  AcademyScreen,
  AccountScreen,
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
  RegisterScreen,
  ReviewLabScreen,
  SettingsScreen,
  ShopScreen
} from '@screens';
import { streakService } from '@services';

export function AppNavigator() {
  const [route, setRoute] = useState<AppRoute>({ name: 'home' });
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const goHome = () => setRoute({ name: 'home' });

  useEffect(() => {
    streakService.loadOnboarding().then((state) => setNeedsOnboarding(!state.completed)).finally(() => setCheckingOnboarding(false));
  }, []);

  if (checkingOnboarding) return null;
  if (needsOnboarding) return <OnboardingScreen onDone={() => setNeedsOnboarding(false)} />;
  if (route.name === 'login') return <LoginScreen goBack={goHome} openRegister={() => setRoute({ name: 'register' })} openAccount={() => setRoute({ name: 'account' })} />;
  if (route.name === 'register') return <RegisterScreen goBack={goHome} openLogin={() => setRoute({ name: 'login' })} openAccount={() => setRoute({ name: 'account' })} />;
  if (route.name === 'account') return <AccountScreen goBack={goHome} openLogin={() => setRoute({ name: 'login' })} />;
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
