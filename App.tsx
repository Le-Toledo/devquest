import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { PlayerProvider } from "./src/hooks/usePlayer";
import { SettingsProvider } from "./src/hooks/useSettings";
import { AuthProvider } from "./src/hooks/useAuth";
import { useSettings } from "./src/hooks/useSettings";

export default function App() {
  return (
    <SafeAreaProvider style={styles.provider}>
      <SettingsProvider>
        <AppRoot />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function AppRoot() {
  const { colors, theme } = useSettings();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        backgroundColor={colors.background}
        translucent
      />
      <AuthProvider>
        <PlayerProvider>
          <AppNavigator />
        </PlayerProvider>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
    backgroundColor: "#080A0F",
  },
  root: {
    flex: 1,
  },
});
