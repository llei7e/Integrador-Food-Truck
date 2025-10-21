// app/(protected)/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // A verificação é feita aqui, dentro de um useEffect para evitar
    // a alteração de estado durante a renderização.
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [loading, user]);

  // Se estiver carregando, OU se o usuário não existir (e estiver
  // aguardando o redirecionamento do useEffect), mostre uma tela de carregamento.
  // Isso impede que o conteúdo protegido seja renderizado indevidamente.
  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7E0000" />
      </View>
    );
  }

  // Somente se o carregamento estiver completo E o usuário existir,
  // renderize o conteúdo protegido.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="detalhesProduto" options={{ headerShown: false }} />
      {/* Adicione outras telas que estão dentro de (protected) mas fora de (tabs) */}
    </Stack>
  );
}