// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { PlayerProvider } from '@/contexts/PlayerContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <PlayerProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="player"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </PlayerProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
