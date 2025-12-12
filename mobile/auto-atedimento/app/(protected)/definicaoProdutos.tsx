import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Switch, StatusBar } from 'react-native';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { RFPercentage } from 'react-native-responsive-fontsize';
import * as ScreenOrientation from 'expo-screen-orientation';

interface Produto {
  id: number;
  nome: string;
  preco: number;
  ativo: boolean;
  categoriaId: number;
}

export default function DefinicaoProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FORÇAR ORIENTAÇÃO HORIZONTAL ---
  useFocusEffect(
    useCallback(() => {
      const lockLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      };
      lockLandscape();

      return () => {
        // Ao voltar, força retrato novamente (ou default)
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const data = await api('/api/produtos', { auth: true }) as Produto[];
      // Ordena por nome
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setProdutos(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const toggleProduto = async (id: number, ativoAtual: boolean) => {
    try {
      // Otimista: atualiza a UI antes
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, ativo: !ativoAtual } : p));

      // Chama a API para persistir (PATCH no campo ativo)
      // Ajuste a rota conforme seu backend. Se for PUT completo, envie todo o objeto.
      // Supondo PATCH parcial:
      await api(`/api/produtos/${id}`, {
        method: 'PATCH',
        auth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativoAtual })
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao atualizar produto. Revertendo...');
      fetchProdutos(); // Reverte em caso de erro
    }
  };

  const renderItem = ({ item }: { item: Produto }) => (
    <View style={[styles.card, !item.ativo && styles.cardInactive]}>
      <View style={styles.infoContainer}>
        <Text style={[styles.productName, !item.ativo && styles.textInactive]}>{item.nome}</Text>
        <Text style={styles.productPrice}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={[styles.statusText, item.ativo ? styles.activeText : styles.inactiveText]}>
            {item.ativo ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
        </Text>
        <Switch
          trackColor={{ false: "#767577", true: "#28a745" }}
          thumbColor={item.ativo ? "#fff" : "#f4f3f4"}
          onValueChange={() => toggleProduto(item.id, item.ativo)}
          value={item.ativo}
          style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }} 
        />
      </View>
    </View>
  );

  return (
    <LinearGradient
        colors={['#7E0000', '#520000']}
        style={styles.container}
    >
      <StatusBar hidden />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color="white" />
            <Text style={styles.backText}>Voltar para Chapa</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Gerenciar Disponibilidade</Text>
        
        {/* Espaço vazio para equilibrar o header */}
        <View style={{ width: 100 }} /> 
      </View>

      <View style={styles.body}>
        {loading ? (
            <ActivityIndicator size="large" color="#F39D0A" />
        ) : (
            <FlatList
                data={produtos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                numColumns={2} // Grid de 2 colunas para aproveitar a tela horizontal
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(32, 16, 0, 0.6)',
    height: RFPercentage(12),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A11613',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 5
  },
  backText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#F39D0A',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body: {
    flex: 1,
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 20,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 100,
  },
  cardInactive: {
    backgroundColor: '#e0e0e0',
    opacity: 0.8,
  },
  infoContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  textInactive: {
    color: '#777',
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600'
  },
  switchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activeText: {
    color: '#28a745',
  },
  inactiveText: {
    color: '#A11613',
  },
});