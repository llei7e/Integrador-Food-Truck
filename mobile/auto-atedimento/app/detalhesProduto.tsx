import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';

const images: any = {
  100: require('../assets/images/lanche1.png'),
  102: require('../assets/images/lanche2.png'),
  103: require('../assets/images/lanche3.jpg'),
  104: require('../assets/images/lanche4.png'),
  105: require('../assets/images/lanche5.png'), 
  106: require('../assets/images/lanche6.png'), 
  107: require('../assets/images/lanche7.png'), 
  108: require('../assets/images/lanche8.png'), 
  109: require('../assets/images/lanche9.png'), 

  200: require('../assets/images/combo.png'),
  201: require('../assets/images/combo.png'),
  202: require('../assets/images/combo.png'),

  300: require('../assets/images/bebidas.png'),
  301: require('../assets/images/bebidas.png'),
  303: require('../assets/images/bebidas.png'),
};

export default function DetalhesProduto() {
  const { id, name, price, description } = useLocalSearchParams();
  const image = images[id as string]; // converte o id em string p/ mapear

  const navigation = useNavigation();

   // Atualiza o título da página para o nome do item
    useEffect(() => {
        navigation.setOptions({ title: name });
    }, [name]);

  return (
    <View style={styles.containerFull}>
      <Image source={image as any} style={styles.image} />
      <View style={styles.logoPosition}>
        <Image source={require('../assets/images/Logo.png')} style={styles.logo}  />
      </View>
      <ScrollView>
        <View style={styles.containerInfos}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.containerAdd}>
            <Text style={styles.titleAdd} >Adicionais</Text>
            <Text style={styles.textAdd} >Escolha até 2 opções:</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    containerFull: { flex: 1 },
    image: { height: 450,  width: '100%'},
    name: { fontSize: 50, fontWeight: 'bold', marginTop: 20,},
    price: { fontSize: 35, color: '#A11613', marginTop: 10, fontWeight: '500' },
    logo: { height: 184, width: 166, justifyContent: 'center'},
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
        height: 100,
        backgroundColor: '#201000ff',
        justifyContent:'center',
        paddingHorizontal: 40,
        gap: 7
    },
    titleAdd:{
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold'
    },
    textAdd:{
        color: 'white',
        fontSize: 18,
        fontWeight: '100',
        fontStyle: 'italic'
    }
});
