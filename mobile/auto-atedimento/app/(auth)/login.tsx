import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';


const { width, height } = Dimensions.get('window');
const realWidth = width < height ? width : height; 
const guidelineBaseWidth = 768; 
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;


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

    
    useEffect(() => {
        if (!loading && user) {
            if (user.cargo === 'CHAPEIRO') {
                router.replace('/(protected)/telaChapeiro');
            } else {
                router.replace('/(protected)/(tabs)/home');
            }
        }
    }, [user, loading]);

    
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
    const handleNomeChange = (text: string) => { setNome(text); if (errorMessage) setErrorMessage(null); };

    
    const parseError = (error: any, context: 'login' | 'cadastro') => {
        const status = error?.status || error?.response?.status;
        const msg = error?.message?.toLowerCase() || '';

        if (context === 'login') {
            if (status === 401 || status === 403 || msg.includes('invalid') || msg.includes('credential')) {
                return 'E-mail ou senha incorretos.';
            }
            if (status === 404 || msg.includes('not found')) {
                return 'Usuário não encontrado.';
            }
        }

        if (context === 'cadastro') {
            if (status === 409 || msg.includes('exists') || msg.includes('already')) {
                return 'Este e-mail já está cadastrado.';
            }
            if (status === 400) {
                return 'Dados inválidos ou e-mail já em uso.';
            }
        }

        if (msg.includes('network') || msg.includes('conexão')) {
            return 'Sem conexão com a internet.';
        }

        return 'Ocorreu um erro inesperado. Tente novamente.';
    };

    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword || !isEmailValid(trimmedEmail)) {
            setErrorMessage('Verifique seu e-mail e senha.');
            return;
        }

        setSubmitting(true);
        setErrorMessage(null);

        try {
            await signIn(trimmedEmail.toLowerCase(), trimmedPassword);
        } catch (e: any) {
            setErrorMessage(parseError(e, 'login'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async () => {
        if (!isRegisterFormValid) return;
        
        setSubmitting(true);
        setErrorMessage(null);

        try {
            const defaultRole = "USUARIO"; 
            await signUp(nome.trim(), email.trim().toLowerCase(), password, defaultRole);
        } catch (e: any) {
            setErrorMessage(parseError(e, 'cadastro'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (submitting) return; 
        
        setSubmitting(true);
        setErrorMessage(null);
        
        try {
            await signInWithGoogle();
        } catch (e: any) {
            setErrorMessage('Falha ao conectar com Google.');
        } finally {
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
                
                {/* KeyboardAvoidingView empurra o conteúdo quando o teclado abre.
                    ScrollView permite arrastar se o conteúdo ficar maior que a tela.
                */}
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent} 
                        scrollEnabled={true} 
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        
                        {/* Parte Superior */}
                        <View style={styles.higher}>
                            <View style={styles.headerTexts}>
                                <Text style={styles.headerText}>Seja Bem Vindo!</Text>
                                <Text style={styles.headerText}>{activeTab === 'login' ? 'Faça o Login' : 'Cadastre-se'}</Text>
                            </View>
                            <Image source={require('../../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
                        </View>

                        {/* Card Branco */}
                        <View style={styles.lower}>
                            
                            {/* Tabs */}
                            <View style={styles.LoginRegister}>
                                <TouchableOpacity 
                                    style={[styles.tabButton, activeTab === 'login' ? styles.tabActive : styles.tabInactiveLeft]} 
                                    onPress={() => { setActiveTab('login'); setErrorMessage(null); }}
                                >
                                    <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>Entrar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.tabButton, activeTab === 'cadastro' ? styles.tabActive : styles.tabInactiveRight]} 
                                    onPress={() => { setActiveTab('cadastro'); setErrorMessage(null); }}
                                >
                                    <Text style={[styles.tabText, activeTab === 'cadastro' && styles.tabTextActive]}>Cadastrar</Text>
                                </TouchableOpacity>
                            </View>

                            {/* --- LOGIN --- */}
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
                                                editable={!submitting} 
                                            />
                                            <Ionicons name="mail-outline" size={scale(28)} color="#555" style={styles.icon} />
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <TextInput 
                                                style={styles.input} 
                                                placeholder="Digite sua senha" 
                                                placeholderTextColor="#999" 
                                                secureTextEntry={!showPassword} 
                                                value={password} 
                                                onChangeText={handlePasswordChange}
                                                editable={!submitting} 
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={scale(28)} color="#A11613" style={styles.icon} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.errorContainer}>
                                        {errorMessage && (
                                            <View style={styles.errorBox}>
                                                <Ionicons name="alert-circle" size={scale(20)} color="#D32F2F" />
                                                <Text style={styles.errorText}>{errorMessage}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.buttonsContainer}>
                                        <TouchableOpacity 
                                            style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]} 
                                            onPress={handleLogin} 
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <ActivityIndicator size="small" color="#FFF" />
                                            ) : (
                                                <Text style={styles.submitText}>Entrar</Text>
                                            )}
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={[{ opacity: submitting ? 0.5 : 1 }]} 
                                            onPress={handleGoogleLogin} 
                                            disabled={submitting}
                                        >
                                            <Image source={require('../../assets/images/logoGoogle.png')} style={styles.logoGoogle} resizeMode="contain" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* --- CADASTRO --- */}
                            {activeTab === 'cadastro' && (
                                <View style={styles.formContainer}>
                                    <View style={styles.fieldContainer}>
                                        <View style={styles.inputContainer}>
                                            <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#999" value={nome} onChangeText={handleNomeChange} editable={!submitting} />
                                            <Ionicons name="person-outline" size={scale(28)} color="#555" style={styles.icon} />
                                        </View>
                                        <View style={styles.realTimeErrorContainer}>
                                            {registrationErrors.nome && <Text style={styles.realTimeErrorText}>{registrationErrors.nome}</Text>}
                                        </View>
                                    </View>

                                    <View style={styles.fieldContainer}>
                                        <View style={styles.inputContainer}>
                                            <TextInput style={styles.input} placeholder="Digite seu e-mail" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={handleEmailChange} editable={!submitting} />
                                            <Ionicons name="mail-outline" size={scale(28)} color="#555" style={styles.icon} />
                                        </View>
                                        <View style={styles.realTimeErrorContainer}>
                                            {registrationErrors.email && <Text style={styles.realTimeErrorText}>{registrationErrors.email}</Text>}
                                        </View>
                                    </View>

                                    <View style={styles.fieldContainer}>
                                        <View style={styles.inputContainer}>
                                            <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#999" secureTextEntry={!showPassword} value={password} onChangeText={handlePasswordChange} editable={!submitting} />
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

                                    <View style={styles.errorContainer}>
                                        {errorMessage && (
                                            <View style={styles.errorBox}>
                                                <Ionicons name="alert-circle" size={scale(20)} color="#D32F2F" />
                                                <Text style={styles.errorText}>{errorMessage}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity 
                                        style={[styles.submitButton, { opacity: !isRegisterFormValid || submitting ? 0.6 : 1 }]} 
                                        onPress={handleRegister} 
                                        disabled={!isRegisterFormValid || submitting}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <Text style={styles.submitText}>Cadastrar</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    containerFull: { flex: 1, backgroundColor: '#EFEAEA' },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center', 
        paddingBottom: scale(20), 
    },

    higher: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: scale(150), 
        marginTop: scale(50), 
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
    lower: {
        backgroundColor: '#fffbfb',
        width: '70%', 
        paddingVertical: scale(50),
        alignSelf: 'center',
        borderRadius: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
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
        borderRadius: scale(50), 
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
    formContainer: { width: '80%', alignItems: 'center'},
    inputs: { gap: scale(20), width: '100%', alignItems: 'center', marginTop: scale(20) },
    fieldContainer: { width: '100%', gap: scale(8), marginBottom: scale(10) },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: scale(3),
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
        justifyContent: 'center', 
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
    errorContainer: {
        marginTop: scale(15),
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: scale(30), 
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        backgroundColor: '#FFEBEE', 
        paddingVertical: scale(8),
        paddingHorizontal: scale(15),
        borderRadius: scale(10),
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: scale(16),
        textAlign: 'center',
        fontWeight: '600',
    },
    realTimeErrorContainer: {
        justifyContent: 'center',
    },
    realTimeErrorText: { color: '#D32F2F', fontSize: scale(12) },
});