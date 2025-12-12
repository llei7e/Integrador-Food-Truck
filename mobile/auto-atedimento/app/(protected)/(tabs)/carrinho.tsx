// app/(protected)/(tabs)/carrinho.tsx
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../../../context/CartContext'; // --- NOVO ---
import { Ionicons } from '@expo/vector-icons'; // --- NOVO ---

// --- NOVO ---
// Copiando helpers de imagem e preço
const lancheImage = require('../../../assets/images/lanche1.jpg');
const comboImage = require('../../../assets/images/combos.jpg');
const bebidaImage = require('../../../assets/images/bebida1.jpg');

const getImageForItem = (categoriaId: number): ImageSourcePropType => {
  switch (categoriaId) {
    case 1:
      return lancheImage;
    case 2:
      return comboImage;
    case 3:
      return bebidaImage;
    default:
      return lancheImage;
  }
};

const formatPrice = (price: number): string => {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
};
// --- FIM DA SEÇÃO COPIADA ---

export default function Carrinho() {
  // --- NOVO ---
  const { cartItems, total, updateQuantity } = useCart();


  // --- NOVO ---
  // O que mostrar se o carrinho estiver vazio
  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carrinho</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(protected)/(tabs)/home')}
          >
            <Text style={styles.emptyButtonText}>Ver produtos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carrinho</Text>
      </View>

      <ScrollView>
        {/* --- ALTERADO --- Mapeia 'cartItems' do contexto */}
        {cartItems.map(item => (
          <View key={item.produto.id} style={styles.card}>
            <View style={styles.line}></View>
            <View style={styles.inside}>
              {/* --- ALTERADO --- Usa a imagem correta */}
              <Image 
                source={getImageForItem(item.produto.categoriaId)} 
                style={styles.cardImage} 
              />
              
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.produto.nome}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>{item.produto.descricao}</Text>
                <Text style={styles.cardPrice}>{formatPrice(item.produto.preco * item.quantity)}</Text>
              </View>

              {/* --- NOVO: Seletor de Quantidade --- */}
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item.produto.id, item.quantity - 1)}>
                  <Ionicons name="remove-circle" size={40} color="#A11613" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.produto.id, item.quantity + 1)}>
                  <Ionicons name="add-circle" size={40} color="#A11613" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))} 
        <View style={{ height: 150 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() =>
            router.push({
              pathname: '/pagamento', // Verifique se esta rota existe
              params: { total: total.toFixed(2) }, // params são strings
            })
          }
        >
          {/* --- ALTERADO --- Usa o 'total' do contexto */}
          <Text style={styles.paymentText}>Fazer Pagamento - {formatPrice(total)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    backgroundColor: '#201000ff',
    flexDirection: 'row',
    alignItems: 'center',
    height:"20%",
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    marginTop:-2,
    marginBottom:40,
    backgroundColor: 'white',
    paddingHorizontal: 25,
    gap: 40,
  },
  inside:{
    flexDirection: 'row',
    alignItems:"center",
    justifyContent: 'space-between', // --- ALTERADO ---
  },
  // --- ESTILOS AJUSTADOS para caber tudo ---
  cardImage: { width: 100, height: 100, borderRadius: 20, marginRight: 15 }, 
  cardInfo: { flex: 1, marginRight: 10 }, // Dá espaço para os botões
  cardTitle: { fontSize: 30, fontWeight: 'bold' },
  cardDescription: { fontSize: 20, color: '#555' },
  cardPrice: { fontSize: 24, fontWeight: 'bold', color: '#A11613', marginTop: 5 },
  
  // --- NOVOS ESTILOS ---
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#A11613',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- FIM DOS NOVOS ESTILOS ---

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paymentButton: {
    backgroundColor: '#A11613',
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 40,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
  line:{
    width:"100%",
    borderTopWidth: 2,
    borderColor: "black",
  }
});