import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, User } from '../types';

interface StoreState {
  cart: CartItem[];
  user: User | null;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: [],
      user: null,
      isLoading: false,
      addToCart: (product: Product, quantity = 1) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            cart: [...state.cart, { ...product, quantity }],
          };
        }),
      removeFromCart: (productId: string) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),
      updateCartItemQuantity: (productId: string, quantity: number) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ cart: [] }),
      setUser: (user: User | null) => set({ user }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'soulprinting-store',
    }
  )
);

export default useStore; 