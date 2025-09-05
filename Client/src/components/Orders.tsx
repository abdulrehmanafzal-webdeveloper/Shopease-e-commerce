// src/components/Orders.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCheckout } from "../Context/CheckoutContext";
import {
  FaBox,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaCalendarAlt,
  FaTruck,
  FaShoppingBag,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
} from "react-icons/fa";

import { getApiBaseUrl } from "../utils/api";

interface Order {
  id: number;
  user_email: string;
  state: string;
  city: string;
  address: string;
  phone_number: string;
  payment_method: string;
  order_date: string;
  status: string;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }[];
}

// Helper function to generate random delivery date
const getRandomDeliveryDate = () => {
  const days = Math.floor(Math.random() * 7) + 1;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString();
};

export default function Orders() {
  const { fetchOrders } = useCheckout();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [hasOrdersWithZeroItems, setHasOrdersWithZeroItems] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);

      try {
        const email = localStorage.getItem("guest_email");

        if (email) {
          const data = await fetchOrders();

          // Check if there are orders with zero items
          const hasEmptyOrders = data.some((order) => order.items.length === 0);
          setHasOrdersWithZeroItems(hasEmptyOrders && data.length > 0);

          // Filter out orders with zero items - we only want to display orders that have at least one item
          const ordersWithItems = data.filter(
            (order) => order.items.length > 0
          );
          setOrders(ordersWithItems);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl animate-pulse">
            <div className="w-8 h-8 bg-white/30 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0.5, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: item * 0.1,
                duration: 0.5,
              }}
              className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              {/* Header placeholder */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center text-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/50"
                    >
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content placeholder */}
              <div className="p-4 sm:p-5">
                <div className="mb-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>

                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>

                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-2">
                      {/* Image placeholder - larger size now */}
                      <div className="min-w-[4rem] w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer placeholder */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto px-4"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-full mb-6"
        >
          <FaBox className="text-5xl text-indigo-500 mx-auto" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          No Orders Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          {hasOrdersWithZeroItems
            ? "You have orders in the system, but none contain any items."
            : "It looks like you haven't placed any orders yet. Start shopping to see your orders here!"}
        </p>
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)",
          }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Start Shopping
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl"
          >
            <FaShoppingBag className="text-2xl text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Your Orders
          </h1>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <FaBox className="text-indigo-500" />
          <span>
            {orders.length} order{orders.length > 1 ? "s" : ""} with items
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order, idx) => {
          const deliveryDate = getRandomDeliveryDate();
          const total = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const isExpanded = expandedOrder === order.id;

          // Show first 2 items in preview, only show remaining items in expanded view
          const previewItems = order.items.slice(0, 2);
          const remainingItems = order.items.slice(2);
          const hasMoreItems = order.items.length > 2;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: idx * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 120,
              }}
              whileHover={{
                y: -5,
                boxShadow:
                  "0 15px 30px rgba(0, 0, 0, 0.08), 0 0 0 2px rgba(99, 102, 241, 0.5)",
              }}
              className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 group relative"
            >
              {/* Order Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 relative"
              >
                {/* Order ID and Date */}
                <div className="flex items-center justify-between mb-2">
                  <motion.h2
                    className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Order #{order.id}
                  </motion.h2>
                  <motion.span
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FaCalendarAlt className="text-indigo-500" />
                    {new Date(order.order_date).toLocaleDateString()}
                  </motion.span>
                </div>

                {/* Payment, Delivery, and Status */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {/* Payment Method */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center text-center p-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                  >
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-1.5 rounded-lg mb-1">
                      <FaMoneyBill className="text-indigo-600 dark:text-indigo-400 text-sm" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">
                      Payment
                    </p>
                    <p className="text-xs font-medium text-gray-800 dark:text-white truncate w-full capitalize">
                      {order.payment_method}
                    </p>
                  </motion.div>

                  {/* Delivery Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center text-center p-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                  >
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-1.5 rounded-lg mb-1">
                      <FaTruck className="text-purple-600 dark:text-purple-400 text-sm" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">
                      Delivery
                    </p>
                    <p className="text-xs font-medium text-gray-800 dark:text-white truncate w-full">
                      {deliveryDate}
                    </p>
                  </motion.div>

                  {/* Order Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`flex flex-col items-center text-center p-2 rounded-lg border ${
                      order.status === "Pending"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30"
                        : order.status === "Shipped"
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30"
                        : order.status === "Delivered"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30"
                        : "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg mb-1 ${
                        order.status === "Pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : order.status === "Shipped"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : order.status === "Delivered"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-purple-100 dark:bg-purple-900/30"
                      }`}
                    >
                      {order.status === "Pending" && (
                        <FaClock className="text-yellow-600 dark:text-yellow-400 text-sm" />
                      )}
                      {order.status === "Shipped" && (
                        <FaTruck className="text-blue-600 dark:text-blue-400 text-sm" />
                      )}
                      {order.status === "Delivered" && (
                        <FaCheckCircle className="text-green-600 dark:text-green-400 text-sm" />
                      )}
                      {order.status === "Completed" && (
                        <FaCheckCircle className="text-purple-600 dark:text-purple-400 text-sm" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">
                      Status
                    </p>
                    <p
                      className={`text-xs font-medium truncate w-full ${
                        order.status === "Pending"
                          ? "text-yellow-700 dark:text-yellow-300"
                          : order.status === "Shipped"
                          ? "text-blue-700 dark:text-blue-300"
                          : order.status === "Delivered"
                          ? "text-green-700 dark:text-green-300"
                          : "text-purple-700 dark:text-purple-300"
                      }`}
                    >
                      {order.status}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Address */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="p-4 sm:p-5"
              >
                <div className="mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-indigo-500 text-sm" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs sm:text-sm">
                    <p className="text-gray-700 dark:text-gray-200">
                      {order.address}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {order.city}, {order.state}
                    </p>
                  </div>
                </div>

                {/* Items Preview - First 2 items only */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FaShoppingBag className="text-indigo-500 text-sm" />
                      Items
                    </h3>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {previewItems.map((item) => (
                      <motion.li
                        key={item.product_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        className="flex items-center gap-4 p-3 rounded-lg transition-colors"
                      >
                        {/* Product Image - Increased size */}
                        {item.image_url ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative min-w-[4rem] w-16 h-16 sm:w-20 sm:h-20 bg-white"
                          >
                            <img
                              src={
                                item.image_url
                                  ? item.image_url.startsWith("http")
                                    ? item.image_url
                                    : `${getApiBaseUrl}${item.image_url}`
                                  : "/placeholder.png" // fallback if undefined
                              }
                              alt={item.product_name}
                              className="w-full h-full object-contain rounded-lg border border-gray-200 shadow-sm"
                              loading="lazy"
                            />
                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                              {item.quantity}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="min-w-[4rem] w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 relative">
                            <FaBox className="text-lg" />
                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                              {item.quantity}
                            </div>
                          </div>
                        )}

                        {/* Name & Quantity */}
                        <div className="flex-1">
                          <p className="font-medium text-sm sm:text-base text-gray-800 dark:text-white line-clamp-2">
                            {item.product_name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>

                        {/* Price */}
                        <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* "View More" button only if there are more than 2 items */}
                  {hasMoreItems && !isExpanded && (
                    <motion.button
                      onClick={() => setExpandedOrder(order.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 text-center text-sm text-indigo-600 dark:text-indigo-400 py-2 px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800/30"
                    >
                      <span>
                        View {remainingItems.length} more item
                        {remainingItems.length > 1 ? "s" : ""}
                      </span>
                      <FaChevronDown className="text-xs" />
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Expanded items view - Only the REMAINING items */}
              {isExpanded && hasMoreItems && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FaInfoCircle className="text-indigo-500" /> Additional
                      Items
                    </h3>
                    <button
                      onClick={() => setExpandedOrder(null)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-white dark:bg-gray-900 px-3 py-1 rounded-md shadow-sm"
                    >
                      Collapse <FaChevronUp className="text-xs" />
                    </button>
                  </div>
                  <ul className="space-y-4">
                    {remainingItems.map((item) => (
                      <motion.li
                        key={`expanded-${item.product_id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm"
                      >
                        {/* Larger product image */}
                        {item.image_url ? (
                          <div className="min-w-[4rem] w-16 h-16 sm:w-20 sm:h-20 relative">
                            <img
                              src={
                                item.image_url
                                  ? item.image_url.startsWith("http")
                                    ? item.image_url
                                    : `${getApiBaseUrl}${item.image_url}`
                                  : "/placeholder.png" // fallback if undefined
                              }
                              alt={item.product_name}
                              className="w-full h-full object-contain rounded-lg border border-gray-200 bg-white"
                              loading="lazy"
                            />
                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                              {item.quantity}
                            </div>
                          </div>
                        ) : (
                          <div className="min-w-[4rem] w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 relative">
                            <FaBox className="text-lg" />
                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                              {item.quantity}
                            </div>
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-medium text-sm sm:text-base text-gray-800 dark:text-white line-clamp-2">
                            {item.product_name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Order Footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex flex-row justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total
                    </p>
                    <p className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">
                      ${total.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "Delivered" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs sm:text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <FaStar className="text-xs" /> Rate
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      Details
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
