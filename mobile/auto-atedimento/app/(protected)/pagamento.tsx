import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator, Pressable, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Stack } from 'expo-router';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext'; 
import { api } from '../../lib/api'; 

// --- LÓGICA DE ESCALA MATEMÁTICA (VERTICAL) ---
const { width, height } = Dimensions.get('window');
const realWidth = width < height ? width : height; 
const guidelineBaseWidth = 768; 
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;
// -------------------------------------

export default function Pagamento() {
  const { cartItems, total: valorTotalCarrinho, clearCart } = useCart();

  const [selectedMethod, setSelectedMethod] = useState<'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro'>('Pix');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [tempOrderId, setTempOrderId] = useState<number | null>(null);
  const pollingInterval = useRef<any>(null);

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

  useEffect(() => {
      if (showModal && selectedMethod === 'Dinheiro' && tempOrderId) {
          const checkStatus = async () => {
              try {
                  const listaPedidos = await api('/api/pedidos', { auth: true }) as any[];
                  const meuPedido = listaPedidos.find(p => p.id === tempOrderId);
                  
                  if (meuPedido) {
                      if (meuPedido.status !== 'AGUARDANDO_PAGAMENTO') {
                          console.log("Status mudou! Finalizando pagamento...");
                          stopPolling();
                          setIsSubmitting(false);
                          setShowModal(false);
                          clearCart();
                          router.replace('/agradecimento');
                      }
                  }
              } catch (e) {
                  console.log("Polling check failed:", e);
              }
          };
          pollingInterval.current = setInterval(checkStatus, 3000);
          checkStatus();
      } else {
          stopPolling();
      }
      return () => stopPolling();
  }, [showModal, selectedMethod, tempOrderId]);

  const handleCloseModal = async () => {
      if (isSubmitting && selectedMethod !== 'Dinheiro') return;

      if (selectedMethod === 'Dinheiro' && tempOrderId) {
          try {
              await api(`/api/pedidos/${tempOrderId}`, { method: 'DELETE', auth: true });
          } catch (e) {
              console.error("Erro ao deletar pedido:", e);
          }
          setTempOrderId(null);
      }
      
      stopPolling();
      setShowModal(false);
      setIsSubmitting(false);
  };

  const handlePayAction = async () => {
    if (cartItems.length === 0) {
        Alert.alert("Erro", "Seu carrinho está vazio.");
        return;
    }
    if (selectedMethod === 'Dinheiro') {
        await createOrder('AGUARDANDO_PAGAMENTO');
    } else {
        setShowModal(true);
    }
  };

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
      const res = await api('/api/pedidos', {
        method: 'POST',
        auth: true, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoDTO)
      }) as any;

      if (selectedMethod === 'Dinheiro') {
          setTempOrderId(res.id);
          setShowModal(true);
      } else {
          clearCart(); 
          router.replace('/agradecimento'); 
          setIsSubmitting(false);
      }
    } catch (error: any) {
      Alert.alert("Erro", `Falha ao registrar pedido: ${error.message}`);
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  const handleManualConfirmation = () => {
      if (selectedMethod === 'Dinheiro') return; 
      createOrder('NA_FILA');
  };

  const getModalContent = () => {
    if (isSubmitting && selectedMethod !== 'Dinheiro') {
      return (
        <>
          <Text style={styles.modalTitle}>Registrando seu pedido...</Text>
          <ActivityIndicator size={scale(100)} color="#201000ff" style={{ marginTop: scale(30) }} />
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
            <Text style={[styles.modalInstruction, { fontSize: scale(22), fontWeight: 'bold', color: '#201000ff' }]}>
                Dirija-se ao caixa com R$ {valorTotalCarrinho.toFixed(2)}
            </Text>
            <ActivityIndicator size={scale(80)} color="#A11613" style={{ marginVertical: scale(30) }} />
            <Text style={styles.modalInstruction}>
                Aguardando confirmação do atendente...
            </Text>
            <Text style={{fontSize: scale(14), color: '#999', marginTop: scale(10)}}>
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
            <Ionicons name="chevron-back-circle-outline" size={scale(60)} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento</Text>
        </View>

        <View style={styles.centerContainer}>
            {/* AQUI ESTÁ A MUDANÇA PRINCIPAL:
               Container mais largo (85%) e botões retangulares (sem aspectRatio)
            */}
            <View style={styles.paymentContainer}>
                <TouchableOpacity style={getMethodStyle('Pix')} onPress={() => setSelectedMethod('Pix')}>
                    <Ionicons name="qr-code" size={scale(60)} color={getIconColor('Pix')} />
                    <Text style={getTextStyle('Pix')}>Pix</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Cartão Crédito')} onPress={() => setSelectedMethod('Cartão Crédito')}>
                    <Ionicons name="card" size={scale(60)} color={getIconColor('Cartão Crédito')} />
                    <Text style={getTextStyle('Cartão Crédito')}>Crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Cartão Débito')} onPress={() => setSelectedMethod('Cartão Débito')}>
                    <Ionicons name="card-outline" size={scale(60)} color={getIconColor('Cartão Débito')} />
                    <Text style={getTextStyle('Cartão Débito')}>Débito</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Dinheiro')} onPress={() => setSelectedMethod('Dinheiro')}>
                    <Ionicons name="cash-outline" size={scale(60)} color={getIconColor('Dinheiro')} />
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
              <TouchableOpacity style={styles.closeModalButton} onPress={handleCloseModal}>
                  <Ionicons name="close-circle" size={scale(40)} color="#A11613" />
              </TouchableOpacity>

              {getModalContent()}
            </Pressable>
          </View>
        </Modal>
      </View>
    </>
  );
}

// --- ESTILOS AJUSTADOS ---
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
    paddingTop: scale(20),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: scale(40),
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    left: scale(20),
    zIndex: 1,
    paddingTop: scale(20),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  
  // --- CONTAINER RETANGULAR ---
  paymentContainer: {
    width: '80%', // Mais largo (retângulo)
    backgroundColor: 'white',
    borderRadius: scale(30),
    padding: scale(40), // Menos padding para os botões crescerem
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', 
    alignContent: 'center', 
    gap: scale(20), 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(10),
    elevation: 6,
  },
  
  // --- BOTÕES RETANGULARES ---
  method: {
    width: '48%', // Quase metade (2 por linha)
    height: scale(220), // Altura fixa para criar o retângulo horizontal
    // aspectRatio REMOVIDO para permitir formato livre
    borderWidth: scale(2),
    borderColor: '#A11613',
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selected: {
    backgroundColor: '#A11613',
  },
  methodText: {
    fontSize: scale(24),
    color: '#A11613',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: scale(15)
  },
  methodTextWhite: {
    fontSize: scale(24),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: scale(5)
  },
  footer: {
    alignItems: 'center',
    width: '90%',
    marginHorizontal: '5%',
    marginBottom: scale(20),
  },
  totalRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: scale(10),
  },
  totalLabel: {
    fontSize: scale(32),
    fontWeight: '600',
  },
  totalValue: {
    fontSize: scale(36),
    fontWeight: '900',
    color: '#201000ff',
  },
  payButton: {
    backgroundColor: '#A11613',
    width: '100%',
    paddingVertical: scale(15),
    borderRadius: scale(50),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: 5,
  },
  payButtonDisabled: { 
    backgroundColor: '#ccc',
  },
  payText: {
    color: '#fff',
    fontSize: scale(28),
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
    borderRadius: scale(30),
    padding: scale(30),
    alignItems: 'center',
    elevation: 10,
    position: 'relative', 
  },
  closeModalButton: {
      position: 'absolute',
      top: scale(15),
      right: scale(15),
      zIndex: 10,
  },
  modalTitle: {
    fontSize: scale(28),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scale(20),
    marginTop: scale(20), 
    color: '#A11613',
  },
  modalInstruction: {
    fontSize: scale(20), 
    textAlign: 'center', 
    marginTop: scale(20),
    color: '#555'
  },
  qrImage: {
    width: scale(250),
    height: scale(250),
    resizeMode: 'contain',
  },
  imgPopup: {
    width: scale(200),
    height: scale(200),
    resizeMode: 'contain',
  },
});