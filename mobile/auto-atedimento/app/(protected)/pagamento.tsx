import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useCart } from '../../context/CartContext'; 
import { api } from '../../lib/api'; 

export default function Pagamento() {
  const { cartItems, total: valorTotalCarrinho, clearCart } = useCart();

  const [selectedMethod, setSelectedMethod] = useState<'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro'>('Pix');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsSubmitting(false);
      setShowModal(false);
    }, [])
  );

  const getMethodStyle = (method: string) => method === selectedMethod ? [styles.method, styles.selected] : styles.method;
  const getTextStyle = (method: string) => method === selectedMethod ? styles.methodTextWhite : styles.methodText;
  const getIconColor = (method: string) => method === selectedMethod ? 'white' : '#A11613';

  const handlePaymentSuccess = async () => {
    if (isSubmitting) return; 
    
    if (cartItems.length === 0) {
        Alert.alert("Erro", "Seu carrinho está vazio.");
        return;
    }

    setIsSubmitting(true);

    let statusInicial = "NA_FILA"; 
    if (selectedMethod === 'Dinheiro') {
        statusInicial = "AGUARDANDO_PAGAMENTO"; 
    }

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
          <ActivityIndicator size={100} color="#201000ff" style={{ marginTop: 30 }} />
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
            <Text style={styles.modalTitle}>Dirija-se ao caixa/chapeiro para pagar</Text>
            <ActivityIndicator size={100} color="#201000ff" style={{ marginTop: 30 }} />
            <Text style={styles.modalInstruction}>Toque na tela para enviar o pedido</Text>
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

        {/* CONTAINER DOS MÉTODOS */}
        <View style={styles.centerContainer}>
            <View style={styles.paymentContainer}>
                <TouchableOpacity style={getMethodStyle('Pix')} onPress={() => setSelectedMethod('Pix')}>
                    <Ionicons name="qr-code" size={60} color={getIconColor('Pix')} />
                    <Text style={getTextStyle('Pix')}>Pix</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Cartão Crédito')} onPress={() => setSelectedMethod('Cartão Crédito')}>
                    <Ionicons name="card" size={60} color={getIconColor('Cartão Crédito')} />
                    <Text style={getTextStyle('Cartão Crédito')}>Crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Cartão Débito')} onPress={() => setSelectedMethod('Cartão Débito')}>
                    <Ionicons name="card-outline" size={60} color={getIconColor('Cartão Débito')} />
                    <Text style={getTextStyle('Cartão Débito')}>Débito</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMethodStyle('Dinheiro')} onPress={() => setSelectedMethod('Dinheiro')}>
                    <Ionicons name="cash-outline" size={60} color={getIconColor('Dinheiro')} />
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
            onPress={() => setShowModal(true)}
            disabled={cartItems.length === 0} 
          >
            <Text style={styles.payText}>Gerar Pagamento</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showModal} transparent animationType="fade">
          <Pressable
            style={styles.modalBackground}
            onPress={isSubmitting ? undefined : handlePaymentSuccess}
          >
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
  
  // --- ÁREA CENTRAL ---
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  paymentContainer: {
    width: '70%', // --- AQUI: EXATAMENTE 70% DA TELA ---
    backgroundColor: 'white',
    borderRadius: 30,
    padding: RFPercentage(5), // Padding moderado para não espremer os botões
    
    // Configuração do Grid (Flexbox)
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribui entre os cantos
    alignContent: 'center', // Centraliza verticalmente o bloco de botões
    gap: RFPercentage(2), // Espaço entre linhas e colunas

    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  method: {
    width: '47%', // 47% + 47% + gap = 100% da largura disponível no container
    aspectRatio: 1, // --- AQUI: FORÇA O FORMATO QUADRADO ---
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
  // --------------------

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
  
  // MODAL
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
  },
  modalTitle: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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