import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { useProdutos, Produto } from '../../hooks/useProdutos'; // Importe seu hook

// --- Helpers Visuais (Mesma lógica da Home para manter padrão) ---
const lancheImage = require('../../assets/images/lanche1.jpg');
const comboImage = require('../../assets/images/combos.jpg');
const bebidaImage = require('../../assets/images/bebida1.jpg');

const getImageForItem = (categoriaId: number): ImageSourcePropType => {
  switch (categoriaId) {
    case 1: return lancheImage; // Lanches
    case 2: return comboImage;  // Combos
    case 3: return bebidaImage; // Bebidas
    default: return lancheImage;
  }
};

const formatPrice = (price: number): string => {
    // OBS: Se seu banco salva em centavos (ex: 2000), divida por 100 aqui.
    // Se já salva em reais (ex: 20.00), mantenha como está.
    const valorReal = price > 100 ? price / 100 : price; 
    return `R$ ${valorReal.toFixed(2).replace('.', ',')}`;
};

export default function definicaoProdutos() {
    const { produtos, loading, toggleAtivo } = useProdutos();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F39D0A" />
                <Text style={styles.loadingText}>Carregando estoque...</Text>
            </View>
        );
    }

    const renderProdutoCard = (produto: Produto) => {
        const isAtivo = produto.ativo;
        
        return (
            <TouchableOpacity 
                key={produto.id} 
                // Aplica estilo "cardInativo" se não estiver ativo
                style={[styles.card, !isAtivo && styles.cardInativo]}
                onPress={() => toggleAtivo(produto.id, isAtivo)}
                activeOpacity={0.8}
            >
                {/* Imagem com opacidade reduzida se inativo */}
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
                                size={12} 
                                color="white" 
                                style={{marginRight: 4}} 
                            />
                            <Text style={styles.statusText}>
                                {isAtivo ? "ATIVO" : "INATIVO"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Ícone grande de bloqueio sobreposto se inativo */}
                {!isAtivo && (
                    <View style={styles.inactiveOverlay}>
                        <Ionicons name="lock-closed" size={40} color="rgba(255,255,255,0.8)" />
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
                
                {/* Botão Vice-Versa (Ir para Pedidos) */}
                <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={() => router.replace('/(protected)/telaChapeiro')}
                >
                    <Ionicons name="arrow-back" size={30} color="black" />
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
    loadingText: { color: 'white', marginTop: 10, fontSize: 16 },
    
    // Header
    header: {
        height: RFPercentage(12),
        backgroundColor: '#201000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 15,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    backButton: { padding: 0 },
    headerTitle: { fontSize: RFPercentage(4), fontWeight: 'bold', color: 'white' },
    
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F39D0A',
        paddingVertical: 8,
        paddingHorizontal: RFPercentage(1.5),
        borderRadius: RFPercentage(1),
        gap: RFPercentage(1),
        position: 'absolute',
        left: RFPercentage(2),
        bottom: RFPercentage(1),
    },
    navButtonText: { fontSize: 25, fontWeight: '500', color: 'black' },

    // Content
    scrollContent: { padding: 15, paddingBottom: 50 },
    helperText: { textAlign: 'center', color: '#666', marginBottom: 20, fontStyle: 'italic' },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    // Card
    card: {
        width: '48%', // 2 colunas
        backgroundColor: 'white',
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardInativo: {
        backgroundColor: '#e0e0e0', // Fundo cinza
        borderColor: '#999',
        borderStyle: 'dashed',
    },
    cardImage: {
        width: '100%',
        height: 130,
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#201000',
        marginBottom: 6,
    },
    rowPriceStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardPrice: {
        fontSize: 15,
        color: '#A11613',
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    inactiveOverlay: {
        ...StyleSheet.absoluteFillObject, // Cobre o card todo
        backgroundColor: 'rgba(0,0,0,0.05)', // Levemente escuro
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    inactiveText: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 5
    }
});