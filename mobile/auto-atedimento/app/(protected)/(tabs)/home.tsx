import { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Text, 
  View,
  ActivityIndicator,
  ImageSourcePropType,
  RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { api, ApiError } from '../../../lib/api'; 
import { useCart } from '../../../context/CartContext';

// --- LÓGICA DE ESCALA MATEMÁTICA (VERTICAL) ---
const { width, height } = Dimensions.get('window');
// Garante que pegamos a menor dimensão (largura em modo retrato)
const realWidth = width < height ? width : height; 
// 768px é a largura base de um iPad/Tablet padrão em Retrato.
const guidelineBaseWidth = 768; 
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;
// -------------------------------------

// Interface Produto
interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  categoriaId: number; 
}

// Interface Categoria
interface Categoria {
    id: number;
    nome: string;
    imagem: ImageSourcePropType;
}

// Helpers de Imagem
const lancheImage = require('../../../assets/images/lanche1.jpg');
const comboImage = require('../../../assets/images/fritas.jpg');
const bebidaImage = require('../../../assets/images/bebida1.jpg');

const iconLanche = require('../../../assets/images/lanche.png');
const iconCombo = require('../../../assets/images/fritas.png');
const iconBebida = require('../../../assets/images/bebidas.png');

const formatPrice = (price: number): string => {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
};

const getImageForItem = (categoriaId: number): ImageSourcePropType => {
  switch (categoriaId) {
    case 1: return lancheImage;
    case 2: return comboImage;
    case 3: return bebidaImage;
    default: return lancheImage;
  }
};

const getIconForCategory = (categoriaId: number): ImageSourcePropType => {
    switch (categoriaId) {
      case 1: return iconLanche;
      case 2: return iconCombo;
      case 3: return iconBebida;
      default: return iconLanche;
    }
};

const getCategoryName = (id: number) => {
    switch(id) {
        case 1: return "Lanches";
        case 2: return "Acompanhamentos"; 
        case 3: return "Bebidas";
        default: return "Outros";
    }
}

export default function TabOneScreen() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [allProdutos, setAllProdutos] = useState<Produto[]>([]); 
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<Categoria[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Produto[]>([]); 
  
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { signOut } = useAuth();
  const { addToCart, clearCart } = useCart();

  // --- BUSCA DE DADOS INTELIGENTE ---
  const fetchAllItems = useCallback(async (isBackground = false) => {
    if (!isBackground && !refreshing) {
        setLoading(true);
    }
    
    if (!isBackground) setError(null);

    try {
      const data: Produto[] = await api('/api/produtos', { auth: true });
      const produtosAtivos = data.filter(p => p.ativo);
      
      setAllProdutos(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(produtosAtivos)) {
              return produtosAtivos;
          }
          return prev;
      });

      const catIds = Array.from(new Set(produtosAtivos.map(p => p.categoriaId))).sort();
      const cats: Categoria[] = catIds.map(id => ({
          id: id,
          nome: getCategoryName(id),
          imagem: getIconForCategory(id)
      }));
      
      setCategoriasDisponiveis(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(cats)) {
              return cats;
          }
          return prev;
      });

    } catch (e: any) {
      console.error(e);
      if (!isBackground) {
          if (e instanceof ApiError) {
            setError(`Erro ${e.status}: ${e.message}`);
          } else {
            setError('Não foi possível carregar os produtos.');
          }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchAllItems(false);
    const interval = setInterval(() => fetchAllItems(true), 5000);
    return () => clearInterval(interval);
  }, [fetchAllItems]);


  const handleSignOut = () => {
    clearCart();
    signOut();
  };

  useEffect(() => {
    if (allProdutos.length > 0) {
        const filtered = allProdutos.filter(
            produto => produto.categoriaId === selectedCategoryId
        );
        setDisplayedItems(filtered);
    }
  }, [selectedCategoryId, allProdutos]); 

  useEffect(() => {
      if (categoriasDisponiveis.length > 0) {
          const existe = categoriasDisponiveis.find(c => c.id === selectedCategoryId);
          if (!existe) {
              setSelectedCategoryId(categoriasDisponiveis[0].id);
          }
      }
  }, [categoriasDisponiveis]);


  const renderContent = () => {
    if (loading && !refreshing && allProdutos.length === 0) {
      return <ActivityIndicator size="large" color="#A11613" style={styles.centered} />;
    }

    if (error && allProdutos.length === 0) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (!loading && displayedItems.length === 0 && allProdutos.length > 0) {
      return <Text style={styles.emptyText}>Nenhum item encontrado para esta categoria.</Text>;
    }

    return (
      <View style={styles.itemsContainer}>
        {displayedItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem1}
            onPress={() => router.push({
              pathname: "/detalhesProduto", 
              params: { item: JSON.stringify(item) },
            })}
          >
            <View style={styles.menuItem}>
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
                  <TouchableOpacity 
                    style={styles.addProduct}
                    onPress={(e) => {
                      e.stopPropagation(); 
                      addToCart(item, 1);  
                    }}
                  >
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
          onPress={handleSignOut} 
          style={styles.logoutButton}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: scale(14) }}>SAIR</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoryButtons}>
        {categoriasDisponiveis.map((cat, index) => {
            const isSelected = selectedCategoryId === cat.id;
            const isMiddle = index === 1; 
            const buttonStyle = isMiddle ? styles.categoryButtonMiddle : styles.categoryButton;

            return (
                <TouchableOpacity 
                    key={cat.id}
                    style={[buttonStyle, isSelected && { backgroundColor: '#F39D0A' }]} 
                    onPress={() => setSelectedCategoryId(cat.id)}
                >
                    <Image source={cat.imagem} style={styles.img} />
                    <Text style={styles.categoryText}>{cat.nome}</Text>
                </TouchableOpacity>
            );
        })}
      </View>

      <ScrollView 
        contentContainerStyle={styles.menuContainer}
        refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => {
                    setRefreshing(true);
                    fetchAllItems(false);
                }}
                tintColor="#A11613"
            />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

// --- ESTILOS ADAPTADOS PARA SCALE (Vertical) ---
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#201000ff",
    height: "25%", // Mantido % para preencher o topo proporcionalmente
  },
  logo: {
    height: "70%",
    aspectRatio: 1,
  },
  logoutButton: {
    backgroundColor: '#A11613', 
    paddingVertical: scale(10), 
    paddingHorizontal: scale(15), 
    alignItems: 'center', 
    position: 'absolute', 
    top: scale(30), 
    right: scale(20),
    borderRadius: scale(10),
  },
  categoryText: {
    fontSize: scale(20),
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
    alignItems: 'flex-start', // Garante alinhamento topo
  },
  categoryButton: {
    backgroundColor: '#A11613',
    width: '27%', // % garante que caibam 3 na largura
    height: scale(50),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
    elevation: 3,
  },
  categoryButtonMiddle: {
    backgroundColor: '#A11613',
    width: '40%', // Meio maior
    height: scale(60),
    paddingHorizontal: scale(5),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: scale(8),
    gap: scale(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
    elevation: 3,
  },
  img: {
    marginTop: -scale(45), // Puxa a imagem pra cima do botão
    width: scale(36),
    height: scale(40),
    resizeMode: 'contain',
  },
  menuContainer: { 
    padding: scale(10),
    flexGrow: 1, 
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem1: {
    width: '32.5%', // 3 colunas com espaçamento
    marginBottom: scale(15),
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    overflow: 'hidden',
    height: scale(220), // Altura fixa proporcional
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.2,
    shadowRadius: scale(4),
    elevation: 5,
  },
  menuItemImage: {
    width: '100%',
    height: '70%', // Ocupa 60% do card
    resizeMode: 'cover',
  },
  cardTextContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '30%',
  },
  cardLeft: {
    width: '65%',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10), 
    paddingVertical: scale(5), 
  },
  cardRight: {
    width: '35%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemName: {
    fontSize: scale(13),
    fontWeight: 'bold', // Aumentei peso para legibilidade
    color: '#333',
    flexShrink: 1, 
  },
  menuItemPrice: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#aa6c00ff',
  },
  addProduct: {
    height: '100%',
    width: "100%",
    backgroundColor: "#A11613",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: scale(20), // Match card radius
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: -3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: "#FFFFFF",
    textAlign: 'center',
  },
  centered: {
    marginTop: scale(50),
  },
  errorText: {
    textAlign: 'center',
    color: '#A11613',
    fontSize: scale(14),
    marginTop: scale(50),
    paddingHorizontal: scale(20),
  },
  emptyText: {
    textAlign: 'center',
    color: '#555',
    fontSize: scale(14),
    marginTop: scale(50),
    paddingHorizontal: scale(20),
  },
});