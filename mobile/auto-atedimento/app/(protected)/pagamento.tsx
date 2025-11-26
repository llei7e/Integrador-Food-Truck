import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';

export default function Pagamento() {
  const { cartItems, total: valorTotalCarrinho, clearCart } = useCart();

  const [selectedMethod, setSelectedMethod] = useState<'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro'>('Pix');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMethodStyle = (method: string) => method === selectedMethod ? [styles.method, styles.selected] : styles.method;
  const getTextStyle = (method: string) => method === selectedMethod ? styles.methodTextWhite : styles.methodText;

  const handlePaymentSuccess = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const pedidoDTO = {
      // total: valorTotalCarrinho,
      status: "na fila",
      truck_id: 1,
      foodtruck_id: 1,
      metodoPagamento: selectedMethod,
      itens: cartItems.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantity,
      }))
    };

    try {
      await api('/api/pedidos', {
        method: 'POST',
        auth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoDTO)
      });

      clearCart();
      router.replace('/agradecimento');

    } catch (error: any) {
      console.error("Falha ao criar pedido:", error);
      Alert.alert(
        "Erro no Pedido",
        `Não foi possível registrar o pedido: ${error.message || 'Tente novamente.'}`
      );
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  const getModalContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Text style={styles.modalTitle}>Registrando seu pedido...</Text>
          <ActivityIndicator size={200} color="#201000ff" style={{ marginTop: 30 }} />
          <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 20 }}>Aguarde...</Text>
        </>
      );
    }

    switch (selectedMethod) {
      case 'Pix':
        return (
          <>
            <Text style={styles.modalTitle}>Escaneie o QR Code</Text>
            <Image source={require('../../assets/images/codigo-qr.png')} style={styles.qrImage} />
            <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 20 }}>Toque na tela quando o pagamento for confirmado</Text>
          </>
        );
      case 'Cartão Crédito':
      case 'Cartão Débito':
        return (
          <>
            <Text style={styles.modalTitle}>Aproxime ou insira seu cartão na maquininha ({selectedMethod})</Text>
            <Image source={require('../../assets/images/pagamento.png')} style={styles.imgPopup} />
            <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 20 }}>Toque na tela quando o pagamento for confirmado</Text>
          </>
        );
      case 'Dinheiro':
        return (
          <>
            <Text style={styles.modalTitle}>Aguarde o chapeiro...</Text>
            <ActivityIndicator size={200} color="#201000ff" style={{ marginTop: 30 }} />
            <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 20 }}>Toque na tela quando o pagamento for confirmado</Text>
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
            <Ionicons name="chevron-back-circle-outline" size={70} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento</Text>
        </View>

        {/* Métodos de Pagamento */}
        <View style={styles.paymentContainer}>
          <TouchableOpacity style={getMethodStyle('Pix')} onPress={() => setSelectedMethod('Pix')}>
            <Ionicons name="qr-code" size={90} color={selectedMethod === 'Pix' ? 'white' : '#A11613'} />
            <Text style={getTextStyle('Pix')}>Pix</Text>
          </TouchableOpacity>

          <TouchableOpacity style={getMethodStyle('Cartão Crédito')} onPress={() => setSelectedMethod('Cartão Crédito')}>
            <Ionicons name="card" size={90} color={selectedMethod === 'Cartão Crédito' ? 'white' : '#A11613'} />
            <Text style={getTextStyle('Cartão Crédito')}>Cartão Crédito</Text>
          </TouchableOpacity>

          <TouchableOpacity style={getMethodStyle('Cartão Débito')} onPress={() => setSelectedMethod('Cartão Débito')}>
            <Ionicons name="card-outline" size={90} color={selectedMethod === 'Cartão Débito' ? 'white' : '#A11613'} />
            <Text style={getTextStyle('Cartão Débito')}>Cartão Débito</Text>
          </TouchableOpacity>

          <TouchableOpacity style={getMethodStyle('Dinheiro')} onPress={() => setSelectedMethod('Dinheiro')}>
            <Ionicons name="cash-outline" size={90} color={selectedMethod === 'Dinheiro' ? 'white' : '#A11613'} />
            <Text style={getTextStyle('Dinheiro')}>Dinheiro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            {/* --- 7. USAR O TOTAL REAL DO CONTEXTO --- */}
            <Text style={styles.totalValue}>R$ {valorTotalCarrinho.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.payButton, cartItems.length === 0 && styles.payButtonDisabled]}
            onPress={() => setShowModal(true)}
            disabled={cartItems.length === 0} // Desabilita o botão se o carrinho estiver vazio
          >
            <Text style={styles.payText}>Gerar Pagamento</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de pagamento */}
        <Modal visible={showModal} transparent animationType="fade">
          {/* --- 8. ATUALIZADO PARA CHAMAR A FUNÇÃO DE PAGAMENTO --- */}
          <Pressable
            style={styles.modalBackground}
            // Só permite fechar/clicar se NÃO estiver enviando
            onPress={isSubmitting ? undefined : handlePaymentSuccess}
          >
            {/* Envolve o conteúdo para que o clique nele também funcione */}
            <Pressable style={styles.modalContent} onPress={isSubmitting ? undefined : handlePaymentSuccess}>
              {getModalContent()}
            </Pressable>
          </Pressable>
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
    height: "20%",
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    left: 30,
    top: '30%',
    transform: [{ translateY: -20 }],
    zIndex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 40,
    fontWeight: '600',
    lineHeight: 1,
  },
  totalValue: {
    fontSize: 50,
    fontWeight: '900',
  },
  payButton: {
    backgroundColor: '#A11613',
    width: '95%',
    marginTop: 40,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  payButtonDisabled: { // Estilo para o botão desabilitado
    backgroundColor: '#ccc',
  },
  payText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  paymentContainer: {
    gap: RFPercentage(8),
    marginHorizontal: '15%',
    height: RFPercentage(50), // <-- Altura mantida
    width: '70%',
    borderRadius: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: RFPercentage(6),
    justifyContent: 'center', // <-- Correção do grid 2x2
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: -1,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  method: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#A11613',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  selected: {
    backgroundColor: '#A11613',
    width: 200,
    height: 200,
  },
  methodText: {
    fontSize: 20,
    color: '#A11613',
    fontWeight: 'bold',
  },
  methodTextWhite: {
    fontSize: 26,
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    width: '80%',
    marginHorizontal: '10%',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#A11613',
  },
  qrImage: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 80,
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: '#A11613',
    borderRadius: 20,
  },
  closeText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
  imgPopup: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
});