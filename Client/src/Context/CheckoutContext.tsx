import React, { createContext, useState, useContext, useCallback } from "react";

// ---- Types ----
interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface CheckoutFormData {
  id: number;
  user_email: string;
  state: string;
  city: string;
  address: string;
  phone_number: string;
  payment_method: "card" | "paypal";
  transaction_id?: string;
  card_last4?: string;
  status: string;
  order_date: string; // ✅ required
}

interface CheckoutContextType {
  formData: CheckoutFormData;
  items: OrderItem[];
  setFormData: (data: Partial<CheckoutFormData>) => void;
  setItems: (cartItems: OrderItem[]) => void;
  submitOrder: (data: Partial<CheckoutFormData>) => Promise<void>;
  fetchOrders: () => Promise<any[]>;
}

// ---- Context ----
const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

// ---- Provider ----
export const CheckoutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [formData, setFormDataState] = useState<CheckoutFormData>({
    id: 0,
    user_email: "",
    state: "",
    city: "",
    address: "",
    phone_number: "",
    payment_method: "card",
    order_date: new Date().toLocaleDateString(), // ✅ fixed
    status: "",
  });

  const [items, setItemsState] = useState<OrderItem[]>([]);

  const setFormData = useCallback( (data: Partial<CheckoutFormData>) => {
     setFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  const setItems = useCallback( (cartItems: OrderItem[]) => {
     setItemsState(cartItems);
  }, []);

  const submitOrder = useCallback(
    async (data: Partial<CheckoutFormData>) => {
      if (items.length === 0) {
        alert("No items in order!");
        return;
      }

      console.log(data);

      if (!data.user_email) {
        alert("Email  is required to place an order!");
        return;
      }

      // Verify transaction ID before submitting order
      if (data.payment_method === "card" || data.payment_method === "paypal") {
        if (!data.transaction_id) {
          alert("Transaction ID is required for payment!");
          return;
        }

        // In a real application, this would call a backend endpoint to verify the transaction ID
        // For now, we'll just log that verification would happen
        console.log("Verifying transaction ID:", data.transaction_id);

        // Simulate verification (in a real app, this would be an API call)
        try {
          // This is where you would implement real-time verification against the payment gateway
          // For example: await verifyTransactionId(formData.transaction_id, formData.payment_method);
          console.log("Transaction verification would happen here");
        } catch (error) {
          console.error("Transaction verification failed:", error);
          alert(
            "Transaction verification failed. Please check your transaction ID."
          );
          return;
        }
      }

      // Save guest email
      localStorage.setItem("guest_email", data.user_email);

      try {
        const res = await fetch("http://localhost:8000/order/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, items }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Backend response:", res.status, errorText);
          throw new Error("Order submission failed");
        }

        // ✅ Reset state with order_date included
        setFormDataState({
          id: 0,
          user_email: "",
          state: "",
          city: "",
          address: "",
          phone_number: "",
          payment_method: "card",
          order_date: new Date().toLocaleDateString(),
          status: "",
        });
        setItemsState([]);
      } catch (error) {
        console.error("Error submitting order:", error);
        alert("Something went wrong. Please try again.");
      }
    },
    [formData, items]
  );

  const fetchOrders = useCallback(async (): Promise<any[]> => {
    try {
      const email = localStorage.getItem("guest_email");
      if (!email) {
        alert("No email found. Please login or provide an email.");
        return [];
      }

      const res = await fetch(`http://localhost:8000/order/orders/${email}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend response:", res.status, errorText);
        throw new Error("Order fetch failed");
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        formData,
        items,
        setFormData,
        setItems,
        submitOrder,
        fetchOrders,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

// ---- Hook ----
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context)
    throw new Error("useCheckout must be used inside CheckoutProvider");
  return context;
};
