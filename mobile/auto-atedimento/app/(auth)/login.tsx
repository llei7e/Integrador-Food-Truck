import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

// --- LÓGICA DE ESCALA MATEMÁTICA (VERTICAL) ---
const { width, height } = Dimensions.get('window');
// Garante que pegamos a menor dimensão (largura em modo retrato)
const realWidth = width < height ? width : height; 
// 768px é a largura base de um iPad/Tablet padrão em Retrato.
const guidelineBaseWidth = 768; 
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;
// -------------------------------------

const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

interface RegistrationErrors {
    nome?: string;
    email?: string;
    password?: string;
}

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

    // Redirecionamento
    useEffect(() => {
        if (!loading && user) {
            if (user.cargo === 'CHAPEIRO') {
                router.replace('/(protected)/telaChapeiro');
            } else {
                router.replace('/(protected)/(tabs)/home');
            }
        }
    }, [user, loading]);

    // Validação
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

    const handleEmailChange = (text: string) => { setEmail(text); if (errorMessage) setErrorMessage(null); };
    const handlePasswordChange = (text: string) => { setPassword(text); if (errorMessage) setErrorMessage(null); };
    const handleNomeChange = (text: string) => setNome(text);

    // Login
    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword || !isEmailValid(trimmedEmail) || trimmedPassword.length < 3) {
            setErrorMessage('Verifique seus dados.');
            return;
        }

        setSubmitting(true);
        try {
            await signIn(trimmedEmail.toLowerCase(), trimmedPassword);
        } catch (e: any) {
            if (e?.status === 403) setErrorMessage('E-mail ou senha inválidos.');
            else setErrorMessage(e?.message ?? 'Falha no login.');
        } finally {
            setSubmitting(false);
        }
    };

    // Cadastro
    const handleRegister = async () => {
        if (!isRegisterFormValid) return;
        setSubmitting(true);
        try {
            const defaultRole = "USUARIO"; 
            await signUp(nome.trim(), email.trim().toLowerCase(), password, defaultRole);
        } catch (e: any) {
            if (e?.status === 409) setErrorMessage('Este e-mail já está cadastrado.');
            else setErrorMessage(e?.message ?? 'Falha no cadastro.');
        } finally {
            setSubmitting(false);
        }
    };

    // Google
    const handleGoogleLogin = async () => {
        if (submitting) return; 
        setSubmitting(true);
        setErrorMessage(null);
        try {
            await signInWithGoogle();
        } catch (e: any) {
            setErrorMessage(e?.message ?? 'Login Google falhou.');
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

    if (user) return null;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={['#7E0000', '#520000']} style={styles.containerFull}>
                
                {/* Parte Superior (Logo e Texto) */}
                <View style={styles.higher}>
                    <View style={styles.headerTexts}>
                        <Text style={styles.headerText}>Seja Bem Vindo!</Text>
                        <Text style={styles.headerText}>{activeTab === 'login' ? 'Faça o Login' : 'Cadastre-se'}</Text>
                    </View>
                    <Image source={require('../../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
                </View>

                {/* Card Branco Inferior */}
                <View style={styles.lower}>
                    <View style={styles.LoginRegister}>
                        <TouchableOpacity style={[styles.tabButton, activeTab === 'login' ? styles.tabActive : styles.tabInactiveLeft]} onPress={() => { setActiveTab('login'); setErrorMessage(null); }}>
                            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>Entrar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabButton, activeTab === 'cadastro' ? styles.tabActive : styles.tabInactiveRight]} onPress={() => { setActiveTab('cadastro'); setErrorMessage(null); }}>
                            <Text style={[styles.tabText, activeTab === 'cadastro' && styles.tabTextActive]}>Cadastrar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* LOGIN FORM */}
                    {activeTab === 'login' && (
                        <View style={styles.formContainer}>
                            <View style={styles.inputs}>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="Digite seu e-mail" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={handleEmailChange} />
                                    <Ionicons name="mail-outline" size={scale(28)} color="#555" style={styles.icon} />
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#999" secureTextEntry={!showPassword} value={password} onChangeText={handlePasswordChange} />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={scale(28)} color="#A11613" style={styles.icon} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.errorContainer}>
                                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                            </View>
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]} onPress={handleLogin} disabled={submitting}>
                                    <Text style={styles.submitText}>{submitting ? 'Entrando...' : 'Entrar'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[{ opacity: submitting ? 0.7 : 1 }]} onPress={handleGoogleLogin} disabled={submitting}>
                                    <Image source={require('../../assets/images/logoGoogle.png')} style={styles.logoGoogle} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* CADASTRO FORM */}
                    {activeTab === 'cadastro' && (
                        <View style={styles.formContainer}>
                            <View style={styles.fieldContainer}>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#999" value={nome} onChangeText={handleNomeChange} />
                                    <Ionicons name="person-outline" size={scale(28)} color="#555" style={styles.icon} />
                                </View>
                                <View style={styles.realTimeErrorContainer}>
                                    {registrationErrors.nome && <Text style={styles.realTimeErrorText}>{registrationErrors.nome}</Text>}
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="Digite seu e-mail" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={handleEmailChange} />
                                    <Ionicons name="mail-outline" size={scale(28)} color="#555" style={styles.icon} />
                                </View>
                                <View style={styles.realTimeErrorContainer}>
                                    {registrationErrors.email && <Text style={styles.realTimeErrorText}>{registrationErrors.email}</Text>}
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#999" secureTextEntry={!showPassword} value={password} onChangeText={handlePasswordChange} />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={scale(28)} color="#A11613" style={styles.icon} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.realTimeErrorContainer}>
                                    {registrationErrors.password && <Text style={styles.realTimeErrorText}>{registrationErrors.password}</Text>}
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <View style={[styles.inputContainer, { backgroundColor: '#f0f0f0', borderBottomColor: '#aaa' }]}>
                                    <TextInput 
                                        style={[styles.input, { color: '#666' }]} 
                                        value="Cargo: USUÁRIO" 
                                        editable={false} 
                                    />
                                    <Ionicons name="briefcase-outline" size={scale(28)} color="#999" style={styles.icon} />
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.submitButton, { opacity: !isRegisterFormValid || submitting ? 0.6 : 1 }]} onPress={handleRegister} disabled={!isRegisterFormValid || submitting}>
                                <Text style={styles.submitText}>{submitting ? 'Cadastrando...' : 'Cadastrar'}</Text>
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
    
    // HEADER
    higher: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '30%', // Mantém a proporção da tela original
    },
    headerTexts: { gap: scale(10) },
    headerText: {
        color: 'white',
        fontSize: scale(35),
        fontWeight: '400',
        textShadowColor: 'black',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 2,
    },
    logo: { 
        height: scale(180), 
        width: scale(180) 
    },

    // CONTAINER BRANCO (CARD)
    lower: {
        backgroundColor: '#fffbfb',
        width: '70%', // Mantém a largura de 70% da tela, como no seu design
        paddingVertical: scale(50),
        alignSelf: 'center',
        borderRadius: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scale(50)
    },

    // ABAS (Login/Cadastro)
    LoginRegister: {
        flexDirection: 'row',
        backgroundColor: '#ddd',
        borderRadius: scale(50),
        gap: scale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(3) },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        marginBottom: scale(20),
    },
    tabButton: {
        paddingVertical: scale(20),
        paddingHorizontal: scale(30),
        alignItems: 'center',
        backgroundColor: '#ddd',
        borderRadius: scale(50), // Garante o formato de pílula
    },
    tabActive: {
        backgroundColor: '#7E0000',
        borderRadius: scale(50),
        paddingHorizontal: scale(40),
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    tabInactiveLeft: {
        borderTopLeftRadius: scale(50),
        borderBottomLeftRadius: scale(50),
    },
    tabInactiveRight: {
        borderTopRightRadius: scale(50),
        borderBottomRightRadius: scale(50),
    },
    tabText: { fontSize: scale(25), fontWeight: '500', color: '#333' },
    tabTextActive: { color: '#fff' },

    // FORMULÁRIOS
    formContainer: { width: '80%', alignItems: 'center'},
    inputs: { gap: scale(20), width: '100%', alignItems: 'center', marginTop: scale(20) },
    
    fieldContainer: { width: '100%', gap: scale(8), marginBottom: scale(10) },
    
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: scale(3), // Borda proporcional
        borderBottomColor: '#7E0000',
        width: '100%',
    },
    input: {
        flex: 1,
        fontSize: scale(20),
        color: '#000',
        marginTop: scale(10),
        paddingVertical: scale(10),
    },
    icon: { marginHorizontal: scale(10) },

    // BOTÕES
    buttonsContainer:{ 
        width: '100%',
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        marginTop: scale(25)
    },
    submitButton: {
        marginTop: scale(20),
        width: scale(200),
        backgroundColor: '#7E0000',
        paddingVertical: scale(20),
        borderRadius: scale(50),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    submitText: { color: '#fff', fontSize: scale(25), fontWeight: 'bold' },
    
    logoGoogle: { 
        height: scale(70), 
        width: scale(70), 
        borderRadius: scale(20), 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 3
    },

    // ERROS
    errorContainer: {
        marginTop: scale(10),
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: scale(14),
        textAlign: 'center',
        fontWeight: '500',
    },
    realTimeErrorContainer: {
        justifyContent: 'center',
    },
    realTimeErrorText: { color: '#D32F2F', fontSize: scale(12) },
});