import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api'; 
import { Alert } from 'react-native';

export interface Produto {
    id: number;
    nome: string;
    preco: number;
    ativo: boolean;
    categoriaId: number; 
    descricao: string;
}

export function useProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProdutos = useCallback(async () => {
        setLoading(true);
        try {
            // Busca todos os produtos (ativo e inativo)
            const data = await api('/api/produtos', { auth: true }) as Produto[];
            // Ordena por categoria e depois por nome
            data.sort((a, b) => a.categoriaId - b.categoriaId || a.nome.localeCompare(b.nome));
            setProdutos(data);
        } catch (e) {
            console.error("Erro ao buscar produtos:", e);
            Alert.alert("Erro", "Não foi possível carregar os produtos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProdutos();
    }, [fetchProdutos]);

    const toggleAtivo = useCallback(async (produtoId: number, statusAtual: boolean) => {
        const novoStatus = !statusAtual;

        // 1. Atualização Otimista (Muda na tela antes de confirmar no banco)
        setProdutos(prev => prev.map(p => 
            p.id === produtoId ? { ...p, ativo: novoStatus } : p
        ));
        
        try {
            // 2. Envia para o backend
            // OBS: Seu backend precisa ter um endpoint PATCH ou PUT para atualizar o produto
            // Exemplo: PATCH /api/produtos/{id} com body { "ativo": true/false }
            await api(`/api/produtos/${produtoId}`, {
                method: 'PATCH', // Ou PUT, dependendo do seu backend
                auth: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ativo: novoStatus })
            });

        } catch (e) {
            // 3. Se der erro, reverte a mudança na tela
            setProdutos(prev => prev.map(p => 
                p.id === produtoId ? { ...p, ativo: statusAtual } : p
            ));
            Alert.alert("Erro", "Falha ao atualizar status. Tente novamente.");
        }
    }, []);

    return { produtos, loading, toggleAtivo, fetchProdutos };
}