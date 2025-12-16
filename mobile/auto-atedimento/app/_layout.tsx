
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext'; 

function Frame() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
        <Stack.Screen 
          name="detalhesProduto" 
          options={{ 
            headerShown: false, 
            presentation: 'modal', 
          }} 
        />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
       <CartProvider> 
        <Frame />
       </CartProvider>
    </AuthProvider>
  );
}