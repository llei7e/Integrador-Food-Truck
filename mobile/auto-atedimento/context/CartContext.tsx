import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  categoriaId: number; 
}

export interface CartItem {
  produto: Produto;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (produto: Produto, quantity: number) => void;
  updateQuantity: (produtoId: number, newQuantity: number) => void;
  removeFromCart: (produtoId: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const removeFromCart = useCallback((produtoId: number) => {
    setCartItems(currentItems => 
      currentItems.filter(item => item.produto.id !== produtoId)
    );
  }, []); 

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
  }, [removeFromCart]); 

  const addToCart = useCallback((produto: Produto, quantity: number) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.produto.id === produto.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        return currentItems.map(item =>
          item.produto.id === produto.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        return [...currentItems, { produto, quantity }];
      }
    });
  }, []); 

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []); 

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.produto.preco * item.quantity, 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);
 
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

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}