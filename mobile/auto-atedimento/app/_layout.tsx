// app/_layout.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

// Este componente não é mais necessário aqui, a lógica foi movida
// function AppStack() { ... }

function Frame() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="dark" />
      {/* A Stack agora define os grupos de rotas principais.
        O Expo Router e os layouts de cada grupo cuidarão do resto.
      */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Frame />
    </AuthProvider>
  );
}