import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { GradientScreen } from '../components/GradientScreen';
import { HomeDashboard } from '../components/HomeDashboard';
import { usePlayer } from '../hooks/usePlayer';
import { Navigate } from '../navigation/routes';
import { defaultStreakState, streakService, StreakState } from '../services/streakService';

export function HomeScreen({ navigate }: { navigate: Navigate }) {
  const { recordActivity } = usePlayer();
  const loginRecorded = useRef(false);
  const [streak, setStreak] = useState<StreakState>(defaultStreakState);

  useEffect(() => {
    streakService.load().then(setStreak).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (loginRecorded.current) return;
    loginRecorded.current = true;
    recordActivity({ type: 'login' });
  }, [recordActivity]);

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <HomeDashboard navigate={navigate} streak={streak} />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    paddingBottom: 36
  }
});
