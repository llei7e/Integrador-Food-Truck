import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const inProtectedGroup = segments[0] === '(protected)';
    const currentRoute = segments[1];

    if (!inProtectedGroup || !currentRoute) return;

    if (user.cargo === 'CHAPEIRO') {
      const allowedRoutes = ['telaChapeiro', 'definicaoProdutos'];
      if (!allowedRoutes.includes(currentRoute)) {

        router.replace('/(protected)/telaChapeiro');
      }
    }
    else {

      const allowedRoutes = ['(tabs)', 'detalhesProduto', 'pagamento', 'agradecimento', 'carrinho'];

      if (!allowedRoutes.includes(currentRoute)) {

        router.replace('/(protected)/(tabs)/home');
      }
    }

  }, [user, loading, segments]);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7E0000" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Telas do Usuário */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="detalhesProduto"
      />
      <Stack.Screen name="carrinho" />
      <Stack.Screen name="pagamento" />
      <Stack.Screen name="agradecimento" />

      {/* Telas do Chapeiro */}
      <Stack.Screen name="telaChapeiro" />
      <Stack.Screen name="definicaoProdutos" />
    </Stack>
  );
}