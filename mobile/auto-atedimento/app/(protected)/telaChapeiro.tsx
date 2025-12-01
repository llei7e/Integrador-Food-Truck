import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RFPercentage } from 'react-native-responsive-fontsize';

// Removendo MOCKS, usando apenas as interfaces de dados reais
// O PedidoView que vem do backend deve ter esta estrutura:
interface ItemPedidoView {
  id: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number; // Em R$ (Double)
  precoTotalItem: number; // Em R$ (Double)
}

interface Pedido {
  id: number;
  // Deve suportar o status AGUARDANDO_PAGAMENTO do backend
  status: 'AGUARDANDO_PAGAMENTO' | 'NA_FILA' | 'PREPARANDO' | 'FINALIZADO';
  dataCriacao: string;
  itens: ItemPedidoView[];
  metodoPagamento: string;
  total: number; // Em R$ (Double)
  observacao?: string;
}

const statusPriority: Record<string, number> = {
    'NA_FILA': 1,
    'PREPARANDO': 2,
    'FINALIZADO': 3
};

export default function ChapeiroScreen() {
  const { signOut } = useAuth();
  const [pedidosProducao, setPedidosProducao] = useState<Pedido[]>([]);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<Pedido[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
        // 1. CHAMA A API PARA BUSCAR TODOS OS PEDIDOS
        // Assumimos que a API retorna um array de PedidoView
        const todosPedidos = await api('/api/pedidos', { auth: true }) as Pedido[];
        
        // 2. SEPARA OS PEDIDOS EM DUAS LISTAS
        
        // A) Pedidos AGUARDANDO PAGAMENTO (Notificação)
        const pendentes = todosPedidos.filter(p => p.status === 'AGUARDANDO_PAGAMENTO' && p.metodoPagamento === 'Dinheiro');
        setPagamentosPendentes(pendentes);
        
        // B) Pedidos para o Quadro de Produção
        const producao = todosPedidos.filter(p => 
            ['NA_FILA', 'PREPARANDO', 'FINALIZADO'].includes(p.status)
        );

        // 3. ORDENA O QUADRO DE PRODUÇÃO
        producao.sort((a, b) => {
            const priorityA = statusPriority[a.status] || 99;
            const priorityB = statusPriority[b.status] || 99;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.id - b.id;
        });

        setPedidosProducao(producao);

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar a fila de pedidos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    // Opcional: Polling para atualizar pedidos a cada 15 segundos
    const interval = setInterval(fetchPedidos, 15000);
    return () => clearInterval(interval);
  }, []);

  // Ao confirmar pagamento, o pedido entra na fila de produção (muda status para NA_FILA)
  const confirmarPagamento = async (id: number) => {
      try {
        // CHAMADA API: Atualiza status do pedido para 'NA_FILA'
        await api(`/api/pedidos/${id}/status`, {
            method: 'PATCH',
            auth: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'NA_FILA' })
        });
        
        // Recarrega todos os pedidos para atualizar a tela
        fetchPedidos(); 
        Alert.alert("Sucesso", `Pagamento recebido! Pedido #${id} enviado para a fila.`);

      } catch (e) {
          Alert.alert("Erro", "Falha ao confirmar pagamento.");
      }
  };

  // Função para avançar o status (NA_FILA -> PREPARANDO -> FINALIZADO)
  const avancarStatus = async (pedidoId: number, statusAtual: string) => {
    let novoStatus = '';
    if (statusAtual === 'NA_FILA') novoStatus = 'PREPARANDO';
    else if (statusAtual === 'PREPARANDO') novoStatus = 'FINALIZADO';
    else return;

    try {
        // CHAMADA API: Atualiza status do pedido
        await api(`/api/pedidos/${pedidoId}/status`, {
            method: 'PATCH',
            auth: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });

        // Atualiza localmente e reordena
        fetchPedidos(); 

    } catch (error) {
        Alert.alert("Erro", "Falha ao atualizar status do pedido.");
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

    return (
      <View key={pedido.id} style={[styles.card, isFinalizado && styles.cardDimmed]}>
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
            <Text style={{ marginTop: 10, fontSize: 18, fontWeight: '700', color: '#4A0404'}}>
                Total: R$ {pedido.total.toFixed(2)}
            </Text>
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
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Text style={styles.headerLogo}>CHAPA</Text>
        </View>

        {/* Área de Notificação */}
        <View style={styles.notificationArea}>
            {pagamentosPendentes.length > 0 && (
                <TouchableOpacity 
                    style={styles.alertButton} 
                    onPress={() => setShowDropdown(!showDropdown)}
                >
                    <Text style={styles.alertText}>
                        💰 Receber Dinheiro ({pagamentosPendentes.length})
                    </Text>
                    <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={24} color="black" />
                </TouchableOpacity>
            )}
        </View>

        <TouchableOpacity style={styles.logoffButton} onPress={handleSignOut}>
            <Text style={styles.logoffText}>Logoff</Text>
            <Ionicons name="log-out-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Dropdown de Pagamentos */}
      {showDropdown && pagamentosPendentes.length > 0 && (
          <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownHeaderTitle}>Pagamentos Pendentes</Text>
              {pagamentosPendentes.map(p => (
                  <View key={p.id} style={styles.dropdownItem}>
                      <View style={{flex: 1}}>
                          <Text style={styles.dropdownTitle}>Pedido #{p.id}</Text>
                          <Text style={styles.dropdownValue}>
                             Total: <Text style={{fontWeight:'bold', color:'#A11613'}}>R$ {p.total.toFixed(2)}</Text>
                          </Text>
                          <Text style={styles.dropdownValue}>
                             Método: {p.metodoPagamento}
                          </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={() => confirmarPagamento(p.id)}
                      >
                          <Text style={styles.confirmButtonText}>Confirmar Recebimento</Text>
                      </TouchableOpacity>
                  </View>
              ))}
          </View>
      )}

      {/* Body (Quadro de Produção) */}
      <View style={styles.body}>
        {loading ? (
            <ActivityIndicator size="large" color="#F39D0A" />
        ) : (
            <ScrollView 
                horizontal 
                contentContainerStyle={styles.scrollContent}
                showsHorizontalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true);
                        fetchPedidos();
                    }} />
                }
            >
                {pedidosProducao.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum pedido na fila de produção.</Text>
                ) : (
                    pedidosProducao.map(renderCard)
                )}
            </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A0404',
  },
  header: {
    height: RFPercentage(12),
    backgroundColor: '#201000',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerLeft: { flex: 1 },
  notificationArea: {
    flex: 3, 
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerLogo: {
    color: '#F39D0A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoffButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 5,
  },
  logoffText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  
  // --- Estilos do Alerta ---
  alertButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  alertText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // --- Estilos do Dropdown ---
  dropdownContainer: {
    position: 'absolute',
    top: RFPercentage(12) + 10,
    alignSelf: 'center',
    width: '60%',
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
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
      color: '#201000',
      textTransform: 'uppercase'
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
    marginBottom: 5,
    borderRadius: 8,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownValue: {
    fontSize: 18,
    color: '#666',
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- Corpo e Cards ---
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    opacity: 0.8
  },
  card: {
    width: 320,
    height: '85%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardDimmed: {
    backgroundColor: '#e0e0e0',
    opacity: 0.9,
  },
  cardTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  itemsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    textDecorationLine: 'underline',
    marginBottom: 10,
    fontWeight: '600',
  },
  itemText: {
    fontSize: 20,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  obsContainer: {
    marginBottom: 20,
    minHeight: 60,
  },
  obsText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#555',
  },
  actionButton: {
    paddingVertical: 18,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
});