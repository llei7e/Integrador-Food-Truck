import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Stack, router } from 'expo-router'; // << importa o router
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [activeTab, setActiveTab] = useState<"cadastro" | "login">("cadastro");

  // States do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Aqui você poderia validar email/senha antes
    router.push("/(tabs)/home"); 
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.containerFull}>
        {/* Logo */}
        <Image
          source={require("../assets/images/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Tabs Cadastrar / Entrar */}
        <View style={styles.LoginRegister}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "login" && styles.tabActive]}
            onPress={() => setActiveTab("login")}
          >
            <Text style={[styles.tabText, activeTab === "login" && styles.tabTextActive]}>
              Entrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "cadastro" && styles.tabActive]}
            onPress={() => setActiveTab("cadastro")}
          >
            <Text style={[styles.tabText, activeTab === "cadastro" && styles.tabTextActive]}>
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
              <Ionicons name="mail-outline" size={20} color="#555" style={styles.icon} />
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
                  size={20}
                  color="#555"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
              <Text style={styles.submitText}>Entrar</Text>
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
              <Ionicons name="person-outline" size={20} color="#555" style={styles.icon} />
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
              <Ionicons name="mail-outline" size={20} color="#555" style={styles.icon} />
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
                  size={20}
                  color="#A11613"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  containerFull: {
    flex: 1,
    backgroundColor: "#EFEAEA",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  logo: {
    height: 160,
    width: 160,
  },
  LoginRegister: {
    flexDirection: "row",
    gap: 15,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabActive: {
    backgroundColor: "#7E0000",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  tabTextActive: {
    color: "#fff",
  },
  inputs: {
    gap: 20,
    width: "60%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#7E0000",
    paddingVertical: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingBottom: 15,
    paddingTop: 10,
    paddingLeft: 0, // garante alinhamento
  },
  icon: {
    marginHorizontal: 5,
  },
  submitButton: {
    marginTop: 15,
    backgroundColor: "#7E0000",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  submitText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
})
