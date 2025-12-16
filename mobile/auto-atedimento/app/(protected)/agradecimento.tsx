import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';


const { width, height } = Dimensions.get('window');
const realWidth = width < height ? width : height; 
const guidelineBaseWidth = 768; 
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;


export default function Agradecimento() {

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(protected)/(tabs)/home');
    }, 3000);
    return () => clearTimeout(timer); 
  }, []); 

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Logo */}
          <Image
            source={require("../../assets/images/Logo.png")}
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
              source={require('../../assets/images/check.png')}
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
  header: { 
    backgroundColor: '#201000ff', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: "25%" 
  }, 
  logo: { 
    width: scale(250), 
    height: scale(250), 
    resizeMode: 'contain' 
  },  
  bodyContainer: { 
    height: "70%", 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: "center" 
  },
  card: {
    width: '90%', 
    height: "70%", 
    backgroundColor: '#fff',
    borderRadius: scale(100), 
    padding: scale(30),
    gap: scale(80), 
    justifyContent: "center",
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 5,
  },
  message: { 
    fontSize: scale(35), 
    textAlign: 'center', 
    marginBottom: scale(40), 
    color: '#333',
    fontWeight: 'bold' 
  },
  checkIcon: { 
    width: scale(150), 
    height: scale(150), 
    resizeMode: 'contain' 
  },
});