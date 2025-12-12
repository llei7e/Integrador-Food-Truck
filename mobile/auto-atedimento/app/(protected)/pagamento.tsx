import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Stack } from 'expo-router';
import { useState, useCallback, useEffect, useRef } from 'react';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useCart } from '../../context/CartContext'; 
import { api } from '../../lib/api'; 

export default function Pagamento() {
  const { cartItems, total: valorTotalCarrinho, clearCart } = useCart();

  const [selectedMethod, setSelectedMethod] = useState<'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro'>('Pix');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para controlar o pedido "em espera" do dinheiro
  const [tempOrderId, setTempOrderId] = useState<number | null>(null);
  
  // Ref para o intervalo de polling (usando 'any' para evitar erro de tipo no RN)
  const pollingInterval = useRef<any>(null);

  // Limpa estados e para o polling ao sair da tela
  useFocusEffect(
    useCallback(() => {
      return () => stopPolling();
    }, [])
  );

  const stopPolling = () => {
      if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
      }
  };

  const getMethodStyle = (method: string) => method === selectedMethod ? [styles.method, styles.selected] : styles.method;
  const getTextStyle = (method: string) => method === selectedMethod ? styles.methodTextWhite : styles.methodText;
  const getIconColor = (method: string) => method === selectedMethod ? 'white' : '#A11613';

  // --- 🔄 POLLING: VERIFICA SE O CHAPEIRO CONFIRMOU ---
  useEffect(() => {
      // Só roda se o modal estiver aberto, for dinheiro e tivermos um ID de pedido
      if (showModal && selectedMethod === 'Dinheiro' && tempOrderId) {
          
          const checkStatus = async () => {
              try {
                  // Busca a lista completa de pedidos (garante compatibilidade com o backend)
                  const listaPedidos = await api('/api/pedidos', { auth: true }) as any[];
                  
                  // Encontra o nosso pedido na lista
                  const meuPedido = listaPedidos.find(p => p.id === tempOrderId);
                  
                  if (meuPedido) {
                      // Se o status mudou (Chapeiro clicou em CONFIRMAR PAGAMENTO)
                      // Ou seja, se NÃO É MAIS "AGUARDANDO_PAGAMENTO"
                      if (meuPedido.status !== 'AGUARDANDO_PAGAMENTO') {
                          console.log("Status mudou! Finalizando pagamento...");
                          stopPolling();
                          setIsSubmitting(false);
                          setShowModal(false);
                          clearCart();
                          router.replace('/agradecimento');
                      }
                  } else {
                      console.warn(`Pedido #${tempOrderId} não encontrado na lista.`);
                  }

              } catch (e) {
                  console.log("Polling check failed (tentando novamente...):", e);
              }
          };

          // Executa a cada 3 segundos
          pollingInterval.current = setInterval(checkStatus, 3000);
          
          // Roda uma vez imediatamente
          checkStatus();

      } else {
          stopPolling();
      }

      return () => stopPolling();
  }, [showModal, selectedMethod, tempOrderId]);


  // --- ❌ FECHAR MODAL / CANCELAR PEDIDO ---
  const handleCloseModal = async () => {
      // Se for envio normal (cartão/pix) e estiver carregando, não fecha
      if (isSubmitting && selectedMethod !== 'Dinheiro') return;

      // Se for Dinheiro e tiver um pedido criado, deleta ele ao cancelar
      if (selectedMethod === 'Dinheiro' && tempOrderId) {
          try {
              await api(`/api/pedidos/${tempOrderId}`, { method: 'DELETE', auth: true });
              console.log(`Pedido ${tempOrderId} cancelado/deletado.`);
          } catch (e) {
              console.error("Erro ao deletar pedido cancelado:", e);
          }
          setTempOrderId(null);
      }
      
      stopPolling();
      setShowModal(false);
      setIsSubmitting(false);
  };

  // --- 🚀 INICIAR PROCESSO DE PAGAMENTO ---
  const handlePayAction = async () => {
    if (cartItems.length === 0) {
        Alert.alert("Erro", "Seu carrinho está vazio.");
        return;
    }

    if (selectedMethod === 'Dinheiro') {
        // Dinheiro: Cria o pedido AGORA e aguarda
        await createOrder('AGUARDANDO_PAGAMENTO');
    } else {
        // Pix/Cartão: Abre modal de instrução
        setShowModal(true);
    }
  };

  // Função genérica de criar pedido
  const createOrder = async (statusInicial: string) => {
    setIsSubmitting(true);

    const pedidoDTO = {
      status: statusInicial,
      truck_id: 1, 
      metodoPagamento: selectedMethod,
      itens: cartItems.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantity,
      }))
    };

    try {
      // POST na API
      const res = await api('/api/pedidos', {
        method: 'POST',
        auth: true, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoDTO)
      }) as any;

      if (selectedMethod === 'Dinheiro') {
          // Se for dinheiro, salvamos o ID e abrimos o modal de espera
          setTempOrderId(res.id);
          // Mantém isSubmitting true ou false dependendo de como quer controlar a UI,
          // aqui deixamos false para permitir interações como "Voltar" mas o modal aberto.
          // Mas como o modal tem ActivityIndicator próprio, podemos deixar false aqui e controlar lá.
          setShowModal(true);
      } else {
          // Pix/Cartão: Finaliza direto
          clearCart(); 
          router.replace('/agradecimento'); 
          setIsSubmitting(false);
      }

    } catch (error: any) {
      console.error("Falha ao criar pedido:", error);
      Alert.alert("Erro", `Falha ao registrar pedido: ${error.message}`);
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  // Ação ao clicar no modal (Confirmar visualmente Pix/Cartão)
  const handleManualConfirmation = () => {
      if (selectedMethod === 'Dinheiro') return; // Dinheiro não clica, espera polling
      createOrder('NA_FILA');
  };

  const getModalContent = () => {
    // Loading genérico para criação (exceto dinheiro que tem UI própria)
    if (isSubmitting && selectedMethod !== 'Dinheiro') {
      return (
        <>
          <Text style={styles.modalTitle}>Registrando seu pedido...</Text>
          <ActivityIndicator size={100} color="#201000ff" style={{ marginTop: 30 }} />
        </>
      );
    }

    switch (selectedMethod) {
      case 'Pix':
        return (
          <>
            <Text style={styles.modalTitle}>Escaneie o QR Code</Text>
            <Image source={require('../../assets/images/codigo-qr.png')} style={styles.qrImage} />
            <Text style={styles.modalInstruction}>Toque na tela quando o pagamento for confirmado</Text>
          </>
        );
      case 'Cartão Crédito':
      case 'Cartão Débito':
        return (
          <>
            <Text style={styles.modalTitle}>Aproxime ou insira seu cartão ({selectedMethod})</Text>
            <Image source={require('../../assets/images/pagamento.png')} style={styles.imgPopup} />
            <Text style={styles.modalInstruction}>Toque na tela quando o pagamento for confirmado</Text>
          </>
        );
      case 'Dinheiro':
        return (
          <>
            <Text style={styles.modalTitle}>Pagamento em Dinheiro</Text>
            <Text style={[styles.modalInstruction, { fontSize: 22, fontWeight: 'bold', color: '#201000ff' }]}>
                Dirija-se ao caixa com R$ {valorTotalCarrinho.toFixed(2)}
            </Text>
            
            <ActivityIndicator size={80} color="#A11613" style={{ marginVertical: 30 }} />
            
            <Text style={styles.modalInstruction}>
                Aguardando confirmação do atendente...
            </Text>
            <Text style={{fontSize: 14, color: '#999', marginTop: 10}}>
                (O pedido aparecerá na tela do Chapeiro)
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={60} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento</Text>
        </View>

        <View style={styles.centerContainer}>
            <View style={styles.paymentContainer}>
                <TouchableOpacity style={getMethodStyle('Pix')} onPress={() => setSelectedMethod('Pix')}>
                    <Ionicons name="qr-code" size={70} color={getIconColor('Pix')} />
                    <Text style={getTextStyle('Pix')}>Pix</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Cartão Crédito')} onPress={() => setSelectedMethod('Cartão Crédito')}>
                    <Ionicons name="card" size={70} color={getIconColor('Cartão Crédito')} />
                    <Text style={getTextStyle('Cartão Crédito')}>Crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Cartão Débito')} onPress={() => setSelectedMethod('Cartão Débito')}>
                    <Ionicons name="card-outline" size={70} color={getIconColor('Cartão Débito')} />
                    <Text style={getTextStyle('Cartão Débito')}>Débito</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Dinheiro')} onPress={() => setSelectedMethod('Dinheiro')}>
                    <Ionicons name="cash-outline" size={70} color={getIconColor('Dinheiro')} />
                    <Text style={getTextStyle('Dinheiro')}>Dinheiro</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {valorTotalCarrinho.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.payButton, cartItems.length === 0 && styles.payButtonDisabled]}
            onPress={handlePayAction}
            disabled={cartItems.length === 0 || (isSubmitting && selectedMethod === 'Dinheiro')} 
          >
            {isSubmitting && selectedMethod === 'Dinheiro' ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.payText}>
                    {selectedMethod === 'Dinheiro' ? 'Solicitar Pagamento' : 'Gerar Pagamento'}
                </Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <Pressable 
                style={styles.modalContent} 
                onPress={handleManualConfirmation}
            >
              
              {/* BOTÃO FECHAR (Sempre visível para cancelar) */}
              <TouchableOpacity style={styles.closeModalButton} onPress={handleCloseModal}>
                  <Ionicons name="close-circle" size={40} color="#A11613" />
              </TouchableOpacity>

              {getModalContent()}
            </Pressable>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#201000ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: "15%",
    paddingTop: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: RFPercentage(5),
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  paymentContainer: {
    width: '70%', 
    backgroundColor: 'white',
    borderRadius: 30,
    padding: RFPercentage(5), 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', 
    alignContent: 'center', 
    gap: RFPercentage(2), 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  method: {
    width: '47%', 
    aspectRatio: 1, 
    borderWidth: 2,
    borderColor: '#A11613',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  selected: {
    backgroundColor: '#A11613',
  },
  methodText: {
    fontSize: RFPercentage(2.5),
    color: '#A11613',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  methodTextWhite: {
    fontSize: RFPercentage(2.5),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    width: '90%',
    marginHorizontal: '5%',
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: RFPercentage(3.5),
    fontWeight: '600',
  },
  totalValue: {
    fontSize: RFPercentage(4),
    fontWeight: '900',
    color: '#201000ff',
  },
  payButton: {
    backgroundColor: '#A11613',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  payButtonDisabled: { 
    backgroundColor: '#ccc',
  },
  payText: {
    color: '#fff',
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    position: 'relative', 
  },
  closeModalButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      zIndex: 10,
  },
  modalTitle: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20, 
    color: '#A11613',
  },
  modalInstruction: {
    fontSize: RFPercentage(2.2), 
    textAlign: 'center', 
    marginTop: 20,
    color: '#555'
  },
  qrImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  imgPopup: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});