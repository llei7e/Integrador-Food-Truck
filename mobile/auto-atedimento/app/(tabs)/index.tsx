import { StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
const menuItems = [ 
  { id: 1, name: 'Lanche 1', price: 'R$ 20,00', image: require('../../assets/images/lanche1.png') }, 
  { id: 2, name: 'Lanche 2', price: 'R$ 25,00', image: require('../../assets/images/lanche2.png') }, 
  { id: 3, name: 'Lanche 3', price: 'R$ 12,00', image: require('../../assets/images/lanche3.png') }, 
  { id: 4, name: 'Lanche 4', price: 'R$ 20,00', image: require('../../assets/images/lanche4.png') }, 
  { id: 5, name: 'Lanche 5', price: 'R$ 25,00', image: require('../../assets/images/lanche5.png') }, 
  { id: 6, name: 'Lanche 6', price: 'R$ 12,00', image: require('../../assets/images/lanche6.png') }, 
  { id: 7, name: 'Lanche 7', price: 'R$ 20,00', image: require('../../assets/images/lanche7.png') }, 
  { id: 8, name: 'Lanche 8', price: 'R$ 25,00', image: require('../../assets/images/lanche8.png') }, 
  { id: 9, name: 'Lanche 9', price: 'R$ 12,00', image: require('../../assets/images/lanche9.png') }, 
];

export default function TabOneScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
      </View>
      
      <View style={styles.categoryButtons}>
        <TouchableOpacity style={styles.categoryButton}>
          <Image source={require('../../assets/images/lanche.png')} style={styles.img} />
          <Text style={styles.categoryText}>Lanches</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButtonMiddle}>
          <Image source={require('../../assets/images/combo.png')} style={styles.img} />
          <Text style={styles.categoryText}>Combos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Image source={require('../../assets/images/bebidas.png')} style={styles.img} />
          <Text style={styles.categoryText}>Bebidas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <View style={styles.itemsContainer}>
          {menuItems.map(item => (
            <View key={item.id} style={styles.menuItem}>
              <Image source={item.image} style={styles.menuItemImage} />
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemPrice}>{item.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: "#2E1800",
  },
  logo: {
    height: 184,
    width: 166,
  },
  categoryText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '500',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#A11613',
    paddingVertical: 8,
    paddingHorizontal: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: 75,  // A altura máxima do botão
    alignItems: 'center', // Centra a imagem e o texto
  },
  categoryButtonMiddle: {
    backgroundColor: '#A11613',
    paddingVertical: 8,
    paddingHorizontal: 50,
    paddingTop: 25,  // Ajuste para os botões do meio
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center', // Centra a imagem e o texto
    gap: 5
  },
  img: {
    marginTop:-35,
    width: 50,  // Ajuste o tamanho da imagem conforme necessário
    height: 50, // Ajuste o tamanho da imagem conforme necessário
    resizeMode: 'contain', // Mantém a proporção da imagem
  },
  menuContainer:{
    padding:10,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
menuItem: {
  width: '32%', // Aproximadamente 1/3 da largura com espaço entre os itens
  backgroundColor: 'white',
  marginBottom: 15,
  alignItems: 'center',
  borderRadius: 20,  // Se quiser bordas arredondadas
  elevation: 5, // Adiciona uma sombra mais leve no Android
    // Sombra para iOS
  shadowColor: '#000', // Cor da sombra (preta)
  shadowOffset: { width: 0, height: 4 }, // Deslocamento da sombra (horizontal e vertical)
  shadowOpacity: 0.1, // Opacidade da sombra
  shadowRadius: 8, // Raio da sombra (quanto mais alto, mais difusa)
},

menuItemImage: {
  width: '100%',  // A imagem ocupará toda a largura do contêiner
  height: 200,  // Defina uma altura fixa ou adaptável
  resizeMode: 'cover', // 'cover' garante que a imagem preencha toda a área sem distorcer
  borderTopLeftRadius: 20,  // Se quiser bordas arredondadas na imagem
  borderTopRightRadius: 20,  // Se quiser bordas arredondadas na imagem
  marginBottom: 10,
},
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },

  menuItemPrice: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },

});
