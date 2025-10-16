import React from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/authStore'

export default function RootIndex() {
  const user = useAuthStore(state => state.user)
  if (user) {
    return <Redirect href='/(tabs)' />
  }
  return <Redirect href='/(auth)/login' />
}


