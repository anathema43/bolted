import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthStore } from "./authStore";
import { businessLogicService } from "../services/businessLogicService";
import { sessionValidationService } from "../services/sessionValidationService";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      loading: false,
      error: null,
      unsubscribe: null,

      // Real-time cart synchronization
      subscribeToCart: () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;

        const { unsubscribe: currentUnsub } = get();
        if (currentUnsub) {
          currentUnsub();
        }

        const unsubscribe = onSnapshot(
          doc(db, "carts", currentUser.uid),
          (doc) => {
            if (doc.exists()) {
              const cartData = doc.data();
              set({ 
                cart: cartData.items || [], 
                loading: false,
                error: null 
              });
            } else {
              set({ cart: [], loading: false });
            }
          },
          (error) => {
            console.error("Error listening to cart changes:", error);
            set({ error: error.message, loading: false });
          }
        );

        set({ unsubscribe });
        return unsubscribe;
      },

      unsubscribeFromCart: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },
      unsubscribe: null,

      // Real-time cart synchronization
      subscribeToCart: () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;

        const { unsubscribe: currentUnsub } = get();
        if (currentUnsub) {
          currentUnsub();
        }

        const unsubscribe = onSnapshot(
          doc(db, "carts", currentUser.uid),
          (doc) => {
            if (doc.exists()) {
              const cartData = doc.data();
              set({ 
                cart: cartData.items || [], 
                loading: false,
                error: null 
              });
            } else {
              set({ cart: [], loading: false });
            }
          },
          (error) => {
            console.error("Error listening to cart changes:", error);
            set({ error: error.message, loading: false });
          }
        );

        set({ unsubscribe });
        return unsubscribe;
      },

      unsubscribeFromCart: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },
      unsubscribe: null,

      // Real-time cart synchronization
      subscribeToCart: () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;

        const { unsubscribe: currentUnsub } = get();
        if (currentUnsub) {
          currentUnsub();
        }

        const unsubscribe = onSnapshot(
          doc(db, "carts", currentUser.uid),
          (doc) => {
            if (doc.exists()) {
              const cartData = doc.data();
              set({ 
                cart: cartData.items || [], 
                loading: false,
                error: null 
              });
            } else {
              set({ cart: [], loading: false });
            }
          },
          (error) => {
            console.error("Error listening to cart changes:", error);
            set({ error: error.message, loading: false });
          }
        );

        set({ unsubscribe });
        return unsubscribe;
      },

      unsubscribeFromCart: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },

      loadCart: async () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;
        
        set({ loading: true });
        try {
          // Validate session before loading cart
          await sessionValidationService.validateActiveSession(currentUser.uid);
          
          const cartDoc = await getDoc(doc(db, "carts", currentUser.uid));
          if (cartDoc.exists()) {
            set({ cart: cartDoc.data().items || [], loading: false });
          } else {
            set({ loading: false });
          }
          
          // Start real-time subscription
          get().subscribeToCart();
          
          // Start real-time subscription
          get().subscribeToCart();
          
          // Start real-time subscription
          get().subscribeToCart();
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },


      addToCart: async (product, qty = 1) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;
        
        try {
          // Use business logic service for cart operations
          const updatedCart = await businessLogicService.addToCart(
            currentUser.uid, 
            product, 
            qty
          );
          
          set({ cart: updatedCart });
        } catch (error) {
          set({ error: error.message });
        }
      },

      // Legacy method for backward compatibility
      addToCartLocal: (product, qty = 1) => {
        set((state) => {
          const exists = state.cart.find((item) => item.id === product.id);
          let newCart;
          if (exists) {
            newCart = {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + qty }
                  : item
              ),
            };
          } else {
            newCart = { cart: [...state.cart, { ...product, quantity: qty }] };
          }
          
          return newCart;
        });
      },

      updateQuantity: async (id, qty) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;
        
        if (qty <= 0) {
          await get().removeFromCart(id);
          return;
        }
        
        try {
          const updatedCart = await businessLogicService.updateCartQuantity(
            currentUser.uid,
            id,
            qty
          );
          
          set({ cart: updatedCart });
        } catch (error) {
          set({ error: error.message });
        }
      },

      removeFromCart: async (id) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;
        
        try {
          const updatedCart = await businessLogicService.removeFromCart(
            currentUser.uid,
            id
          );
          
          set({ cart: updatedCart });
        } catch (error) {
          set({ error: error.message });
        }
      },

      clearCart: async () => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) return;
        
        try {
          await businessLogicService.clearCart(currentUser.uid);
          set({ cart: [] });
        } catch (error) {
          set({ error: error.message });
        }
      },

      getItemQuantity: (id) => {
        const item = get().cart.find((item) => item.id === id);
        return item ? item.quantity : 0;
      },

      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getSubtotal: () => {
        return get().getTotalPrice();
      },

      getTax: () => {
        return get().getTotalPrice() * 0.08; // 8% tax
      },

      getShipping: () => {
        const total = get().getTotalPrice();
        return total > 500 ? 0 : 50; // Free shipping over ₹500
      },

      getGrandTotal: () => {
        return get().getSubtotal() + get().getTax() + get().getShipping();
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "ramro-cart-storage",
    }
  )
);