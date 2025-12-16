// app/_layout.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext'; // --- 1. IMPORTE O CartProvider ---

function Frame() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
        {/* --- 2. ADICIONE A TELA DE DETALHES AQUI --- */}
        {/* Isso permite que ela seja aberta "por cima" das abas */}
        <Stack.Screen 
          name="detalhesProduto" 
          options={{ 
            headerShown: false, // O seu código 'detalhesProduto' já esconde isso
            presentation: 'modal', // Faz a tela deslizar de baixo para cima
          }} 
        />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* --- 3. ADICIONE O CartProvider AQUI --- */}
       <CartProvider> 
        <Frame />
       </CartProvider>
    </AuthProvider>
  );
}