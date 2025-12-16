import { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function OAuthGoogle() {
  const router = useRouter();
  const { completeSocialLogin } = useAuth();
  
  const params = useLocalSearchParams();
  const rawPayload = params.payload as string;

  useEffect(() => {
    async function processLogin() {
      if (!rawPayload) {
        return; 
      }

      try {
        const jsonStr = decodeURIComponent(rawPayload);
        const data = JSON.parse(jsonStr);

        const token = data.access_token;
        const userRaw = data.user; 

        if (!token || !userRaw) {
          console.error("Dados incompletos no payload do Google");
          router.replace("/(auth)/login");
          return;
        }
        await completeSocialLogin(token, userRaw);

        if (userRaw.cargo === 'CHAPEIRO') {
            router.replace('/(protected)/telaChapeiro');
        } else { 
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
    backgroundColor: '#7E0000', 
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