import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { GradientScreen } from '../components/GradientScreen';
import { HomeDashboard } from '../components/HomeDashboard';
import { Navigate } from '../navigation/routes';
import { defaultStreakState, streakService, StreakState } from '../services/streakService';

export function HomeScreen({ navigate }: { navigate: Navigate }) {
  const [streak, setStreak] = useState<StreakState>(defaultStreakState);

  useEffect(() => {
    streakService.load().then(setStreak).catch(() => undefined);
  }, []);

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
