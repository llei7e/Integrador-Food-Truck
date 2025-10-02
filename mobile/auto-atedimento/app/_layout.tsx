// app/_layout.tsx
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Slot, Stack } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";

function AppStack() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}> {/* <- aqui */}
      {user ? (
        <Stack.Screen name="(tabs)/home" />
      ) : (
        <Stack.Screen name="login" />
      )}
    </Stack>
  );
}

function Frame() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />
      <AppStack />
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
