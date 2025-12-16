import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Dimensions, Animated, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');
const realWidth = width > height ? width : height;
const guidelineBaseWidth = 1366;
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ItemPedidoView {
  id: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number; 
  precoTotalItem: number;
}

interface Pedido {
  id: number;
  status: 'AGUARDANDO_PAGAMENTO' | 'NA_FILA' | 'PREPARANDO' | 'FINALIZADO';
  dataCriacao: string;
  itens: ItemPedidoView[];
  metodoPagamento: string;
  total: number; 
  observacao?: string;
}

const statusPriority: Record<string, number> = {
    'NA_FILA': 1,
    'PREPARANDO': 2,
    'FINALIZADO': 3
};

const getPaymentInfo = (metodo: string) => {
    const m = metodo ? metodo.toLowerCase() : '';
    if (m.includes('pix')) return { icon: 'qr-code-outline', label: 'PIX', color: '#32BCAD' };
    if (m.includes('dinheiro') || m.includes('cash')) return { icon: 'cash-outline', label: 'DINHEIRO', color: '#28a745' };
    if (m.includes('credito')) return { icon: 'card-outline', label: 'CRÉDITO', color: '#3F51B5' };
    if (m.includes('debito')) return { icon: 'card-outline', label: 'DÉBITO', color: '#03A9F4' };
    if (m.includes('card') || m.includes('cart')) return { icon: 'card-outline', label: 'CARTÃO', color: '#2196F3' };
    return { icon: 'wallet-outline', label: metodo.toUpperCase(), color: '#666' };
};

export default function ChapeiroScreen() {
  const { signOut } = useAuth();
  const [pedidosProducao, setPedidosProducao] = useState<Pedido[]>([]);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<Pedido[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const lastKnownIdRef = useRef<number>(0);
  const blinkAnim = useState(new Animated.Value(1))[0];

  useFocusEffect(
    useCallback(() => {
      const lockLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      };
      lockLandscape();
    }, [])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  useEffect(() => {
      (async () => {
          if (Platform.OS === 'web') {
              if (Notification.permission !== "granted") {
                  await Notification.requestPermission();
              }
          } else {
              const { status } = await Notifications.requestPermissionsAsync();
              if (status !== 'granted') console.log('Permissão de notificação negada!');

              if (Platform.OS === 'android') {
                  await Notifications.setNotificationChannelAsync('default', {
                      name: 'default',
                      importance: Notifications.AndroidImportance.MAX,
                      vibrationPattern: [0, 250, 250, 250],
                      lightColor: '#FF231F7C',
                  });
              }
          }
      })();
  }, []);

  const dispararNotificacao = async (pedidoId: number) => {
      const titulo = "🔥 Novo Pedido na Chapa!";
      const corpo = `O pedido #${pedidoId} acabou de chegar na fila.`;

      if (Platform.OS === 'web') {
          if (Notification.permission === "granted") {
              new Notification(titulo, { body: corpo });
          }
          return;
      }

      await Notifications.scheduleNotificationAsync({
          content: {
              title: titulo,
              body: corpo,
              sound: 'default',
          },
          trigger: null,
      });
  };

  const fetchPedidos = useCallback(async (isBackground = false) => {
    if (!isBackground && !refreshing) setLoading(true);
    
    try {
        const todosPedidos = await api('/api/pedidos', { auth: true }) as Pedido[];
        const pedidosRelevantes = todosPedidos.filter(p => ['NA_FILA', 'PREPARANDO'].includes(p.status));
        
        if (pedidosRelevantes.length > 0) {
            const maiorId = Math.max(...pedidosRelevantes.map(p => p.id));
            if (lastKnownIdRef.current === 0) {
                lastKnownIdRef.current = maiorId;
            } else if (maiorId > lastKnownIdRef.current) {
                dispararNotificacao(maiorId);
                lastKnownIdRef.current = maiorId; 
            }
        }

        const pendentes = todosPedidos.filter(p => p.status === 'AGUARDANDO_PAGAMENTO');
        setPagamentosPendentes(prev => {
             if (JSON.stringify(prev) !== JSON.stringify(pendentes)) return pendentes;
             return prev;
        });
        
        if (pendentes.length === 0) setShowDropdown(false);
        
        const producao = todosPedidos.filter(p => 
            ['NA_FILA', 'PREPARANDO', 'FINALIZADO'].includes(p.status)
        );

        producao.sort((a, b) => {
            const priorityA = statusPriority[a.status] || 99;
            const priorityB = statusPriority[b.status] || 99;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return b.id - a.id; 
        });

        setPedidosProducao(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(producao)) return producao;
            return prev;
        });

    } catch (error) {
      console.error(error);
      if (!isBackground && !refreshing) Alert.alert("Erro", "Não foi possível carregar a fila.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchPedidos(false);
    const interval = setInterval(() => fetchPedidos(true), 5000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  const confirmarPagamento = async (id: number) => {
      try {
        await api(`/api/pedidos/${id}/status`, {
            method: 'PATCH',
            auth: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'NA_FILA' })
        });
        fetchPedidos(true); 
        Alert.alert("Sucesso", "Pagamento confirmado!");
      } catch (e) {
          Alert.alert("Erro", "Falha ao confirmar pagamento.");
      }
  };

  const avancarStatus = async (pedidoId: number, statusAtual: string) => {
    let novoStatus = '';
    if (statusAtual === 'NA_FILA') novoStatus = 'PREPARANDO';
    else if (statusAtual === 'PREPARANDO') novoStatus = 'FINALIZADO';
    else return;

    try {
        await api(`/api/pedidos/${pedidoId}/status`, {
            method: 'PATCH',
            auth: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        fetchPedidos(true); 
    } catch (error) {
        Alert.alert("Erro", "Falha ao atualizar status.");
    }
  };

  const handleSignOut = async () => {
      await signOut();
      router.replace('/(auth)/login');
  }

  const renderCard = (pedido: Pedido) => {
    const isPreparando = pedido.status === 'PREPARANDO';
    const isFinalizado = pedido.status === 'FINALIZADO';
    
    let statusColor = '#2196F3'; 
    let statusText = 'Fila';
    let btnText = 'Começar';
    let btnColor = '#F39D0A'; 

    if (isPreparando) {
        statusColor = '#F39D0A';
        statusText = 'Em preparo';
        btnText = 'Concluir!';
        btnColor = '#28a745'; 
    } else if (isFinalizado) {
        statusColor = '#28a745';
        statusText = 'Finalizado';
    }

    const payInfo = getPaymentInfo(pedido.metodoPagamento);

    return (
      <View key={pedido.id} style={[styles.card, isFinalizado && styles.cardDimmed]}>
        <View style={styles.cardTopContent}>
            <Text style={styles.cardTitle}>#{pedido.id}</Text>
            <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>

            <View style={styles.itemsContainer}>
                <Text style={styles.sectionTitle}>Descrição do pedido</Text>
                
                <ScrollView 
                    nestedScrollEnabled={true} 
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: scale(10) }}
                >
                    {pedido.itens.map((item, index) => (
                        <Text key={index} style={styles.itemText}>
                            • {item.quantidade}x {item.nomeProduto}
                        </Text>
                    ))}
                </ScrollView>
            </View>
        </View>

        {/* PARTE INFERIOR: Fica fixa no rodapé do card */}
        <View>
            <View style={styles.paymentContainer}>
                <Ionicons name={payInfo.icon as any} size={scale(22)} color={payInfo.color} />
                <Text style={[styles.paymentText, { color: payInfo.color }]}>
                    {payInfo.label}
                </Text>
            </View>

            <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>R$ {pedido.total.toFixed(2).replace('.', ',')}</Text>
            </View>



            {!isFinalizado && (
                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: btnColor }]}
                    onPress={() => avancarStatus(pedido.id, pedido.status)}
                >
                    <Text style={styles.actionButtonText}>{btnText}</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
        colors={['#7E0000', '#520000']}
        style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.notificationArea}>
            {pagamentosPendentes.length > 0 && (
                <Animated.View style={{ opacity: blinkAnim }}>
                  <TouchableOpacity 
                      style={styles.alertButton} 
                      onPress={() => setShowDropdown(!showDropdown)}
                  >
                      <Text style={styles.alertText}>
                          💰   Receber Dinheiro ({pagamentosPendentes.length})
                      </Text>
                      <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={scale(24)} color="black" />
                  </TouchableOpacity>
                </Animated.View>
            )}
        </View>

            <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => router.replace('/(protected)/definicaoProdutos')}
            >
                <Ionicons name="options" size={scale(24)} color="#201000" />
                <Text style={styles.settingsButtonText}>Produtos Disponíveis</Text>
            </TouchableOpacity>
        </View>

          <Text style={styles.mainTitle}>CHAPA</Text>

        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.logoffButton} onPress={handleSignOut}>
                <Text style={styles.logoffText}>Logoff</Text>
                <Ionicons name="log-out-outline" size={scale(30)} color="white" />
            </TouchableOpacity>
        </View>
      </View>

      {showDropdown && pagamentosPendentes.length > 0 && (
          <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownHeaderTitle}>Pagamentos Pendentes</Text>
              <ScrollView style={{maxHeight: scale(300)}}>
                  {pagamentosPendentes.map(p => (
                      <View key={p.id} style={styles.dropdownItem}>
                          <View style={{flex: 1}}>
                              <Text style={styles.dropdownTitle}>Pedido #{p.id}</Text>
                              <Text style={styles.dropdownValue}>
                                 Total: <Text style={{fontWeight:'bold', color:'#A11613'}}>R$ {p.total.toFixed(2).replace('.', ',')}</Text>
                              </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.confirmButton}
                            onPress={() => confirmarPagamento(p.id)}
                          >
                              <Text style={styles.confirmButtonText}>Confirmar</Text>
                          </TouchableOpacity>
                      </View>
                  ))}
              </ScrollView>
          </View>
      )}

      <View style={styles.body}>
        {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#F39D0A" />
        ) : (
            <ScrollView 
                horizontal={true}
                contentContainerStyle={styles.scrollContent}
                showsHorizontalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchPedidos(false);
                        }} 
                        tintColor="#F39D0A"
                    />
                }
            >
                {pedidosProducao.length === 0 ? (
                    <View style={styles.emptyContainer}>
                         <Text style={styles.emptyText}>Nenhum pedido na fila de produção.</Text>
                    </View>
                ) : (
                    pedidosProducao.map(renderCard)
                )}
            </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainTitle: { color: 'white', fontSize: scale(40), fontWeight: 'bold', letterSpacing: scale(2) },
  
  header: {
    height: scale(110), 
    backgroundColor: 'rgba(32, 16, 0, 0.6)', 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: scale(20), paddingVertical: scale(10),
    justifyContent: 'space-between',
  },
  headerLeft: { flex: 1, alignItems: 'flex-start' },
  notificationArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flex: 1, alignItems: 'flex-end' },
  
  settingsButton: {
    flexDirection: 'row', backgroundColor: '#F39D0A', width: scale(300),
    justifyContent: 'center', paddingVertical: scale(8), paddingHorizontal: scale(10),
    borderRadius: scale(10), alignItems: 'center', gap: scale(8)
  },
  settingsButtonText: { fontWeight: '500', color: '#201000', fontSize: scale(20)}, 
  
  logoffButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#A11613',
    paddingVertical: scale(8), paddingHorizontal: scale(15), borderRadius: scale(10), gap: scale(8),
  },
  logoffText: { color: 'white', fontWeight: '500', fontSize: scale(25) },
  
  alertButton: {
    backgroundColor: '#F39D0A', paddingVertical: scale(8), width: scale(300),
    borderRadius: scale(10), flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: scale(5), marginBottom: scale(10),
  },
  alertText: { color: 'black', fontWeight: '500', fontSize: scale(18) }, 
  
  dropdownContainer: {
    position: 'absolute', top: scale(80), left: 0, alignSelf: 'center',
    width: '50%', backgroundColor: 'white', borderRadius: scale(15), padding: scale(15),
    zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: scale(10) },
    shadowOpacity: 0.5, shadowRadius: scale(10), elevation: 20, borderWidth: 1, borderColor: '#ccc',
  },
  dropdownHeaderTitle: {
      fontSize: scale(18), fontWeight: 'bold', textAlign: 'center', marginBottom: scale(15),
      color: '#201000', textTransform: 'uppercase', borderBottomWidth: 1,
      borderBottomColor: '#eee', paddingBottom: scale(10)
  },
  dropdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: scale(12), paddingHorizontal: scale(10), borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', backgroundColor: '#fff',
  },
  dropdownTitle: { fontSize: scale(18), fontWeight: 'bold', color: '#333' },
  dropdownValue: { fontSize: scale(16), color: '#666', marginTop: scale(2) },
  
  confirmButton: {
    backgroundColor: '#28a745', paddingVertical: scale(10), paddingHorizontal: scale(15), borderRadius: scale(8),
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: scale(14) },
  
  body: { flex: 1, justifyContent: 'center' },
  scrollContent: {
    paddingHorizontal: scale(20), alignItems: 'center', gap: scale(20), flexGrow: 1, justifyContent: 'center',
  },
  emptyContainer: { width: Dimensions.get('window').width, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: 'white', fontSize: scale(20), textAlign: 'center', opacity: 0.8 },
  
  card: {
    width: scale(320), 
    height: '90%', 
    backgroundColor: 'white', borderRadius: scale(25),
    padding: scale(20), 
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(5) }, shadowOpacity: 0.3, shadowRadius: scale(5),
    elevation: 5, marginVertical: scale(20),
  },
  

  cardTopContent: {
    flex: 1, 
    overflow: 'hidden',
  },

  cardDimmed: { backgroundColor: '#e0e0e0', opacity: 0.9 },
  cardTitle: { fontSize: scale(32), fontWeight: 'bold', textAlign: 'center', marginBottom: scale(10) },
  
  statusBadge: {
    borderWidth: 2, borderRadius: scale(20), paddingVertical: scale(5), paddingHorizontal: scale(15),
    alignSelf: 'center', marginBottom: scale(15),
  },
  statusText: { fontSize: scale(16), fontWeight: 'bold', textTransform: 'uppercase' },
  
  itemsContainer: { 
    flex: 1,
    marginBottom: scale(5) 
  },
  
  sectionTitle: { fontSize: scale(18), textDecorationLine: 'underline', marginBottom: scale(8), fontWeight: '600' },
  itemText: { fontSize: scale(18), marginBottom: scale(5), fontWeight: '500', color: '#333' },
  
  paymentContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: scale(5), marginBottom: scale(5), paddingVertical: scale(5), backgroundColor: '#f9f9f9', borderRadius: scale(10),
  },
  paymentText: { fontSize: scale(16), fontWeight: 'bold' },
  
  totalContainer: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderTopWidth: 1, borderTopColor: '#eee', paddingTop: scale(10), marginBottom: scale(10)
  },
  totalLabel: { fontSize: scale(18), fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: scale(20), fontWeight: 'bold', color: '#A11613' },
  
  obsContainer: { marginBottom: scale(15), minHeight: scale(50) },
  obsText: { fontSize: scale(16), fontStyle: 'italic', color: '#555' },
  
  actionButton: {
    paddingVertical: scale(15), borderRadius: scale(30), alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.3, shadowRadius: scale(3), elevation: 3,
  },
  actionButtonText: { color: 'white', fontSize: scale(20), fontWeight: 'bold' },
});