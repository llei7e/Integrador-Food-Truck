import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

// --- LÓGICA DE VALIDAÇÃO ---
const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

interface RegistrationErrors {
    nome?: string;
    email?: string;
    password?: string;
}
// --- FIM DA LÓGICA DE VALIDAÇÃO ---

export default function Login() {
    const [activeTab, setActiveTab] = useState<'cadastro' | 'login'>('login');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [registrationErrors, setRegistrationErrors] = useState<RegistrationErrors>({});
    const [isRegisterFormValid, setIsRegisterFormValid] = useState(false);

    const { signIn, signUp, user, loading, signInWithGoogle } = useAuth();

    // --- REDIRECIONAMENTO INTELIGENTE ---
    useEffect(() => {
        if (!loading && user) {
            // Verifica o cargo para decidir a rota inicial
            if (user.cargo === 'CHAPEIRO') {
                router.replace('/(protected)/telaChapeiro');
            } else {
                // USUARIO ou qualquer outro vai pra Home (Cardápio)
                router.replace('/(protected)/(tabs)/home');
            }
        }
    }, [user, loading]);

    // Validação do formulário de cadastro
    useEffect(() => {
        if (activeTab === 'cadastro') {
            const newErrors: RegistrationErrors = {};

            if (nome.trim().length > 0 && nome.trim().length < 3)
                newErrors.nome = 'O nome deve ter no mínimo 3 caracteres.';

            if (email.trim().length > 0 && !isEmailValid(email.trim()))
                newErrors.email = 'Formato de e-mail inválido.';

            if (password.trim().length > 0 && password.trim().length < 6)
                newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';

            setRegistrationErrors(newErrors);

            const allFieldsFilled =
                nome.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0;
            setIsRegisterFormValid(Object.keys(newErrors).length === 0 && allFieldsFilled);
        }
    }, [nome, email, password, activeTab]);

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (errorMessage) setErrorMessage(null);
    };
    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (errorMessage) setErrorMessage(null);
    };
    const handleNomeChange = (text: string) => setNome(text);

    // --- Handler para Login com Email/Senha ---
    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setErrorMessage('Preencha e-mail e senha.');
            return;
        }
        if (!isEmailValid(trimmedEmail)) {
            setErrorMessage('Por favor, insira um e-mail válido.');
            return;
        }
        if (trimmedPassword.length < 3) {
            setErrorMessage('A senha deve ter no mínimo 3 caracteres.');
            return;
        }

        setSubmitting(true);
        try {
            await signIn(trimmedEmail.toLowerCase(), trimmedPassword);
            // O useEffect cuidará do redirecionamento
        } catch (e: any) {
            if (e?.status === 403) setErrorMessage('E-mail ou senha inválidos.');
            else setErrorMessage(e?.message ?? 'Falha no login. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Handler para Registro (Cadastro) ---
    const handleRegister = async () => {
        if (!isRegisterFormValid) return;
        setSubmitting(true);
        try {
            await signUp(nome.trim(), email.trim().toLowerCase(), password);
            // O useEffect cuidará do redirecionamento
        } catch (e: any) {
            if (e?.status === 409) setErrorMessage('Este e-mail já está cadastrado.');
            else setErrorMessage(e?.message ?? 'Falha no cadastro. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Handler para Login com Google ---
    const handleGoogleLogin = async () => {
        if (submitting) return; 
        setSubmitting(true);
        setErrorMessage(null);

        try {
            await signInWithGoogle();
            // O useEffect cuidará do redirecionamento
        } catch (e: any) {
            setErrorMessage(e?.message ?? 'Falha ao fazer login com Google.');
            setSubmitting(false); 
        } 
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7E0000' }}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    if (user) return null; // Já logado, o useEffect vai redirecionar

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={['#7E0000', '#520000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.containerFull}
            >
                <View style={styles.higher}>
                    <View style={styles.headerTexts}>
                        <Text style={styles.headerText}>Seja Bem Vindo!</Text>
                        <Text style={styles.headerText}>
                            {activeTab === 'login' ? 'Faça o Login' : 'Cadastre-se'}
                        </Text>
                    </View>
                    <Image
                        source={require('../../assets/images/Logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.lower}>
                    <View style={styles.LoginRegister}>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === 'login' ? styles.tabActive : styles.tabInactiveLeft,
                            ]}
                            onPress={() => {
                                setActiveTab('login');
                                setErrorMessage(null);
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                                Entrar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === 'cadastro' ? styles.tabActive : styles.tabInactiveRight,
                            ]}
                            onPress={() => {
                                setActiveTab('cadastro');
                                setErrorMessage(null);
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === 'cadastro' && styles.tabTextActive]}>
                                Cadastrar
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* LOGIN */}
                    {activeTab === 'login' && (
                        <View style={styles.formContainer}>
                            <View style={styles.inputs}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Digite seu e-mail"
                                        placeholderTextColor="#999"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={handleEmailChange}
                                    />
                                    <Ionicons
                                        name="mail-outline"
                                        size={RFPercentage(4)}
                                        color="#555"
                                        style={styles.icon}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Digite sua senha"
                                        placeholderTextColor="#999"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={RFPercentage(4)}
                                            color="#A11613"
                                            style={styles.icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.errorContainer}>
                                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                            </View>

                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity
                                    style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]}
                                    onPress={handleLogin}
                                    disabled={submitting}
                                >
                                    <Text style={styles.submitText}>
                                        {submitting ? 'Entrando...' : 'Entrar'}
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[{ opacity: submitting ? 0.7 : 1 }]}
                                    onPress={handleGoogleLogin}
                                    disabled={submitting}
                                >
                                    <Image
                                        source={require('../../assets/images/logoGoogle.png')}
                                        style={styles.logoGoogle}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* CADASTRO */}
                    {activeTab === 'cadastro' && (
                        <View style={styles.formContainer}>
                            {/* Nome */}
                            <View style={styles.fieldContainer}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nome"
                                        placeholderTextColor="#999"
                                        value={nome}
                                        onChangeText={handleNomeChange}
                                    />
                                    <Ionicons
                                        name="person-outline"
                                        size={RFPercentage(4)}
                                        color="#555"
                                        style={styles.icon}
                                    />
                                </View>
                                <View style={styles.realTimeErrorContainer}>
                                    {registrationErrors.nome && (
                                        <Text style={styles.realTimeErrorText}>{registrationErrors.nome}</Text>
                                    )}
                                </View>
                            </View>

                            {/* E-mail */}
                            <View style={styles.fieldContainer}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Digite seu e-mail"
                                        placeholderTextColor="#999"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={handleEmailChange}
                                    />
                                    <Ionicons
                                        name="mail-outline"
                                        size={RFPercentage(4)}
                                        color="#555"
                                        style={styles.icon}
                                    />
                                </View>
                                <View style={styles.realTimeErrorContainer}>
                                    {registrationErrors.email && (
                                        <Text style={styles.realTimeErrorText}>{registrationErrors.email}</Text>
                                    )}
                                </View>
                            </View>

                            {/* Senha */}
                            <View style={styles.fieldContainer}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Digite sua senha"
                                        placeholderTextColor="#999"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={RFPercentage(4)}
                                            color="#A11613"
                                            style={styles.icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.realTimeErrorContainer}>
                                    {registrationErrors.password && (
                                        <Text style={styles.realTimeErrorText}>{registrationErrors.password}</Text>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, { opacity: !isRegisterFormValid || submitting ? 0.6 : 1 }]}
                                onPress={handleRegister}
                                disabled={!isRegisterFormValid || submitting}
                            >
                                <Text style={styles.submitText}>
                                    {submitting ? 'Cadastrando...' : 'Cadastrar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    containerFull: { flex: 1, backgroundColor: '#EFEAEA' },
    logo: { height: RFPercentage(16), width: RFPercentage(16) },
    logoGoogle: { 
        height: RFPercentage(10), 
        width: RFPercentage(10), 
        borderRadius: 30, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 3
    },
    LoginRegister: {
        flexDirection: 'row',
        backgroundColor: '#ddd',
        borderRadius: RFPercentage(6),
        gap: RFPercentage(1),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: RFPercentage(2.5),
        paddingHorizontal: wp(4),
        alignItems: 'center',
        backgroundColor: '#ddd',
    },
    tabActive: {
        backgroundColor: '#7E0000',
        borderRadius: RFPercentage(5),
    paddingHorizontal: wp(6),
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    tabInactiveLeft: {
        borderTopLeftRadius: RFPercentage(5),
        borderBottomLeftRadius: RFPercentage(5),
    },
    tabInactiveRight: {
        borderTopRightRadius: RFPercentage(5),
        borderBottomRightRadius: RFPercentage(5),
    },
    tabText: { fontSize: RFPercentage(2.5), fontWeight: '500', color: '#333' },
    tabTextActive: { color: '#fff' },
    formContainer: { width: '80%', alignItems: 'center'},
    inputs: { gap: RFPercentage(2), width: '100%', alignItems: 'center', marginTop: RFPercentage(3), },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: RFPercentage(0.4),
        borderBottomColor: '#7E0000',
        width: '100%',
    },
    input: {
        flex: 1,
        fontSize: RFPercentage(2.5),
        color: '#000',
        marginTop: RFPercentage(2),
    paddingVertical: RFPercentage(1),
    },
    icon: { marginHorizontal: wp(1.5) },
    submitButton: {
        backgroundColor: '#7E0000',
        paddingVertical: RFPercentage(2),
        paddingHorizontal: wp(10),
        borderRadius: RFPercentage(6),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    submitText: { color: '#fff', fontSize: RFPercentage(2.5), fontWeight: 'bold' },
    errorContainer: {
    marginTop: RFPercentage(1),
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: RFPercentage(1.8),
        textAlign: 'center',
        fontWeight: '500',
    },
    higher: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '25%',
    },
    lower: {
        marginTop: RFPercentage(0),
        backgroundColor: '#fffbfb',
        width: '70%',
        paddingVertical: RFPercentage(8),
        marginHorizontal: '15%',
        borderRadius: RFPercentage(5),
        alignItems: 'center',
        justifyContent: 'center',
        gap: RFPercentage(3),
    },
    headerText: {
        color: 'white',
        fontSize: RFPercentage(3.5),
        fontWeight: '400',
        textShadowColor: 'black',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 2,
    },
    headerTexts: { gap: RFPercentage(1.2) },
    fieldContainer: { width: '100%', gap: RFPercentage(1.5) },
    realTimeErrorContainer: {
        justifyContent: 'center',
    },
    realTimeErrorText: { color: '#D32F2F', fontSize: RFPercentage(1.7) },
    buttonsContainer:{ 
        width: '100%',
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        marginTop: RFPercentage(3)
    }
});