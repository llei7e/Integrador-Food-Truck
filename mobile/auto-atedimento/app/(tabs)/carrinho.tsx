// app/tabs/carrinho.tsx
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const itensCarrinho = [
  { id: 1, nome: 'Lanche 1', descricao: 'Picles, hamburguer, alface e tomate', preco: 4.99, imagem: require('../../assets/images/lanche1.png') },
  { id: 2, nome: 'Bebida 1', descricao: 'Copo 700ml', preco: 2.49, imagem: require('../../assets/images/bebidas.png') },
  { id: 3, nome: 'Lanche 2', descricao: 'Ovo, alface, tomate e hamburguer', preco: 7.99, imagem: require('../../assets/images/lanche2.png') },
  { id: 5, nome: 'Lanche 3', descricao: 'Hamburgao brabo', preco: 12, imagem: require('../../assets/images/lanche3.jpg') },
  { id: 6, nome: 'Lanche 7', descricao: 'Pao com carne moida', preco: 20, imagem: require('../../assets/images/lanche7.png') },
];

export default function Carrinho() {
  const total = itensCarrinho.reduce((acc, item) => acc + item.preco, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carrinho</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {itensCarrinho.map(item => (
          <View key={item.id} style={styles.card}>
            <Image source={item.imagem} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardDescription}>{item.descricao}</Text>
              <Text style={styles.cardPrice}>${item.preco.toFixed(2)}</Text>
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
              pathname: '/pagamento',
              params: { total: total.toFixed(2) }, // params são strings
            })
          }
        >
          <Text style={styles.paymentText}>Fazer Pagamento - ${total.toFixed(2)}</Text>
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

  scrollContainer: { paddingVertical: 20, paddingLeft: 20, paddingRight: 40 },

  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: 'center',
    gap: 40,

    // sombra
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardImage: { width: 150, height: 150, borderRadius: 20, marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 40, fontWeight: 'bold' },
  cardDescription: { fontSize: 25, color: '#555', marginVertical: 10 },
  cardPrice: { fontSize: 34, fontWeight: 'bold' },

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

    // sombra
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
});
