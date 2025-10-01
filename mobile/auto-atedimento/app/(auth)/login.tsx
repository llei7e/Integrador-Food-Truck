import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

export default function Login() {
  const [activeTab, setActiveTab] = useState<"cadastro" | "login">("login");

  // States do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Ops", "Preencha e-mail e senha.");
    }

    setSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace("/(tabs)/home"); // redireciona após login
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha no login");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Ops", "Preencha todos os campos.");
    }

    setSubmitting(true);
    try {
      await signUp(nome.trim(), email.trim().toLowerCase(), password);
      router.replace("/(tabs)/home"); // redireciona após cadastro
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha no cadastro");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#7E0000", "#520000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.containerFull}
      >
        <View style={styles.higher}>
          <View style={styles.headerTexts}>
            <Text style={styles.headerText}>Seja Bem Vindo!</Text>
            <Text style={styles.headerText}>{activeTab === "login" ? "Faça o Login" : "Cadastre-se"}</Text>
          </View>
          <Image
            source={require("../../assets/images/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.lower}>
          {/* Tabs Cadastrar / Entrar */}
          <View style={styles.LoginRegister}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "login" ? styles.tabActive : styles.tabInactiveLeft,
              ]}
              onPress={() => setActiveTab("login")}
            >
              <Text
                style={[styles.tabText, activeTab === "login" && styles.tabTextActive]}
              >
                Entrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "cadastro" ? styles.tabActive : styles.tabInactiveRight,
              ]}
              onPress={() => setActiveTab("cadastro")}
            >
              <Text
                style={[styles.tabText, activeTab === "cadastro" && styles.tabTextActive]}
              >
                Cadastrar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulário Login */}
          {activeTab === "login" && (
            <View style={styles.inputs}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <Ionicons name="mail-outline" size={35} color="#555" style={styles.icon} />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={35}
                    color="#555"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={submitting}
              >
                <Text style={styles.submitText}>{submitting ? "Entrando..." : "Entrar"}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Formulário Cadastro */}
          {activeTab === "cadastro" && (
            <View style={styles.inputs}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome"
                  placeholderTextColor="#999"
                  value={nome}
                  onChangeText={setNome}
                />
                <Ionicons name="person-outline" size={35} color="#555" style={styles.icon} />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <Ionicons name="mail-outline" size={35} color="#555" style={styles.icon} />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={35}
                    color="#A11613"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleRegister}
                disabled={submitting}
              >
                <Text style={styles.submitText}>{submitting ? "Cadastrando..." : "Cadastrar"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  containerFull: {
    flex: 1,
    backgroundColor: "#EFEAEA",
  },
  logo: {
    height: 200,
    width: 200,
  },
  LoginRegister: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    borderRadius: 50,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
},

tabButton: {
  flex: 1,
  paddingVertical: 25,
  paddingHorizontal: 40,
  alignItems: "center",
  backgroundColor: "#ddd",
},

tabActive: {
  backgroundColor: "#7E0000",
  borderRadius: 50, // arredonda todos os lados
  shadowColor: "#000",
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},

tabInactiveLeft: {
  borderTopLeftRadius: 50,
  borderBottomLeftRadius: 50,
},

tabInactiveRight: {
  borderTopRightRadius: 50,
  borderBottomRightRadius: 50,
},

tabText: {
  fontSize: 30,
  fontWeight: "500",
  color: "#333",
},

tabTextActive: {
  color: "#fff",
},

  inputs: {
    gap: 30,
    width: "80%",
    alignItems: 'center'
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#7E0000",
    paddingVertical: 1,
    width:"100%"
  },
  input: {
    flex: 1,
    fontSize: 28,
    color: "#000",
    paddingBottom: RFPercentage(3),
    paddingTop: 10,
    paddingLeft: 0, // garante alinhamento
  },
  icon: {
    marginHorizontal: 5,
  },
  submitButton: {
    marginTop: RFPercentage(5),
    backgroundColor: "#7E0000",
    paddingVertical: 25,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    width: "60%",
  },
  submitText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  higher:{
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: "25%",
  },
  lower:{
    marginTop: RFPercentage(2),
    backgroundColor: "#fffbfb",
    width: "70%",
    height: "65%",
    marginHorizontal: "15%",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: RFPercentage(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  headerText: {
    color: 'white',
    fontSize: 35,
    fontWeight: '400',
    textShadowColor: 'black', // cor da sombra
    textShadowOffset: { width: 1, height: 2 }, // deslocamento da sombra
    textShadowRadius: 2, // desfoque da sombra
  },
  headerTexts:{
    gap:10
  }
})
