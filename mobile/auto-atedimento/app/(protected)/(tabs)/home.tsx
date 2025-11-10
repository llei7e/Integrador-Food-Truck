// app/(protected)/(tabs)/home.tsx
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Text, 
  View,
  ActivityIndicator,
  ImageSourcePropType // Importa o tipo de imagem
} from 'react-native';
import { useRouter } from 'expo-router';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { useAuth } from '../../../context/AuthContext';
import { api, ApiError } from '../../../lib/api'; 

// --- Interface para o produto vindo da API ---
interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  categoriaId: number; 
}

// --- Imagens por Categoria (ALTERAÇÃO 1) ---
const lancheImage = require('../../../assets/images/lanche1.jpg');
const comboImage = require('../../../assets/images/combos.jpg');
const bebidaImage = require('../../../assets/images/bebida1.jpg');

// --- Função Helper para formatar preço ---
const formatPrice = (price: number): string => {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
};

// --- Função Helper para selecionar a imagem (ALTERAÇÃO 2) ---
const getImageForItem = (categoriaId: number): ImageSourcePropType => {
  switch (categoriaId) {
    case 1:
      return lancheImage;
    case 2:
      return comboImage;
    case 3:
      return bebidaImage;
    default:
      return lancheImage; // Padrão
  }
};


export default function TabOneScreen() {
  const [categoria, setCategoria] = useState<'lanches' | 'combos' | 'bebidas'>('lanches');
  
  // --- Estados para dados da API ---
  const [allProdutos, setAllProdutos] = useState<Produto[]>([]); // Guarda TODOS os produtos
  const [displayedItems, setDisplayedItems] = useState<Produto[]>([]); // Guarda os produtos filtrados
  
  const [loading, setLoading] = useState(true); // Começa true para a busca inicial
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { signOut } = useAuth();

  // --- Hook para BUSCAR dados da API (roda UMA VEZ) ---
  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usa a função 'api' com autenticação para buscar TUDO
        const data: Produto[] = await api('/api/produtos', { auth: true });
        setAllProdutos(data.filter(p => p.ativo)); 
      } catch (e: any) {
        console.error(e);
        if (e instanceof ApiError) {
          setError(`Erro ${e.status}: ${e.message}`);
        } else {
          setError('Não foi possível carregar os produtos.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []); // Array vazio: roda apenas na montagem do componente

  // --- Hook para FILTRAR os produtos (roda quando a categoria ou os produtos mudam) ---
  useEffect(() => {
    let categoryIdToFilter: number;
    
    if (categoria === 'lanches') {
      categoryIdToFilter = 1;
    } else if (categoria === 'combos') {
      categoryIdToFilter = 2;
    } else { // 'bebidas'
      categoryIdToFilter = 3;
    }

    // Filtra a lista principal baseado no ID da categoria
    const filtered = allProdutos.filter(
      produto => produto.categoriaId === categoryIdToFilter 
    );
    
    setDisplayedItems(filtered);

  }, [categoria, allProdutos]); // Depende da 'categoria' e de 'allProdutos'

  // --- Função para renderizar o conteúdo (Loading, Erro, Lista ou Vazio) ---
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#A11613" style={styles.centered} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    // Só mostra "Nenhum item" se não estiver carregando e a lista estiver vazia
    if (!loading && displayedItems.length === 0) {
      return <Text style={styles.emptyText}>Nenhum item encontrado para esta categoria.</Text>;
    }

    // Renderiza a lista de itens filtrados
    return (
      <View style={styles.itemsContainer}>
        {displayedItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem1}
            onPress={() => router.push({
              pathname: "/detalhesProduto", 
              params: { 
                id: String(item.id),
                name: item.nome,
                price: formatPrice(item.preco),
                description: item.descricao,
              },
            })}
          >
            <View style={styles.menuItem}>
              
              {/* --- (ALTERAÇÃO 3) --- */}
              <Image 
                source={getImageForItem(item.categoriaId)} 
                style={styles.menuItemImage} 
              />
              
              <View style={styles.cardTextContainer}>
                <View style={styles.cardLeft}>
                  <Text style={styles.menuItemName}>{item.nome}</Text>
                  <Text style={styles.menuItemPrice}>{formatPrice(item.preco)}</Text>
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
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../../assets/images/Logo.png')} style={styles.logo} />
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
        {renderContent()}
      </ScrollView>
    </View>
  );
}

// --- ESTILOS ---
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
    flexGrow: 1, 
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
    height: isMobile ? RFPercentage(20) : RFPercentage(25),
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
    width: '65%', // (Estilo da sua última versão)
    justifyContent: 'space-between', // (Estilo da sua última versão)
    paddingHorizontal: RFValue(0), // (Estilo da sua última versão)
  },

  cardRight: {
    width: '35%', // (Estilo da sua última versão)
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuItemName: {
    fontSize: isMobile ? RFValue(10) : RFValue(14), // (Estilo da sua última versão)
    fontWeight: '400', // (Estilo da sua última versão)
    marginVertical: RFValue(2),
    marginLeft: isMobile ? RFValue(0) : RFValue(5),
    marginRight: isMobile ? RFValue(0) : RFValue(3),
    flexShrink: 1, 
  },

  menuItemPrice: {
    fontSize: isMobile ? RFValue(11) : RFValue(13), // (Estilo da sua última versão)
    color: '#aa6c00ff', // (Estilo da sua última versão)
    marginBottom: RFValue(3),
    marginHorizontal: isMobile ? RFValue(0) : RFValue(5),
    position: 'absolute', // (Estilo da sua última versão)
    right: 0, // (Estilo da sua última versão)
    bottom: 0, // (Estilo da sua última versão)
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

  centered: {
    marginTop: RFValue(50),
  },
  errorText: {
    textAlign: 'center',
    color: '#A11613',
    fontSize: RFValue(14),
    marginTop: RFValue(50),
    paddingHorizontal: RFValue(20),
  },
  emptyText: {
    textAlign: 'center',
    color: '#555',
    fontSize: RFValue(14),
    marginTop: RFValue(50),
    paddingHorizontal: RFValue(20),
  },
});