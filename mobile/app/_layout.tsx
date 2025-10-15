import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import React, { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'
import { useAuthStore } from '@/store/authStore'

export default function RootLayout () {
  const colorScheme = useColorScheme()
  const user = useAuthStore(state => state.user)

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  const router = useRouter()

  // Wait for fonts to load before redirecting
  useEffect(() => {
    if (!loaded) return
    // If there's no user, redirect to auth login; otherwise go to tabs
    if (user) {
      // ensure we're at the main tabs
      router.replace('/(tabs)')
    } else {
      router.replace('/(auth)/login')
    }
  }, [loaded, user])

  if (!loaded) return null

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name='(tabs)'  />
        ) : (
          <Stack.Screen name='(auth)'  />
        )}
        <Stack.Screen
          name='consumption-detail/[id]/index'
          options={{
            headerShown: false, // 👈 this hides the header
            presentation: 'card'
          }}
        />
        <Stack.Screen name='+not-found' />
      </Stack>
      <StatusBar style='auto' />
    </ThemeProvider>
  )
}
