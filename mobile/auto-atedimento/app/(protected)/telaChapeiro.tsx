import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Dimensions, Animated } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { RFPercentage } from 'react-native-responsive-fontsize';

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

// --- HELPER ATUALIZADO: Distingue Crédito e Débito ---
const getPaymentInfo = (metodo: string) => {
    const m = metodo ? metodo.toLowerCase() : '';

    if (m.includes('pix')) {
        return { icon: 'qr-code-outline', label: 'PIX', color: '#32BCAD' }; // Verde Água
    }
    
    if (m.includes('dinheiro') || m.includes('cash')) {
        return { icon: 'cash-outline', label: 'DINHEIRO', color: '#28a745' }; // Verde
    }

    // Lógica para cartões
    if (m.includes('credito')) {
        return { icon: 'card-outline', label: 'CRÉDITO', color: '#3F51B5' }; // Azul Escuro/Índigo
    }
    
    if (m.includes('debito')) {
        return { icon: 'card-outline', label: 'DÉBITO', color: '#03A9F4' }; // Azul Claro
    }

    if (m.includes('card') || m.includes('cart')) {
        return { icon: 'card-outline', label: 'CARTÃO', color: '#2196F3' }; // Azul Padrão
    }

    return { icon: 'wallet-outline', label: metodo.toUpperCase(), color: '#666' };
};

export default function ChapeiroScreen() {
  const { signOut } = useAuth();
  const [pedidosProducao, setPedidosProducao] = useState<Pedido[]>([]);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<Pedido[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Animação piscar
  const blinkAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const fetchPedidos = useCallback(async (isBackground = false) => {
    if (!isBackground && !refreshing) setLoading(true);
    
    try {
        const todosPedidos = await api('/api/pedidos', { auth: true }) as Pedido[];
        
        const pendentes = todosPedidos.filter(p => p.status === 'AGUARDANDO_PAGAMENTO');
        setPagamentosPendentes(prev => {
             if (JSON.stringify(prev) !== JSON.stringify(pendentes)) return pendentes;
             return prev;
        });
        
        if (pendentes.length === 0) setShowDropdown(false);
        
        const producao = todosPedidos.filter(p => 
            ['NA_FILA', 'PREPARANDO', 'FINALIZADO'].includes(p.status)
        );

        // Ordenação: Status Priority > ID Maior (Mais novo)
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
    const interval = setInterval(() => fetchPedidos(true), 15000);
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
        <View>
            <Text style={styles.cardTitle}>#{pedido.id}</Text>
            <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>

            <View style={styles.itemsContainer}>
                <Text style={styles.sectionTitle}>Descrição do pedido</Text>
                {pedido.itens.map((item, index) => (
                    <Text key={index} style={styles.itemText}>
                        • {item.quantidade}x {item.nomeProduto}
                    </Text>
                ))}
            </View>
        </View>

        <View>
            {/* PAGAMENTO DETALHADO */}
            <View style={styles.paymentContainer}>
                <Ionicons name={payInfo.icon as any} size={22} color={payInfo.color} />
                <Text style={[styles.paymentText, { color: payInfo.color }]}>
                    {payInfo.label}
                </Text>
            </View>

            <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>R$ {pedido.total.toFixed(2).replace('.', ',')}</Text>
            </View>

            <View style={styles.obsContainer}>
                <Text style={styles.sectionTitle}>Observações:</Text>
                <Text style={styles.obsText}>{pedido.observacao || "Nenhuma"}</Text>
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
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0 }}
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
                          💰 Receber Dinheiro ({pagamentosPendentes.length})
                      </Text>
                      <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={24} color="black" />
                  </TouchableOpacity>
                </Animated.View>
            )}
        </View>

            <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => router.replace('/(protected)/definicaoProdutos')}
            >
                <Ionicons name="options" size={24} color="#201000" />
                <Text style={styles.settingsButtonText}>Produtos Disponíveis</Text>
            </TouchableOpacity>
        </View>

          <Text style={styles.mainTitle}>CHAPA</Text>

        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.logoffButton} onPress={handleSignOut}>
                <Text style={styles.logoffText}>Logoff</Text>
                <Ionicons name="log-out-outline" size={30} color="white" />
            </TouchableOpacity>
        </View>
      </View>

      {showDropdown && pagamentosPendentes.length > 0 && (
          <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownHeaderTitle}>Pagamentos Pendentes</Text>
              <ScrollView style={{maxHeight: 300}}>
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
                pagingEnabled={false}
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
  container: {
    flex: 1,
  },
  mainTitleContainer: {
      alignItems: 'center',
      paddingTop: RFPercentage(2),
      paddingBottom: 5,
      backgroundColor: 'rgba(32, 16, 0, 0.3)', 
      zIndex: 11,
  },
  mainTitle: {
    color: 'white', 
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  header: {
    height: RFPercentage(14),
    backgroundColor: 'rgba(32, 16, 0, 0.6)', 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: RFPercentage(2),
    paddingVertical: RFPercentage(1),
    justifyContent: 'space-between',
  },
  headerLeft: { 
      flex: 1,
      alignItems: 'flex-start',
  },
  notificationArea: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
      flex: 1, 
      alignItems: 'flex-end',
  },
  settingsButton: {
    flexDirection: 'row',
    backgroundColor: '#F39D0A', 
    width: RFPercentage(23),
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8
  },
  settingsButtonText: {
      fontWeight: '500',
      color: '#201000',
      fontSize: 25
  },
  logoffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A11613',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    gap: 8,
  },
  logoffText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 25,
  },
  alertButton: {
    backgroundColor: '#F39D0A',
    paddingVertical: 8,
    width: RFPercentage(23),
    borderRadius: RFPercentage(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: RFPercentage(1),
  },
  alertText: {
    color: 'black',
    fontWeight: '500',
    fontSize: 25,
  },
  dropdownContainer: {
    position: 'absolute',
    top: RFPercentage(8),
    left: 0,
    alignSelf: 'center',
    width: '50%', 
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownHeaderTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
      color: '#201000',
      textTransform: 'uppercase',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 10
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dropdownTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dropdownValue: { fontSize: 16, color: '#666', marginTop: 2 },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  body: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
      width: Dimensions.get('window').width,
      alignItems: 'center',
      justifyContent: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    opacity: 0.8
  },
  card: {
    width: 320,
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginVertical: 20,
  },
  cardDimmed: {
    backgroundColor: '#e0e0e0',
    opacity: 0.9,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'center',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  itemsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    textDecorationLine: 'underline',
    marginBottom: 8,
    fontWeight: '600',
  },
  itemText: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 5,
    paddingVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingTop: 10,
      marginBottom: 10
  },
  totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333'
  },
  totalValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#A11613',
  },
  obsContainer: {
    marginBottom: 15,
    minHeight: 50,
  },
  obsText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});