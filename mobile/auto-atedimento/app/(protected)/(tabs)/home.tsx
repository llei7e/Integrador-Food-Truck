// app/(protected)/(tabs)/home.tsx
import { useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Text, View  } from 'react-native';
import { useRouter } from 'expo-router';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { useAuth } from '../../../context/AuthContext'; // Import adicionado

const texto = "Lorem ipsum dolor sit amet. Sed laboriosam assumenda ut explicabo voluptatibus ea nobis iste et consequatur quia quo perspiciatis molestiae ut facere dolor. Quo consequuntur maiores qui magni adipisci et perferendis iusto! Eos impedit voluptatem aut quasi autem qui aperiam eaque. Ut autem molestiae a veniam repellat est facere aliquid qui amet odit est porro veritatis."

const lanches = [ 
  { id: 100, name: 'Lanche 1', price: 'R$ 20,00', image: require('../../../assets/images/lanche1.jpg'), description: texto },
  { id: 102, name: 'Lanche 2', price: 'R$ 25,00', image: require('../../../assets/images/lanche2.jpeg'), description: texto }, 
  { id: 103, name: 'Lanche 3', price: 'R$ 12,00', image: require('../../../assets/images/lanche3.jpg'), description: texto }, 
  { id: 104, name: 'Lanche 4', price: 'R$ 20,00', image: require('../../../assets/images/lanche4.jpg'), description: texto }, 
  { id: 105, name: 'Lanche 5', price: 'R$ 25,00', image: require('../../../assets/images/lanche5.jpg'), description: texto }, 
  { id: 106, name: 'Lanche 6', price: 'R$ 12,00', image: require('../../../assets/images/lanche6.jpg'), description: texto }, 
  { id: 107, name: 'Lanche 7', price: 'R$ 20,00', image: require('../../../assets/images/lanche7.jpg'), description: texto }, 
  { id: 108, name: 'Lanche 8', price: 'R$ 25,00', image: require('../../../assets/images/lanche8.jpg'), description: texto }, 
  { id: 109, name: 'Lanche 9', price: 'R$ 12,00', image: require('../../../assets/images/lanche9.jpg'), description: texto }, 
];

const combos = [
  { id: 200, name: 'Combo 1', price: 'R$ 30,00', image: require('../../../assets/images/combos.jpg'), description: texto },
  { id: 201, name: 'Combo 2', price: 'R$ 35,00', image: require('../../../assets/images/combos.jpg'), description: texto },
  { id: 202, name: 'Combo 3', price: 'R$ 35,00', image: require('../../../assets/images/combos.jpg'), description: texto },
];

const bebidas = [
  { id: 300, name: 'Coca-Cola', price: 'R$ 8,00', image: require('../../../assets/images/bebida1.jpg'), description: texto },
  { id: 301, name: 'Suco', price: 'R$ 6,00', image: require('../../../assets/images/bebida1.jpg'), description: texto },
  { id: 303, name: 'Suco', price: 'R$ 6,00', image: require('../../../assets/images/bebida1.jpg'), description: texto },
];


export default function TabOneScreen() {
  const [categoria, setCategoria] = useState<'lanches' | 'combos' | 'bebidas'>('lanches');
  const router = useRouter();
  const { signOut } = useAuth(); // Pega a função signOut do contexto

  const getItems = () => {
    if (categoria === 'lanches') return lanches;
    if (categoria === 'combos') return combos;
    return bebidas;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../../assets/images/Logo.png')} style={styles.logo} />
              {/* Botão de Logout para teste */}
      <TouchableOpacity 
        onPress={signOut} 
        style={{ 
          backgroundColor: '#A11613', 
          padding: 15, 
          paddingHorizontal: 20, 
          alignItems: 'center', 
          position: 'absolute', 
          top: 20, 
          right: 20,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>SAIR</Text>
      </TouchableOpacity>
      </View>
      
      <View style={styles.categoryButtons}>
        <TouchableOpacity 
          style={[styles.categoryButton, categoria === 'lanches' && { backgroundColor: '#F39D0A' }]} 
          onPress={() => setCategoria('lanches')}
        >
          <Image source={require('../../../assets/images/lanche.png')} style={styles.img} />
          <Text style={styles.categoryText}>Lanches</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.categoryButtonMiddle, categoria === 'combos' && { backgroundColor: '#F39D0A' }]} 
          onPress={() => setCategoria('combos')}
        >
          <Image source={require('../../../assets/images/combo.png')} style={styles.img}/>
          <Text style={styles.categoryText}>Combos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.categoryButton, categoria === 'bebidas' && { backgroundColor: '#F39D0A' }]} 
          onPress={() => setCategoria('bebidas')}
        >
          <Image source={require('../../../assets/images/bebidas.png')} style={styles.img} />
          <Text style={styles.categoryText}>Bebidas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <View style={styles.itemsContainer}>
          {getItems().map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem1}
              onPress={() => router.push({
                pathname: "/detalhesProduto", 
                params: { 
                  id: String(item.id),
                  name: item.name,
                  price: item.price,
                  description: item.description,
                },
              })}
            >
              <View style={styles.menuItem}>
                <Image source={item.image} style={styles.menuItemImage} />
                <View style={styles.cardTextContainer}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>{item.price}</Text>
                  </View>
                  <View style={styles.cardRight} >
                    <TouchableOpacity style={styles.addProduct}>
                        <Text style={styles.addButtonText}>Carrinho</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>


    </View>
  );
}

const { width } = Dimensions.get('window');
const isMobile = width <= 768; // celular vs tablet
const styles = StyleSheet.create({
  screen: { flex: 1 },
  
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#201000ff",
    height: "25%",
  },
  
  logo: {
    height: "70%",
    aspectRatio: 1,
  },

  categoryText: {
    fontSize: RFValue(16),
    color: '#fff',
    fontWeight: '500',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },

  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },

  categoryButton: {
    backgroundColor: '#A11613',
    width: width * 0.30,
    height: RFValue(45),
    borderBottomLeftRadius: RFValue(20),
    borderBottomRightRadius: RFValue(20),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: RFValue(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },

  categoryButtonMiddle: {
    backgroundColor: '#A11613',
    width: width * 0.30,
    height: RFValue(55),
    paddingHorizontal: RFValue(10),
    borderBottomLeftRadius: RFValue(20),
    borderBottomRightRadius: RFValue(20),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: RFValue(8),
    gap: RFValue(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },

  img: {
    marginTop: -RFValue(45),
    width: RFValue(36),
    height: RFValue(32),
    resizeMode: 'contain',
  },

  menuContainer: { 
    padding: RFValue(5),
  },

  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  menuItem1: {
    width: '32.5%',
    marginBottom: RFValue(10),
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: RFValue(20),
    overflow: 'hidden',
    height: isMobile ? RFPercentage(20) : RFPercentage(20),
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  menuItemImage: {
    width: '100%',
    height: isMobile ? '65%' : '65%',
    resizeMode: 'cover',
  },

  cardTextContainer: {
    flexDirection: 'row',
    width: '100%',
    height: isMobile ? '35%' : '35%',
  },

  cardLeft: {
    width: '60%',
    justifyContent: 'center',
    paddingHorizontal: RFValue(5),
  },

  cardRight: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuItemName: {
    fontSize: isMobile ? RFValue(10) : RFValue(14),
    fontWeight: 'bold',
    marginVertical: RFValue(2),
    marginHorizontal: isMobile ? RFValue(0) : RFValue(5),
  },

  menuItemPrice: {
    fontSize: isMobile ? RFValue(10) : RFValue(12),
    color: '#555',
    marginBottom: RFValue(3),
    marginHorizontal: isMobile ? RFValue(0) : RFValue(5),
  },

  addProduct: {
    height: '100%',
    width: "100%",
    backgroundColor: "#A11613",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: -3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  addButtonText: {
    fontSize: isMobile ? RFValue(10) : RFValue(12),
    paddingVertical: RFValue(3),
    color: "#FFFFFF",
    textAlign: 'center',
  },
});