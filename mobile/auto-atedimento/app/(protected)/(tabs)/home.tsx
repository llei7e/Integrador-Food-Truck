import { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Text, 
  View,
  ActivityIndicator,
  ImageSourcePropType 
} from 'react-native';
import { useRouter } from 'expo-router';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { useAuth } from '../../../context/AuthContext';
import { api, ApiError } from '../../../lib/api'; 
import { useCart } from '../../../context/CartContext';

// Interface Produto
interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  categoriaId: number; // Importante!
}

// Interface Categoria (para nosso uso local)
interface Categoria {
    id: number;
    nome: string;
    imagem: ImageSourcePropType;
}

// Helpers de Imagem
const lancheImage = require('../../../assets/images/lanche1.jpg');
const comboImage = require('../../../assets/images/fritas.jpg');
const bebidaImage = require('../../../assets/images/bebida1.jpg');

// Imagens dos ícones das categorias
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

// Helper para pegar o ícone da categoria
const getIconForCategory = (categoriaId: number): ImageSourcePropType => {
    switch (categoriaId) {
      case 1: return iconLanche;
      case 2: return iconCombo;
      case 3: return iconBebida;
      default: return iconLanche;
    }
};

// Helper para mapear ID -> Nome (caso o backend não mande o objeto categoria completo)
const getCategoryName = (id: number) => {
    switch(id) {
        case 1: return "Lanches";
        case 2: return "Acompanhamentos"; // ou Combos, ajuste conforme seu banco
        case 3: return "Bebidas";
        default: return "Outros";
    }
}


export default function TabOneScreen() {
  // Estado para armazenar o ID da categoria selecionada (começa com 1 = Lanches)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  
  const [allProdutos, setAllProdutos] = useState<Produto[]>([]); 
  // Estado para as categorias disponíveis (extraídas dos produtos)
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<Categoria[]>([]);
  
  const [displayedItems, setDisplayedItems] = useState<Produto[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { signOut } = useAuth();
  const { addToCart, clearCart } = useCart();

  // 1. Busca Produtos e Extrai Categorias
  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: Produto[] = await api('/api/produtos', { auth: true });
        const produtosAtivos = data.filter(p => p.ativo);
        setAllProdutos(produtosAtivos);

        // Extrai categorias únicas dos produtos
        const catIds = Array.from(new Set(produtosAtivos.map(p => p.categoriaId))).sort();
        
        // Monta o objeto de categorias para exibir os botões
        const cats: Categoria[] = catIds.map(id => ({
            id: id,
            nome: getCategoryName(id),
            imagem: getIconForCategory(id)
        }));
        setCategoriasDisponiveis(cats);

      } catch (e: any) {
        console.error(e);
        setError('Não foi possível carregar os produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []); 

  const handleSignOut = () => {
    clearCart();
    signOut();
  };

  // 2. Filtra produtos quando a categoria selecionada muda
  useEffect(() => {
    if (allProdutos.length > 0) {
        const filtered = allProdutos.filter(
            produto => produto.categoriaId === selectedCategoryId
        );
        setDisplayedItems(filtered);
    }
  }, [selectedCategoryId, allProdutos]); 


  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#A11613" style={styles.centered} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (!loading && displayedItems.length === 0) {
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
          <Text style={{ color: 'white', fontWeight: 'bold' }}>SAIR</Text>
        </TouchableOpacity>
      </View>
      
      {/* --- CATEGORIAS DINÂMICAS --- */}
      <View style={styles.categoryButtons}>
        {categoriasDisponiveis.map((cat, index) => {
            // Define estilo baseado se é o do meio (index 1) ou pontas, ou simplifica para todos iguais
            // Aqui vou usar uma lógica simples: se for selecionado, muda cor
            const isSelected = selectedCategoryId === cat.id;
            
            // Ajuste de estilo para o botão do meio ser maior (opcional, igual ao seu layout original)
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

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

// --- ESTILOS ---
// (Seus estilos permanecem os mesmos)
const { width } = Dimensions.get('window');
const isMobile = width <= 768; 
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
    width: width * 0.27,
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
    width: width * 0.40,
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
    width: '65%',
    justifyContent: 'space-between',
    paddingHorizontal: RFValue(0), 
  },
  cardRight: {
    width: '35%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemName: {
    fontSize: isMobile ? RFValue(10) : RFValue(12),
    fontWeight: '400',
    marginVertical: RFValue(2),
    marginLeft: isMobile ? RFValue(0) : RFValue(5),
    marginRight: isMobile ? RFValue(0) : RFValue(3),
    flexShrink: 1, 
  },
  menuItemPrice: {
    fontSize: isMobile ? RFValue(11) : RFValue(13),
    color: '#aa6c00ff',
    marginBottom: RFValue(3),
    marginHorizontal: isMobile ? RFValue(0) : RFValue(5),
    position: 'absolute',
    right: 0,
    bottom: 0,
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
  logoutButton:{}
});