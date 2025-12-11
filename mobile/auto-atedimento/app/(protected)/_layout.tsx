import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments(); // Hook para saber a rota atual

  useEffect(() => {
    // 1. Aguarda carregamento
    if (loading) return;

    // 2. Se não tem usuário, manda pro login
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    // 3. Lógica de Proteção de Rotas por Cargo
    // 'segments' retorna um array tipo ['(protected)', 'telaChapeiro']
    const inProtectedGroup = segments[0] === '(protected)';
    const currentRoute = segments[1]; // A tela específica que ele está tentando acessar

    // Se ainda não navegou para uma rota específica dentro de protected, deixa o fluxo seguir
    if (!inProtectedGroup || !currentRoute) return;

    if (user.cargo === 'CHAPEIRO') {
      // Lista de telas permitidas para Chapeiro
      const allowedRoutes = ['telaChapeiro', 'definicaoProdutos'];

      // Se a rota atual NÃO está na lista permitida
      if (!allowedRoutes.includes(currentRoute)) {
        // Redireciona para a primeira tela do escopo dele
        router.replace('/(protected)/telaChapeiro');
      }
    } 
    else {
      // Assume que é USUARIO (ou qualquer outro cargo não-admin/chapeiro)
      // Lista de telas permitidas para Usuário
      // Nota: '(tabs)' engloba a home. Adicione 'carrinho' se for uma rota fora das tabs.
      const allowedRoutes = ['(tabs)', 'detalhesProduto', 'pagamento', 'agradecimento', 'carrinho'];

      if (!allowedRoutes.includes(currentRoute)) {
        // Redireciona para a primeira tela do escopo dele (Home)
        router.replace('/(protected)/(tabs)/home');
      }
    }

  }, [user, loading, segments]);

  // Enquanto verifica a auth/cargo, mostra loading para não piscar tela errada
  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7E0000" />
      </View>
    );
  }

  // Define todas as telas possíveis na Stack.
  // O useEffect acima impede que o usuário veja o que não deve.
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