import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, Stack, router} from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import EvilIcons from '@expo/vector-icons/EvilIcons';

const adicionais = [
  { id: 1, nome: "Carne Fatiada", imagem: require('../assets/images/Carne.png') },
  { id: 2, nome: "Queijo", imagem: require('../assets/images/queijo.png') },
  { id: 3, nome: "Maionese", imagem: require('../assets/images/maio.jpg') },
  { id: 4, nome: "Bacon", imagem: require('../assets/images/bacon.jpg') }, // pode adicionar mais
];


const images: any = {
  100: require('../assets/images/lanche1.jpg'),
  102: require('../assets/images/lanche2.jpeg'),
  103: require('../assets/images/lanche3.jpg'),
  104: require('../assets/images/lanche4.jpg'),
  105: require('../assets/images/lanche5.jpg'), 
  106: require('../assets/images/lanche6.jpg'), 
  107: require('../assets/images/lanche7.jpg'), 
  108: require('../assets/images/lanche8.jpg'), 
  109: require('../assets/images/lanche9.jpg'), 

  200: require('../assets/images/combos.jpg'),
  201: require('../assets/images/combos.jpg'),
  202: require('../assets/images/combos.jpg'),

  300: require('../assets/images/bebida1.jpg'),
  301: require('../assets/images/bebida1.jpg'),
  303: require('../assets/images/bebida1.jpg'),
};

export default function DetalhesProduto() {
  const { id, name, price, description } = useLocalSearchParams();
  const image = images[id as string];

  const navigation = useNavigation();

   // Atualiza o título da página para o nome do item
    useEffect(() => {
        navigation.setOptions({ title: name });
    }, [name]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.containerFull}>
            <ScrollView>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back-circle-outline" size={70} color="white" />
                </TouchableOpacity>
                <Image source={image as any} style={styles.image} />
                <View style={styles.logoPosition}>
                    <Image source={require('../assets/images/Logo.png')} style={styles.logo}  />
                </View>

                <View style={styles.containerInfos}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.price}>{price}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>

                <View style={styles.containerAdd}>
                    <Text style={styles.titleAdd} >Adicionais</Text>
                    <Text style={styles.textAdd} >Escolha até 2 opções:</Text>
                </View>

                {adicionais.map((item) => (
                    <View key={item.id} style={styles.opcoesCard}>
                        <Text style={styles.opName}>{item.nome}</Text>
                        <View style={styles.cardRight}>
                            <Image source={item.imagem} style={styles.imgPqn} />
                            <TouchableOpacity style={styles.addProduct}>
                                <Text style={styles.opAdd}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.footer}></View>
            </ScrollView>
            <View style={styles.containerCartButtons}>
                <View style={styles.quantityButton}>
                    <TouchableOpacity style={styles.addProduct1}>
                        <EvilIcons name="trash" size={60} color="black" />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>1</Text> {/* Adicionar contador posteriormente*/}

                    <TouchableOpacity style={styles.addProduct}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addCartButton}>
                    <Text style={styles.addCartText}>Adicionar ao Carrinho</Text>
                </TouchableOpacity>
            </View>
        </View>
    </>
  );
}

const styles = StyleSheet.create({
    containerFull: { flex: 1, backgroundColor: 'white' },
    image: { height: 450,  width: '100%'},
    name: { fontSize: 50, fontWeight: 'bold', marginTop: 20,},
    price: { fontSize: 35, color: '#A11613', marginTop: 10, fontWeight: '500' },
    logo: { height: 184, width: 166, justifyContent: 'center'},
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
        fontSize: 22,
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
