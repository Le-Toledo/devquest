import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { PlayerProvider } from "./src/hooks/usePlayer";
import { SettingsProvider } from "./src/hooks/useSettings";
import { AuthProvider } from "./src/hooks/useAuth";

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <PlayerProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </PlayerProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
