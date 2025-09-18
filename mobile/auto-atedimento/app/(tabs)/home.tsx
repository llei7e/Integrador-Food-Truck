import { useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { RFValue } from 'react-native-responsive-fontsize';

const texto = "Lorem ipsum dolor sit amet. Sed laboriosam assumenda ut explicabo voluptatibus ea nobis iste et consequatur quia quo perspiciatis molestiae ut facere dolor. Quo consequuntur maiores qui magni adipisci et perferendis iusto! Eos impedit voluptatem aut quasi autem qui aperiam eaque. Ut autem molestiae a veniam repellat est facere aliquid qui amet odit est porro veritatis."

const lanches = [ 
  { id: 100, name: 'Lanche 1', price: 'R$ 20,00', image: require('../../assets/images/lanche1.jpg'), description: texto }, 
  { id: 102, name: 'Lanche 2', price: 'R$ 25,00', image: require('../../assets/images/lanche2.jpeg'), description: texto }, 
  { id: 103, name: 'Lanche 3', price: 'R$ 12,00', image: require('../../assets/images/lanche3.jpg'), description: texto }, 
  { id: 104, name: 'Lanche 4', price: 'R$ 20,00', image: require('../../assets/images/lanche4.jpg'), description: texto }, 
  { id: 105, name: 'Lanche 5', price: 'R$ 25,00', image: require('../../assets/images/lanche5.jpg'), description: texto }, 
  { id: 106, name: 'Lanche 6', price: 'R$ 12,00', image: require('../../assets/images/lanche6.jpg'), description: texto }, 
  { id: 107, name: 'Lanche 7', price: 'R$ 20,00', image: require('../../assets/images/lanche7.jpg'), description: texto }, 
  { id: 108, name: 'Lanche 8', price: 'R$ 25,00', image: require('../../assets/images/lanche8.jpg'), description: texto }, 
  { id: 109, name: 'Lanche 9', price: 'R$ 12,00', image: require('../../assets/images/lanche9.jpg'), description: texto }, 
];

const combos = [
  { id: 200, name: 'Combo 1', price: 'R$ 30,00', image: require('../../assets/images/combos.jpg'), description: texto },
  { id: 201, name: 'Combo 2', price: 'R$ 35,00', image: require('../../assets/images/combos.jpg'), description: texto },
  { id: 202, name: 'Combo 3', price: 'R$ 35,00', image: require('../../assets/images/combos.jpg'), description: texto },
];

const bebidas = [
  { id: 300, name: 'Coca-Cola', price: 'R$ 8,00', image: require('../../assets/images/bebida1.jpg'), description: texto },
  { id: 301, name: 'Suco', price: 'R$ 6,00', image: require('../../assets/images/bebida1.jpg'), description: texto },
  { id: 303, name: 'Suco', price: 'R$ 6,00', image: require('../../assets/images/bebida1.jpg'), description: texto },
];

export default function TabOneScreen() {
  const [categoria, setCategoria] = useState<'lanches' | 'combos' | 'bebidas'>('lanches');
  const router = useRouter();

  const getItems = () => {
    if (categoria === 'lanches') return lanches;
    if (categoria === 'combos') return combos;
    return bebidas;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
      </View>
      
      <View style={styles.categoryButtons}>
        <TouchableOpacity 
          style={[styles.categoryButton, categoria === 'lanches' && { backgroundColor: '#F39D0A' }]} 
          onPress={() => setCategoria('lanches')}
        >
          <Image source={require('../../assets/images/lanche.png')} style={styles.img} />
          <Text style={styles.categoryText}>Lanches</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.categoryButtonMiddle, categoria === 'combos' && { backgroundColor: '#F39D0A' }]} 
          onPress={() => setCategoria('combos')}
        >
          <Image source={require('../../assets/images/combo.png')} style={styles.img}/>
          <Text style={styles.categoryText}>Combos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.categoryButton, categoria === 'bebidas' && { backgroundColor: '#F39D0A' }]} 
          onPress={() => setCategoria('bebidas')}
        >
          <Image source={require('../../assets/images/bebidas.png')} style={styles.img} />
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
                  id: item.id.toString(),
                  name: item.name,
                  price: item.price,
                  description: item.description
                }
              })}
            >
              <View style={styles.menuItem}>
                <Image source={item.image} style={styles.menuItemImage} />
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemPrice}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#201000ff",
    height: "20%",
  },
  logo: {
    height: "100%",
    aspectRatio: 1
  },
  categoryText: {
    fontSize: RFValue(18),
    color: '#fff',
    fontWeight: '500',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: "5%",
  },
  categoryButton: {
    backgroundColor: '#A11613',
    paddingVertical: "2%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: RFValue(75),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 8, 
  },
  categoryButtonMiddle: {
    backgroundColor: '#A11613',
    paddingVertical: RFValue(10),
    paddingHorizontal: RFValue(10),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    gap: RFValue(5),
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.4, 
    shadowRadius: 8, 
  },
  img: {
    marginTop:-RFValue(45),
    width: RFValue(40),  
    height: RFValue(30), 
    resizeMode: 'contain', 
  },
  menuContainer:{ padding: RFValue(10) },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '100%', 
    backgroundColor: 'white',
    marginBottom: RFValue(15),
    alignItems: 'center',
    borderRadius: RFValue(20),
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem1: { width: '32%' },
  menuItemImage: {
    width: '100%',
    height: RFValue(200),
    resizeMode: 'cover',
    borderTopLeftRadius: RFValue(20),
    borderTopRightRadius: RFValue(20),
    marginBottom: RFValue(10),
  },
  menuItemName: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginBottom: RFValue(5),
    textAlign: 'center',
  },
  menuItemPrice: {
    fontSize: RFValue(14),
    color: '#555',
    textAlign: 'center',
  },
});
