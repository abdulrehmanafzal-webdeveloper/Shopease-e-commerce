import { useCallback, useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckout } from "../Context/CheckoutContext";
import { useCart } from "../Context/CartContext";
import { CreditCard, Lock, Mail, MapPin, Phone, ShoppingCart, Truck, Wallet } from "lucide-react";
import { useAlert } from "../Context/Alert_context";
import { useAuth } from "../Context/AuthContext";

// ---- Types ----
interface CheckoutFormInputs {
  user_email: string;
  state: string;
  city: string;
  address: string;
  phone_number: string;
  payment_method: "card" | "paypal";
  transaction_id?: string;
  card_last4?: string;  
}

const states = {
  Punjab: ["Lahore", "Faisalabad", "Multan"],
  Sindh: ["Karachi", "Hyderabad", "Sukkur"],
  KPK: ["Peshawar", "Mardan", "Abbottabad"],
}

const Checkout: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const { setFormData, submitOrder, setItems  } = useCheckout();
   const { showAlert } = useAlert();
   const {isLogged}=useAuth()

  useEffect(() => {
    setItems(
      cartItems.map(ci => ({
        product_id: ci.product_id,
        product_name: ci.name,
        quantity: ci.quantity,
        price: ci.price,
      }))
    );
  }, [cartItems, setItems]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormInputs>();

  const selectedState = watch("state");
  const paymentMethod = watch("payment_method");

  const onSubmit = useCallback<SubmitHandler<CheckoutFormInputs>>(async (data) => {
    console.log(data);
    
    // setFormData(data);
    try {
      await submitOrder(data);
      showAlert(
        "success",
        `🎉 Order is successfully placed`
      );
      reset();
      if(isLogged){
        await clearCart()
      }else{
        clearCart(localStorage.getItem("session_id")||undefined)
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      // Log validation errors
      if (error instanceof Error) {
        console.error("Validation error details:", {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      }
      showAlert(
        "error",
        "Failed to place order. Please check your information and try again."
      );
    }
  }, [setFormData, submitOrder, clearCart, showAlert, reset]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);
  
  const shipping = useMemo(() => {
    return subtotal > 0 ? 200 : 0;
  }, [subtotal]);
  
  const total = useMemo(() => {
    return subtotal + shipping;
  }, [subtotal, shipping]);

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-4 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ---- Cart Summary ---- */}
      <motion.div
        className="bg-gradient-to-br from-white/95 to-indigo-50 backdrop-blur-md shadow-2xl rounded-2xl p-6 border border-indigo-100"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ShoppingCart className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Order Summary
          </h2>
        </motion.div>
        
        {cartItems.length === 0 ? (
          <motion.div 
            className="text-center py-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
            <p className="mt-4 text-gray-500">Your cart is empty</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <div className="max-h-[380px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100 scrollbar-thumb-rounded-full">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.cart_product_id}
                    className="flex items-center space-x-4 border-b border-indigo-100 pb-4 hover:bg-white/50 rounded-lg p-3 transition-all"
                    whileHover={{ 
                      y: -2,
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.1)"
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {item.image_url && (
                      <motion.div
                        className="relative overflow-hidden rounded-lg border border-gray-200"
                        whileHover={{ rotate: 1, scale: 1.05 }}
                      >
                        <motion.img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover"
                          whileHover={{ scale: 1.1 }}
                        />
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {item.quantity} × Rs.{item.price.toFixed(2)}
                        </motion.div>
                      </motion.div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-700 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 hidden sm:block">
                        {item.quantity} × Rs.{item.price.toFixed(2)}
                      </p>
                    </div>
                    <motion.p 
                      className="font-bold text-indigo-600 whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                    >
                      Rs.{(item.price * item.quantity).toFixed(2)}
                    </motion.p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              className="pt-4 space-y-3 border-t border-indigo-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="flex justify-between text-gray-600"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span>Subtotal</span>
                <span>Rs.{subtotal.toFixed(2)}</span>
              </motion.div>
              <motion.div 
                className="flex justify-between text-gray-600"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Shipping</span>
                </div>
                <span>Rs.{shipping.toFixed(2)}</span>
              </motion.div>
              <motion.div 
                className="flex justify-between font-bold text-xl text-gray-900 pt-2"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span>Total</span>
                <motion.span 
                  className="text-indigo-700"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  Rs.{total.toFixed(2)}
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* ---- Checkout Form ---- */}
      <motion.div
        className="bg-gradient-to-br from-white/95 to-indigo-50 shadow-2xl rounded-2xl p-6 sm:p-8 border border-indigo-100"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className="flex items-center gap-3 mb-6 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Wallet className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-extrabold text-center text-indigo-700 tracking-tight">
            Payment Information
          </h2>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className=" font-semibold text-gray-700 mb-2 ml-1 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-indigo-500" />
              Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition group">
              <input
                type="email"
                placeholder="example@email.com"
                {...register("user_email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="w-full px-2 py-3 outline-none bg-transparent placeholder-gray-400"
              />
              <motion.div
                className="h-5 w-0.5 bg-gray-300 mx-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              />
              <motion.span
                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Required
              </motion.span>
            </div>
            {errors.user_email && (
              <motion.p
                className="text-red-500 text-sm mt-1 ml-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.user_email.message}
              </motion.p>
            )}
          </motion.div>

          {/* State & City */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <motion.div 
              whileHover={{ scale: 1.01 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block font-semibold text-gray-700 mb-2 ml-1">State</label>
              <div className="relative">
                <select
                  {...register("state", { required: "State is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 appearance-none"
                >
                  <option value="">Select State</option>
                  {Object.keys(states).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.state && (
                <p className="text-red-500 text-sm mt-1 ml-1">
                  {errors.state.message}
                </p>
              )}
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <label className="block font-semibold text-gray-700 mb-2 ml-1">City</label>
              <div className="relative">
                <select
                  {...register("city", { required: "City is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 appearance-none disabled:opacity-50"
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {selectedState &&
                    states[selectedState as keyof typeof states].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1 ml-1">
                  {errors.city.message}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Address */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label className=" font-semibold text-gray-700 mb-2 ml-1 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
              Address
            </label>
            <div className="flex items-start border border-gray-300 rounded-xl px-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition">
              <textarea
                placeholder="123 Street, Apartment #, Landmark"
                {...register("address", {
                  required: "Address is required",
                  minLength: {
                    value: 10,
                    message: "Address must be at least 10 characters long"
                  },
                  validate: (value) => {
                    // Check if address contains at least one comma (street, city format)
                    if (!value.includes(',')) {
                      return "Please provide a complete address with street and city";
                    }
                    return true;
                  }
                })}
                className="w-full px-2 py-3 outline-none bg-transparent placeholder-gray-400 resize-none"
                rows={2}
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1 ml-1">
                {errors.address.message}
              </p>
            )}
          </motion.div>

          {/* Phone */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <label className=" font-semibold text-gray-700 mb-2 ml-1 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-indigo-500" />
              Phone
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition">
              <input
                type="tel"
                placeholder="+92 300 1234567"
                {...register("phone_number", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/, // E.164 format
                    message: "Invalid phone number format. Use +countrycode number"
                  },
                  minLength: {
                    value: 10,
                    message: "Phone number must be at least 10 digits"
                  }
                })}
                className="w-full px-2 py-3 outline-none bg-transparent placeholder-gray-400"
              />
            </div>
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1 ml-1">
                {errors.phone_number.message}
              </p>
            )}
          </motion.div>

          {/* Payment Method */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label className="block font-semibold text-gray-700 mb-2 ml-1">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.label 
                className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                  paymentMethod === "card" 
                    ? "ring-2 ring-indigo-500 bg-indigo-50 border-indigo-200" 
                    : "border-gray-300 hover:border-indigo-300"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium flex items-center gap-2 text-gray-700">
                  <CreditCard className="w-5 h-5" /> Card
                </span>
                <input
                  type="radio"
                  value="card"
                  {...register("payment_method", {
                    required: "Select a payment method",
                  })}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                />
              </motion.label>
              <motion.label 
                className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                  paymentMethod === "paypal" 
                    ? "ring-2 ring-indigo-500 bg-indigo-50 border-indigo-200" 
                    : "border-gray-300 hover:border-indigo-300"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium flex items-center gap-2 text-gray-700">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.2 18c-.3 0-.5 0-.6-.2l-3-7.9c0-.1-.1-.2-.1-.3V8.6c0-.3.2-.5.5-.6h2.6c.4 0 .7.3.7.7v1.5c0 .3.3.6.6.6h1.6c2.7 0 4.6-1.1 5.1-3.3.2-.7.2-1.4.1-2.1h-6c-.3 0-.6-.3-.6-.6V2.6c0-.3.3-.6.6-.6h8.2c.3 0 .5.2.5.5v1.6c0 .3-.2.5-.5.5h-2.1c.1.5.1.9.1 1.4 0 1.1-.2 2.2-.7 3.1-1.2 2.3-3.7 3.6-6.8 3.6h-1.3v1.2c0 .3-.3.6-.6.6h-1.5v1.5c0 .3-.3.6-.6.6h-.1zm-1.9-3.6l1.3 3.6v-3.6h-1.3z" fill="#0070ba"/>
                  </svg>
                  PayPal
                </span>
                <input
                  type="radio"
                  value="paypal"
                  {...register("payment_method", {
                    required: "Select a payment method",
                  })}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                />
              </motion.label>
            </div>
            {errors.payment_method && (
              <p className="text-red-500 text-sm mt-1 ml-1">
                {errors.payment_method.message}
              </p>
            )}
          </motion.div>

          {/* Conditional Payment Fields */}
          <AnimatePresence mode="wait">
            {paymentMethod === "card" && (
              <motion.div
                key="card-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block font-semibold text-gray-700 mb-2 ml-1">CVV</label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="•••"
                      {...register("card_last4", {
                        required: "CVV is required",
                        pattern: {
                          value: /^[0-9]{3,4}$/,
                          message: "CVV must be 3 or 4 digits"
                        }
                      })}
                      className="w-full px-2 py-3 outline-none bg-transparent"
                      maxLength={4}
                    />
                  </div>
                  {errors.card_last4 && (
                    <p className="text-red-500 text-sm mt-1 ml-1">
                      {errors.card_last4.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block font-semibold text-gray-700 mb-2 ml-1">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Transaction ID"
                    {...register("transaction_id", {
                      required: "Transaction ID is required",
                      pattern: {
                        value: /^[a-zA-Z0-9]{8,32}$/,
                        message: "Transaction ID must be 8-32 alphanumeric characters"
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  />
                  {errors.transaction_id && (
                    <p className="text-red-500 text-sm mt-1 ml-1">
                      {errors.transaction_id.message}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            )}

            {paymentMethod === "paypal" && (
              <motion.div
                key="paypal-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
                transition={{ duration: 0.3 }}
              >
                <label className="block font-semibold text-gray-700 mb-2 ml-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="PayPal Transaction ID"
                  {...register("transaction_id", {
                    required: "Transaction ID is required",
                    pattern: {
                      value: /^[a-zA-Z0-9]{8,32}$/,
                      message: "Transaction ID must be 8-32 alphanumeric characters"
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                />
                {errors.transaction_id && (
                  <p className="text-red-500 text-sm mt-1 ml-1">
                    {errors.transaction_id.message}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white rounded-xl shadow-xl font-bold tracking-wide text-lg group relative overflow-hidden"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.span 
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.6 }}
            />
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute bottom-0 left-0 h-0.5 bg-white"
              />
              Place Order 
              <motion.span 
                className="group-hover:translate-x-1 transition-transform"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🚀
              </motion.span>
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Checkout;