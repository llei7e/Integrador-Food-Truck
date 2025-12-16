import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, ImageSourcePropType, Alert, Dimensions } from 'react-native';
import { api } from '../../lib/api'; 
import { router, useFocusEffect } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');
const realWidth = width > height ? width : height;
const guidelineBaseWidth = 1366; 
const scale = (size: number) => (realWidth / guidelineBaseWidth) * size;

interface Produto {
  id: number;
  nome: string;
  preco: number;
  ativo: number; 
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
    const valorReal = price > 100 ? price / 100 : price; 
    return `R$ ${valorReal.toFixed(2).replace('.', ',')}`;
};

export default function DefinicaoProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const lockLandscape = async () => {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            };
            lockLandscape();

        }, [])
    );

    const fetchProdutos = async () => {
        try {
            setLoading(true);
            const data = await api('/api/produtos', { auth: true }) as Produto[];
            data.sort((a, b) => a.id - b.id);
            setProdutos(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar o estoque.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    const toggleAtivo = async (id: number, statusAtual: number | string) => {
        const statusNumerico = Number(statusAtual);
        const novoStatus = statusNumerico === 1 ? 0 : 1;

        try {
            setProdutos(prev => prev.map(p => 
                p.id === id ? { ...p, ativo: novoStatus } : p
            ));

            await api(`/api/produtos/${id}/status`, {
                method: 'PATCH',
                auth: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ativo: novoStatus })
            });

        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao atualizar status.');
            fetchProdutos(); 
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F39D0A" />
                <Text style={styles.loadingText}>Carregando estoque...</Text>
            </View>
        );
    }

    const renderProdutoCard = (produto: Produto) => {
        const isAtivo = Number(produto.ativo) === 1;
        
        return (
            <TouchableOpacity 
                key={produto.id} 
                style={[styles.card, !isAtivo && styles.cardInativo]}
                onPress={() => toggleAtivo(produto.id, produto.ativo)}
                activeOpacity={0.8}
            >
                <Image 
                    source={getImageForItem(produto.categoriaId)} 
                    style={[styles.cardImage, !isAtivo && { opacity: 0.4 }]} 
                />
                
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, !isAtivo && { color: '#666' }]} numberOfLines={1}>
                        {produto.nome}
                    </Text>
                    
                    <View style={styles.rowPriceStatus}>
                        <Text style={[styles.cardPrice, !isAtivo && { color: '#888' }]}>
                            {formatPrice(produto.preco)}
                        </Text>
                        
                        {/* Badge de Status */}
                        <View style={[
                            styles.statusBadge, 
                            { backgroundColor: isAtivo ? "#28a745" : "#555" }
                        ]}>
                            <Ionicons 
                                name={isAtivo ? "eye" : "eye-off"} 
                                size={scale(12)} 
                                color="white" 
                                style={{marginRight: scale(4)}} 
                            />
                            <Text style={styles.statusText}>
                                {isAtivo ? "ATIVO" : "INATIVO"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Overlay de Inativo */}
                {!isAtivo && (
                    <View style={styles.inactiveOverlay}>
                        {/* Ajuste no tamanho do ícone com scale */}
                        <Ionicons name="lock-closed" size={scale(40)} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.inactiveText}>INDISPONÍVEL</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>Gerenciar Produtos</Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={() => router.replace('/(protected)/telaChapeiro')}
                >
                    {/* Ajuste no tamanho do ícone com scale */}
                    <Ionicons name="arrow-back" size={scale(30)} color="black" />
                    <Text style={styles.navButtonText}>Fila de Pedidos</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.helperText}>
                    Toque em um produto para ocultá-lo do cardápio dos clientes.
                </Text>
                <View style={styles.grid}>
                    {produtos.map(renderProdutoCard)}
                </View>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#201000' },
    loadingText: { color: 'white', marginTop: scale(10), fontSize: scale(16) },
    header: {
        height: scale(100), 
        backgroundColor: '#201000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(20),
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: scale(15) },
    headerTitle: { fontSize: scale(32), fontWeight: 'bold', color: 'white' },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F39D0A',
        paddingVertical: scale(8),
        paddingHorizontal: scale(15),
        borderRadius: scale(8),
        gap: scale(8),
        position: 'absolute',
        left: scale(20),
        
    },
    navButtonText: { fontSize: scale(20), fontWeight: '500', color: 'black' },
    scrollContent: { padding: scale(15), paddingBottom: scale(50) },
    helperText: { textAlign: 'center', color: '#666', marginBottom: scale(20), fontStyle: 'italic', fontSize: scale(16) },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%', 
        backgroundColor: 'white',
        borderRadius: scale(15),
        marginBottom: scale(15),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.15,
        shadowRadius: scale(4),
        elevation: 4,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardInativo: {
        backgroundColor: '#e0e0e0',
        borderColor: '#999',
        borderStyle: 'dashed',
    },
    cardImage: {
        width: '100%',
        height: scale(130), 
        resizeMode: 'cover',
    },
    cardContent: {
        padding: scale(12),
    },
    cardTitle: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#201000',
        marginBottom: scale(6),
    },
    rowPriceStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardPrice: {
        fontSize: scale(15),
        color: '#A11613',
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scale(4),
        paddingHorizontal: scale(8),
        borderRadius: scale(8),
    },
    statusText: {
        color: 'white',
        fontSize: scale(10),
        fontWeight: 'bold',
    },
    inactiveOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    inactiveText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: scale(14),
        marginTop: scale(5),
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 5
    }
});