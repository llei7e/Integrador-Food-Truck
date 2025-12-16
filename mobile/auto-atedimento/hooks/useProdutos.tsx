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
            const data = await api('/api/produtos', { auth: true }) as Produto[];
            
            data.sort((a, b) => {
                const catA = a.categoriaId ?? 0;
                const catB = b.categoriaId ?? 0;
                if (catA !== catB) return catA - catB;
                return (a.nome || "").localeCompare(b.nome || "");
            });
            
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

        setProdutos(prev => prev.map(p => 
            p.id === produtoId ? { ...p, ativo: novoStatus } : p
        ));
        
        try { 
            const payload = { ativo: novoStatus ? 1 : 0 }; 

            await api(`/api/produtos/${produtoId}/ativo`, {
                method: 'PATCH',
                auth: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) 
            });

        } catch (e) {
            console.error("Erro no toggleAtivo:", e);
            setProdutos(prev => prev.map(p => 
                p.id === produtoId ? { ...p, ativo: statusAtual } : p
            ));
            Alert.alert("Erro", "Falha ao atualizar status. Verifique sua conexão.");
        }
    }, []);

    return { produtos, loading, toggleAtivo, fetchProdutos };
}