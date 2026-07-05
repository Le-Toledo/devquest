import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const appBackground = '#080A0F';

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.stackContent
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appBackground
  },
  stackContent: {
    backgroundColor: appBackground
  }
});
