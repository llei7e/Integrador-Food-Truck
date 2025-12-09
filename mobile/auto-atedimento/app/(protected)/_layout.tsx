import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [loading, user]);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7E0000" />
      </View>
    );
  }

  // --- LÓGICA DE CARGOS ---
  const isChapeiro = user.cargo === 'CHAPEIRO';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      {/* SE FOR CHAPEIRO: Apenas telas de trabalho */}
      {isChapeiro ? (
        <>
          <Stack.Screen name="telaChapeiro" />
          <Stack.Screen name="definicaoProdutos" />
        </>
      ) : (
      /* SE FOR USUARIO COMUM: Apenas telas de cliente */
        <>
          <Stack.Screen name="(tabs)" />
          {/* Telas que o cliente acessa (como modais) */}
          <Stack.Screen 
             name="detalhesProduto" 
             options={{ presentation: 'modal' }} 
          />
           <Stack.Screen name="pagamento" />
           <Stack.Screen name="agradecimento" />
        </>
      )}

    </Stack>
  );
}