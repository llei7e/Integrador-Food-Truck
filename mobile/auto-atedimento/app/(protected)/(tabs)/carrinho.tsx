// app/(protected)/(tabs)/carrinho.tsx
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ImageSourcePropType, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../../../context/CartContext'; 
import { Ionicons } from '@expo/vector-icons'; 

// --- LÓGICA DE ESCALA MATEMÁTICA (VERTICAL) ---
const { width, height } = Dimensions.get('window');
// Garante que pegamos a menor dimensão (largura em modo retrato)
const realWidth = width < height ? width : height; 
// 768px é a largura base de um iPad/Tablet padrão em Retrato.
const guidelineBaseWidth = 768; 
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;
// -------------------------------------

// Copiando helpers de imagem e preço
const lancheImage = require('../../../assets/images/lanche1.jpg');
const comboImage = require('../../../assets/images/fritas.jpg');
const bebidaImage = require('../../../assets/images/bebida1.jpg');

const getImageForItem = (categoriaId: number): ImageSourcePropType => {
  switch (categoriaId) {
    case 1: return lancheImage;
    case 2: return comboImage;
    case 3: return bebidaImage;
    default: return lancheImage;
  }
};

const formatPrice = (price: number): string => {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
};

export default function Carrinho() {
  const { cartItems, total, updateQuantity } = useCart();

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

      <ScrollView contentContainerStyle={{ paddingBottom: scale(150) }}>
        {cartItems.map(item => (
          <View key={item.produto.id} style={styles.card}>
            <View style={styles.line}></View>
            <View style={styles.inside}>
              <Image 
                source={getImageForItem(item.produto.categoriaId)} 
                style={styles.cardImage} 
              />
              
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.produto.nome}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>{item.produto.descricao}</Text>
                <Text style={styles.cardPrice}>{formatPrice(item.produto.preco * item.quantity)}</Text>
              </View>

              {/* Seletor de Quantidade */}
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item.produto.id, item.quantity - 1)}>
                  <Ionicons name="remove-circle" size={scale(40)} color="#A11613" />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity onPress={() => updateQuantity(item.produto.id, item.quantity + 1)}>
                  <Ionicons name="add-circle" size={scale(40)} color="#A11613" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))} 
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() =>
            router.push({
              pathname: '/pagamento', 
              params: { total: total.toFixed(2) },
            })
          }
        >
          <Text style={styles.paymentText}>Fazer Pagamento - {formatPrice(total)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- ESTILOS COM SCALE ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  
  header: {
    backgroundColor: '#201000ff',
    flexDirection: 'row',
    alignItems: 'center',
    height: "20%", // Mantido % para preencher o topo
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scale(48), // Ajustado proporcionalmente
    fontWeight: 'bold',
    color: 'white',
  },
  
  card: {
    marginTop: -scale(2),
    marginBottom: scale(30),
    backgroundColor: 'white',
    paddingHorizontal: scale(25),
    // gap foi removido daqui pois não funciona bem em views antigas do RN sem flex, 
    // o espaçamento interno é controlado pelos elementos
  },
  line:{
    width:"100%",
    borderTopWidth: scale(2),
    borderColor: "black",
    marginBottom: scale(30), // Substitui o gap
  },
  inside:{
    flexDirection: 'row',
    alignItems:"center",
    justifyContent: 'space-between', 
  },
  
  cardImage: { 
    width: scale(100), 
    height: scale(100), 
    borderRadius: scale(20), 
    marginRight: scale(15) 
  }, 
  
  cardInfo: { 
    flex: 1, 
    marginRight: scale(10),
    justifyContent: 'center'
  }, 
  
  cardTitle: { 
    fontSize: scale(24), 
    fontWeight: 'bold',
    color: '#333'
  },
  cardDescription: { 
    fontSize: scale(16), 
    color: '#555',
    marginTop: scale(2)
  },
  cardPrice: { 
    fontSize: scale(20), 
    fontWeight: 'bold', 
    color: '#A11613', 
    marginTop: scale(5) 
  },
  
  // --- QUANTIDADE ---
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  quantityText: {
    fontSize: scale(24),
    fontWeight: 'bold',
    minWidth: scale(30),
    textAlign: 'center'
  },

  // --- EMPTY STATE ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  emptyText: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    marginBottom: scale(20),
  },
  emptyButton: {
    backgroundColor: '#A11613',
    paddingVertical: scale(15),
    paddingHorizontal: scale(40),
    borderRadius: scale(30),
  },
  emptyButtonText: {
    color: 'white',
    fontSize: scale(18),
    fontWeight: 'bold',
  },

  // --- FOOTER ---
  footer: {
    position: 'absolute',
    bottom: scale(20),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paymentButton: {
    backgroundColor: '#A11613',
    borderRadius: scale(50),
    paddingVertical: scale(20),
    paddingHorizontal: scale(40),
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: scale(5), height: scale(5) },
    shadowOpacity: 0.5,
    shadowRadius: scale(8),
    elevation: 6,
  },
  paymentText: { 
    color: 'white', 
    fontSize: scale(24), 
    fontWeight: 'bold' 
  },
});