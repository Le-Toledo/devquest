import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../hooks/useSettings';
import { gradients } from '../theme';

export function GradientScreen({ children }: { children: ReactNode }) {
  const { theme } = useSettings();
  const palette = theme === 'dark' ? gradients.dark : gradients.light;
  return (
    <LinearGradient colors={palette} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <View pointerEvents="none" style={styles.topBand} />
        <View pointerEvents="none" style={styles.gridBand} />
        <View pointerEvents="none" style={styles.lowerBand} />
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  topBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 148,
    backgroundColor: '#49E3B312'
  },
  gridBand: {
    position: 'absolute',
    top: 147,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFFFFF12'
  },
  lowerBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    backgroundColor: '#8EA7FF0A'
  }
});
