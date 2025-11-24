// context/CartContext.tsx
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// Define a interface do Produto (baseado no seu home.tsx)
interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  categoriaId: number; 
}

// Define o item do carrinho, que inclui o produto e a quantidade
export interface CartItem {
  produto: Produto;
  quantity: number;
}

// Define o que o contexto irá fornecer
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (produto: Produto, quantity: number) => void;
  updateQuantity: (produtoId: number, newQuantity: number) => void;
  removeFromCart: (produtoId: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

// Cria o Contexto
const CartContext = createContext<CartContextType | null>(null);

// Cria o Provedor
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // --- FUNÇÕES MEMOIZADAS COM useCallback ---

  const removeFromCart = useCallback((produtoId: number) => {
    // Usa a forma funcional do setState para evitar dependência de 'cartItems'
    setCartItems(currentItems => 
      currentItems.filter(item => item.produto.id !== produtoId)
    );
  }, []); // Dependência vazia, função estável

  const updateQuantity = useCallback((produtoId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(produtoId);
    } else {
      setCartItems(currentItems => 
        currentItems.map(item =>
          item.produto.id === produtoId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  }, [removeFromCart]); // Depende do 'removeFromCart' (que é estável)

  const addToCart = useCallback((produto: Produto, quantity: number) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.produto.id === produto.id);

      if (existingItem) {
        // Se já existe, atualiza a quantidade
        const newQuantity = existingItem.quantity + quantity;
        return currentItems.map(item =>
          item.produto.id === produto.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        // Se não existe, adiciona como novo item
        return [...currentItems, { produto, quantity }];
      }
    });
  }, []); // Dependência vazia, função estável

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []); // Dependência vazia, função estável

  // --- CÁLCULOS MEMOIZADOS com useMemo ---

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.produto.preco * item.quantity, 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // --- OBJETO DE VALOR MEMOIZADO com useMemo ---
  // Isso garante que o objeto de contexto só mude quando os dados mudarem
  const value = useMemo(() => ({
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    itemCount,
  }), [cartItems, total, itemCount, addToCart, updateQuantity, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook customizado para facilitar o uso do contexto
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}