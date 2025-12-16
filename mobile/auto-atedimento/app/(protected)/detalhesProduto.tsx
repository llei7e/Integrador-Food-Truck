import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ImageSourcePropType, Dimensions } from 'react-native';
import { useLocalSearchParams, useNavigation, Stack, router} from 'expo-router';
import { useEffect, useState } from 'react'; 
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext'; 

const { width, height } = Dimensions.get('window');
const realWidth = width < height ? width : height; 
const guidelineBaseWidth = 768; 
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  categoriaId: number; 
}

const lancheImage = require('../../assets/images/lanche1.jpg');
const comboImage = require('../../assets/images/fritas.jpg');
const bebidaImage = require('../../assets/images/bebida1.jpg');

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

export default function DetalhesProduto() {
  const { item } = useLocalSearchParams();
  const produto = JSON.parse(item as string) as Produto;

  const navigation = useNavigation();
  const { addToCart } = useCart(); 
  const [quantity, setQuantity] = useState(1); 

   useEffect(() => {
       navigation.setOptions({ title: produto.nome });
   }, [produto.nome]);

  const handleIncrement = () => {
    setQuantity(q => q + 1);
  };

  const handleDecrement = () => {
    setQuantity(q => (q > 1 ? q - 1 : 1)); 
  };

  const handleAddToCart = () => {
    addToCart(produto, quantity);
    router.push('/(protected)/(tabs)/carrinho');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.containerFull}>
            <ScrollView>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back-circle-outline" size={scale(70)} color="white" />
                </TouchableOpacity>
                
                <Image source={getImageForItem(produto.categoriaId)} style={styles.image} />
                
                <View style={styles.logoPosition}>
                    <Image source={require('../../assets/images/Logo.png')} style={styles.logo}  />
                </View>

                <View style={styles.containerInfos}>
                    <Text style={styles.name}>{produto.nome}</Text>
                    <Text style={styles.price}>{formatPrice(produto.preco)}</Text>
                    <Text style={styles.description}>{produto.descricao}</Text>
                </View>

                <View style={styles.footer}></View>
            </ScrollView>
            
            <View style={styles.containerCartButtons}>
                <View style={styles.quantityButton}>
                    <TouchableOpacity style={styles.addProduct1} onPress={handleDecrement}>
                        <Ionicons name="remove" size={scale(50)} color="black" />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{quantity}</Text>

                    <TouchableOpacity style={styles.addProduct} onPress={handleIncrement}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addCartButton} onPress={handleAddToCart}>
                    <Text style={styles.addCartText}>Adicionar ao Carrinho</Text>
                </TouchableOpacity>
            </View>
        </View>
    </>
  );
}

const styles = StyleSheet.create({
    containerFull: { flex: 1, backgroundColor: 'white' },
    image: { 
        height: scale(500),  
        width: '100%'
    },
    
    name: { 
        fontSize: scale(32), 
        fontWeight: 'bold', 
        marginTop: scale(20)
    },
    
    price: { 
        fontSize: scale(24), 
        color: '#A11613', 
        marginTop: scale(10), 
        fontWeight: 'bold' 
    },
    logo: { 
        height: scale(160), 
        width: scale(150), 
        resizeMode: 'contain'
    },
    backButton: {
        position: 'absolute',
        left: scale(30),
        top: scale(40), 
        zIndex: 1,  
        backgroundColor: '#201000ff',
        borderRadius: scale(80),
        height: scale(70),
        width: scale(70), 
        alignItems: 'center',
        justifyContent: 'center', 
    },
    logoPosition: {
        width: '100%',
        paddingHorizontal: scale(30),
        flexDirection: 'row',
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        marginTop: -scale(80),  
        marginBottom: -scale(60) 
    },
    containerInfos:{
        paddingHorizontal: scale(40) 
    },
    description:{
        marginTop: scale(15),
        fontSize: scale(18),
        textAlign: 'justify',
        fontStyle: 'italic',
        color: '#555'
    },
    containerCartButtons: {
        position: 'absolute',
        bottom: scale(20), 
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent', 
        paddingHorizontal: scale(50),
    },
    quantityButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20), 
        backgroundColor: "white",    
        borderColor: "#A11613",      
        borderWidth: scale(3),              
        width: '30%', 
        height: scale(80),
        borderRadius: scale(50),
        shadowColor: '#000', 
        shadowOffset: { width: scale(5), height: scale(5) }, 
        shadowOpacity: 0.5,
        shadowRadius: scale(8),       
    },
    addProduct:{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(5),
    },
    addProduct1:{
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText:{
        fontSize: scale(60),
        color:"#A11613",
        lineHeight: scale(70), 
        marginTop: -scale(5)
    },
    addCartButton:{
        backgroundColor: "#A11613",
        width: '55%', 
        height: scale(80),
        borderRadius: scale(50),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: scale(5), height: scale(5) }, 
        shadowOpacity: 0.5,
        shadowRadius: scale(8),
    },
    addCartText:{
        color: 'white',
        fontSize: scale(20),
        fontWeight: 'bold',
        textAlign: 'center'
    },
    quantityText:{
        color: 'black',
        fontSize: scale(30),
        fontWeight: 'bold'
    },
    footer:{
        height: scale(150) 
    }
});