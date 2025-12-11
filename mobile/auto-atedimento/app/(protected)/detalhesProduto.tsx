// app/detalhesProduto.tsx
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useLocalSearchParams, useNavigation, Stack, router} from 'expo-router';
import { useEffect, useState } from 'react'; // --- ALTERADO ---
import { Ionicons } from '@expo/vector-icons';
// import EvilIcons from '@expo/vector-icons/EvilIcons'; // Não é mais usado
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useCart } from '../../context/CartContext'; // --- NOVO ---

// --- NOVO ---
// Copiamos a lógica de imagens e tipos do home.tsx
// ---
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


export default function DetalhesProduto() {
  // --- ALTERADO ---
  // Recebe o 'item' como string JSON e o 'produto'
  const { item } = useLocalSearchParams();
  const produto = JSON.parse(item as string) as Produto;

  const navigation = useNavigation();
  const { addToCart } = useCart(); // --- NOVO ---
  const [quantity, setQuantity] = useState(1); // --- NOVO ---

   // Atualiza o título da página para o nome do item
    useEffect(() => {
        navigation.setOptions({ title: produto.nome });
    }, [produto.nome]);

  // --- NOVAS FUNÇÕES ---
  const handleIncrement = () => {
    setQuantity(q => q + 1);
  };

  const handleDecrement = () => {
    setQuantity(q => (q > 1 ? q - 1 : 1)); // Não deixa ser menor que 1
  };

  const handleAddToCart = () => {
    addToCart(produto, quantity);
    // Opcional: Navega para o carrinho ou mostra um "Toast" de sucesso
    router.push('/(protected)/(tabs)/carrinho');
  };
  // --- FIM DAS NOVAS FUNÇÕES ---

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.containerFull}>
            <ScrollView>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back-circle-outline" size={70} color="white" />
                </TouchableOpacity>
                {/* --- ALTERADO --- Usa a imagem correta baseada na categoriaId */}
                <Image source={getImageForItem(produto.categoriaId)} style={styles.image} />
                <View style={styles.logoPosition}>
                    <Image source={require('../../assets/images/Logo.png')} style={styles.logo}  />
                </View>

                <View style={styles.containerInfos}>
                    <Text style={styles.name}>{produto.nome}</Text>
                    {/* --- ALTERADO --- Formata o preço numérico */}
                    <Text style={styles.price}>{formatPrice(produto.preco)}</Text>
                    <Text style={styles.description}>{produto.descricao}</Text>
                </View>

                <View style={styles.footer}></View>
            </ScrollView>
            
            {/* --- SEÇÃO DE BOTÕES ALTERADA --- */}
            <View style={styles.containerCartButtons}>
                <View style={styles.quantityButton}>
                    <TouchableOpacity style={styles.addProduct1} onPress={handleDecrement}>
                        {/* Mudei o ícone de "trash" para "remove" */}
                        <Ionicons name="remove" size={50} color="black" />
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

// --- ESTILOS ---
// (Seus estilos permanecem os mesmos)
const styles = StyleSheet.create({
    containerFull: { flex: 1, backgroundColor: 'white' },
    image: { height: RFPercentage(50),  width: '100%'},
    name: { fontSize: RFPercentage(4), fontWeight: 'bold', marginTop: -RFPercentage(2)},
    price: { fontSize: RFPercentage(3), color: '#A11613', marginTop: RFPercentage(1.5), fontWeight: '500' },
    logo: { height: RFPercentage(18), width: RFPercentage(16), justifyContent: 'center'},
    backButton: {
        position: 'absolute',
        left: 30,
        top: '3%',
        transform: [{ translateY: -20 }],
        zIndex: 1,  
        backgroundColor: '#201000ff',
        borderRadius: 80,
        height: 70,
        alignItems: 'center',
        flexDirection: 'row'
    },
    logoPosition: {
        width: '100%',
        paddingHorizontal: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        marginTop: -100,  
        marginBottom: -80 
    },
    containerInfos:{
        paddingHorizontal: 40 
    },
    description:{
        marginTop: RFPercentage(1.5),
        fontSize: RFPercentage(2),
        textAlign: 'justify',
        fontStyle: 'italic'
    },
    containerAdd:{
        marginTop:30,
        width: '100%',
        paddingVertical: 20,
        backgroundColor: '#201000ff',
        justifyContent:'center',
        paddingHorizontal: 40,
        gap: 8
    },
    titleAdd:{
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold'
    },
    textAdd:{
        color: 'white',
        fontSize: 20,
        fontWeight: '100',
        fontStyle: 'italic'
    },
    containerCartButtons: {
        position: 'absolute',
        bottom: 20, // distância da borda inferior
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'transparent', // transparente
        paddingHorizontal: 20,
    },
    quantityButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30, 
        backgroundColor: "white",    
        borderColor: "#A11613",      
        borderWidth: 3,              
        borderStyle: "solid",        
        width: 270,
        height: 100,
        borderRadius: 50,
        shadowColor: '#000', 
        shadowOffset: { width: 5, height: 5 }, 
        shadowOpacity: 0.5,
        shadowRadius: 8,       
    },
    addProduct:{
        alignItems: 'center',
        paddingHorizontal: 5,
        borderRadius: 30
    },
    addProduct1:{
        alignItems: 'center',
        borderRadius: 30
    },
    addButtonText:{
        marginTop:-20,
        fontSize: 70,
        color:"#A11613"
    },
    addCartButton:{
        backgroundColor: "#A11613",
        width: 390,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 5, height: 5 }, 
        shadowOpacity: 0.5,
        shadowRadius: 8,
        
    },
    addCartText:{
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold'
    },
    quantityText:{
        color: 'black',
        fontSize: 35,
        fontWeight: 'bold'
    },
    opcoesCard:{
        height: 120,
        borderBottomWidth: 2,
        marginHorizontal: 40,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'space-between',
        padding: 20
    },
    cardRight:{
        flexDirection: 'row',
        alignItems:'center',
        gap: 60
    },
    imgPqn:{
        height: 100,
        width: 100,
        marginRight: 0,
        borderRadius: 10
    },
    opName:{
        fontSize: 30,
        fontWeight: '500'
    },
    opAdd:{
        fontSize: 60,
        fontWeight: 'bold',
        color: "#A11613"
    },
    footer:{
        height: 200
    }
});