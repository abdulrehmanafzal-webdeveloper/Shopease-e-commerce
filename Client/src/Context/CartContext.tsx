// src/Context/CartContext.tsx
import { createContext, useContext, useState, useCallback } from "react";
import { useAlert } from "./Alert_context";
import type { ReactNode } from "react";
import { getApiBaseUrl } from "../utils/api";

export interface CartItem {
  cart_product_id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image_url?: string;
  product_id: number;
  frequently_bought_with?: CartItem[];
  updatingQuantity?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  fetchCart: (sessionId?: string) => Promise<void>;
  addToCart: (productId: number, quantity?: number, sessionId?: string) => Promise<void>;
  removeFromCart: (productId: number, sessionId?: string) => Promise<void>;
  updateCart: (productId: number, quantity: number, sessionId?: string) => Promise<void>;
  clearCart: (sessionId?: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const API_BASE = getApiBaseUrl();
  const { showAlert } = useAlert();

  // ------------------ Fetch Cart ------------------
  const fetchCart = useCallback(async (sessionId?: string) => {
    try {
      const res = await fetch(`${API_BASE}/cart/getcart?session_id=${sessionId || ""}`, {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setCartItems(data.cart_items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, []);

  // ------------------ Add to Cart ------------------
  const addToCart = useCallback(async (productId: number, quantity: number = 1, sessionId?: string) => {
    try {
      const res = await fetch(`${API_BASE}/cart/addcart?session_id=${sessionId || ""}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      if (res.ok) await fetchCart(sessionId);
      else console.error("Add to cart failed:", await res.json());
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  }, [fetchCart]);

  // ------------------ Remove from Cart ------------------
  const removeFromCart = useCallback(async (productId: number, sessionId?: string) => {
    // Save removed item for undo
    const removedItem = cartItems.find((item) => item.product_id === productId);
    if (!removedItem) return;

    try {
      const res = await fetch(`${API_BASE}/cart/removecart/${productId}?session_id=${sessionId || ""}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        await fetchCart(sessionId);

        // Show Undo alert
        showAlert(`success`, `${removedItem.name} removed from cart.`, async () => {
          await addToCart(removedItem.product_id, removedItem.quantity, sessionId);
        });
      } else {
        console.error("Remove from cart failed:", await res.json());
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  }, [cartItems, fetchCart, showAlert, addToCart]);

  // ------------------ Update Cart Quantity ------------------
  const updateCart = useCallback(async (productId: number, quantity: number, sessionId?: string) => {
    const prevCart = [...cartItems];
    const targetItem = cartItems.find(item => item.product_id === productId);
    
    if (!targetItem) {
      showAlert("error", "Item not found in cart");
      return;
    }

    // Immediate optimistic update
    setCartItems((items) =>
      items.map((item) => 
        item.product_id === productId 
          ? { ...item, quantity, updatingQuantity: true } 
          : item
      )
    );

    try {
      const url = `${API_BASE}/cart/updatecart/${productId}?session_id=${sessionId || ''}&quantity=${quantity}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update cart");
      }

      // Update succeeded - remove updating flag
      setCartItems((items) =>
        items.map((item) =>
          item.product_id === productId
            ? { ...item, quantity, updatingQuantity: false }
            : item
        )
      );

      // Silent background refresh to ensure sync
      fetchCart(sessionId).catch(console.error);
    } catch (error) {
      console.error("Error updating cart:", error);
      setCartItems(prevCart); // rollback on error
      const errorMessage = error instanceof Error ? error.message : "Failed to update cart. Please try again.";
      showAlert("error", errorMessage);
    }
  }, [cartItems, showAlert, fetchCart]);

  // ------------------ Clear Cart ------------------
  const clearCart = useCallback(async (sessionId?: string) => {
    try {
      const res = await fetch(`${API_BASE}/cart/clearcart?session_id=${sessionId || ""}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) setCartItems([]);
      else console.error("Clear cart failed:", await res.json());
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, fetchCart, addToCart, removeFromCart, updateCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
