import { View, Text, StyleSheet, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

export default function Agradecimento() {

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home'); // redireciona para a Home
    }, 3000); 

    return () => clearTimeout(timer); // limpa o timer ao desmontar
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Logo */}
          <Image
            source={require("../assets/images/Logo.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.bodyContainer}>
          {/* Card de agradecimento */}
          <View style={styles.card}>
            <View>
              <Text style={styles.message}>Agradecemos a sua preferência</Text>
              <Text style={styles.message}>Tenha uma ótima refeição e volte sempre</Text>
            </View>
            <Image
              source={require('../assets/images/check.png')}
              style={styles.checkIcon}
            />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  logo: { width: 250, height: 250, resizeMode: 'contain' },
  card: {
    width: '90%',
    height: "70%",
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 30,
    gap: 100,
    justifyContent: "center",
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  message: { fontSize: 35, textAlign: 'center', marginBottom: 40, color: '#333' },
  checkIcon: { width: 150, height: 150, resizeMode: 'contain' },
  header: { backgroundColor: '#201000ff', alignItems: 'center', justifyContent: 'center', height: "25%" },
  bodyContainer: { height: "70%", flexDirection: 'column', alignItems: 'center', justifyContent: "center" },
});
