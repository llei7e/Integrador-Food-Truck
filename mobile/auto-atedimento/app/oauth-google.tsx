import { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function OAuthGoogle() {
  const router = useRouter();
  const { completeSocialLogin } = useAuth();
  
  // No Expo, usamos isso para pegar query params da URL (seja deep link ou web)
  const params = useLocalSearchParams();
  const rawPayload = params.payload as string;

  useEffect(() => {
    async function processLogin() {
      if (!rawPayload) {
        // Se abriu a tela sem payload, algo deu errado, volta pro login
        // (A não ser que o hook demore um pouco para carregar, mas geralmente é rápido)
        return; 
      }

      try {
        // 1️⃣ Decodifica o JSON vindo do backend
        // O backend enviou encodedURIComponent(json)
        const jsonStr = decodeURIComponent(rawPayload);
        const data = JSON.parse(jsonStr);

        const token = data.access_token;
        const userRaw = data.user; // Contém { id, name, email, cargo }

        if (!token || !userRaw) {
          console.error("Dados incompletos no payload do Google");
          router.replace("/(auth)/login");
          return;
        }

        // 2️⃣ Salva no Contexto (AsyncStorage)
        // Lembre-se: Atualizamos o completeSocialLogin para aceitar (token, userRaw)
        await completeSocialLogin(token, userRaw);

        // 3️⃣ Redirecionamento Inteligente por Cargo
        // Como o Contexto demora uns milissegundos para atualizar o estado 'user',
        // fazemos o redirecionamento manual aqui baseados no dado que acabamos de receber.
        if (userRaw.cargo === 'CHAPEIRO') {
            router.replace('/(protected)/telaChapeiro');
        } else {
            // USUARIO ou ADMIN
            router.replace('/(protected)/(tabs)/home');
        }

      } catch (err) {
        console.error("Erro ao processar login Google:", err);
        router.replace("/(auth)/login");
      }
    }

    processLogin();
  }, [rawPayload]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F39D0A" />
      <Text style={styles.text}>Finalizando acesso...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7E0000', // Mantendo a identidade visual
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});