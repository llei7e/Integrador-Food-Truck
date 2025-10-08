// app/(auth)/login.tsx
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { RFPercentage } from 'react-native-responsive-fontsize';

export default function Login() {
  const [activeTab, setActiveTab] = useState<"cadastro" | "login">("login");

  // States do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn, signUp, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(protected)/(tabs)/home');
    }
  }, [user, loading]);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMessage) setErrorMessage(null);
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMessage) setErrorMessage(null);
  };
  const handleNomeChange = (text: string) => {
    setNome(text);
    if (errorMessage) setErrorMessage(null);
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Preencha e-mail e senha.");
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace("/(protected)/(tabs)/home");
    } catch (e: any) {
      if (e?.status === 403) {
        setErrorMessage("E-mail ou senha inválidos.");
      } else {
        setErrorMessage(e?.message ?? "Falha no login. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(nome.trim(), email.trim().toLowerCase(), password);
      router.replace("/(protected)/(tabs)/home");
    } catch (e: any)
    {
      if (e?.status === 409) {
          setErrorMessage("Este e-mail já está cadastrado.");
      } else {
          setErrorMessage(e?.message ?? "Falha no cadastro. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
     return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#7E0000" }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (user) {
    return null;
  }

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
          <View style={styles.LoginRegister}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "login" ? styles.tabActive : styles.tabInactiveLeft,
              ]}
              onPress={() => { setActiveTab("login"); setErrorMessage(null); }}
            >
              <Text style={[styles.tabText, activeTab === "login" && styles.tabTextActive]}>
                Entrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "cadastro" ? styles.tabActive : styles.tabInactiveRight,
              ]}
              onPress={() => { setActiveTab("cadastro"); setErrorMessage(null); }}
            >
              <Text style={[styles.tabText, activeTab === "cadastro" && styles.tabTextActive]}>
                Cadastrar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulário Login */}
          {activeTab === "login" && (
            <View style={styles.formContainer}>
              <View style={styles.inputs}>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Digite seu e-mail" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={handleEmailChange} />
                  <Ionicons name="mail-outline" size={35} color="#555" style={styles.icon} />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#999" secureTextEntry={!showPassword} value={password} onChangeText={handlePasswordChange} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={35} color="#555" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.errorContainer}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
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
            <View style={styles.formContainer}>
              <View style={styles.inputs}>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#999" value={nome} onChangeText={handleNomeChange} />
                  <Ionicons name="person-outline" size={35} color="#555" style={styles.icon} />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Digite seu e-mail" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={handleEmailChange} />
                  <Ionicons name="mail-outline" size={35} color="#555" style={styles.icon} />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#999" secureTextEntry={!showPassword} value={password} onChangeText={handlePasswordChange} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={35} color="#A11613" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.errorContainer}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
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
    borderRadius: 50,
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
  formContainer: {
    width: "80%",
    alignItems: 'center',
  },
  inputs: {
    gap: 30,
    width: "100%",
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
    paddingLeft: 0,
  },
  icon: {
    marginHorizontal: 5,
  },
  submitButton: {
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
  errorContainer: { // Novo container para reservar espaço
    height: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: RFPercentage(1.5),
    textAlign: 'center',
    fontWeight: '500',
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
    gap: RFPercentage(3), // Gap ajustado
  },
  headerText: {
    color: 'white',
    fontSize: 35,
    fontWeight: '400',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  headerTexts:{
    gap:10
  }
});