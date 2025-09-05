// src/components/Navbar.tsx
import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBoxOpen,
  FaTrash,
} from "react-icons/fa";

import { getApiBaseUrl } from "../utils/api";
import { useCart, type CartItem } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { useAlert } from "../Context/Alert_context";
import { useProducts } from "../Context/ProductsContext";

const placeholderImage = "https://via.placeholder.com/80?text=No+Image";

const Navbar: React.FC = () => {
  // UI state
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Record<number, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const {
    cartItems = [],
    fetchCart,
    removeFromCart,
    clearCart,
    updateCart,
    addToCart,
  } = useCart();
  const { isLogged, userId, logoutUser, setIsLogged } = useAuth();
  const { showAlert } = useAlert();
  const { categories, fetchHomeSections } = useProducts();

  // Scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ensure session_id and fetch cart on mount / auth change
  useEffect(() => {
    const session =
      localStorage.getItem("session_id") ||
      (() => {
        const newSession =
          typeof crypto !== "undefined" && (crypto as any).randomUUID
            ? (crypto as any).randomUUID()
            : Math.random().toString(36).slice(2);
        localStorage.setItem("session_id", newSession);
        return newSession;
      })();

    const cartKey = isLogged ? String(userId) : session;
    fetchCart(cartKey || undefined);
  }, [isLogged, userId, fetchCart]);

  // Close cart with ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // fetch home sections and set logged flag on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUser = async () => {
      setIsLogged(!!token);
    };
    fetchUser();
    fetchHomeSections();
  }, [setIsLogged, fetchHomeSections]);

  // open cart drawer and refresh cart
  const openCart = useCallback(() => {
    const cartKey = isLogged
      ? String(userId)
      : localStorage.getItem("session_id");
    fetchCart(cartKey || undefined);
    setCartOpen(true);
  }, [isLogged, userId, fetchCart]);

  // search handler
  const doSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (searchQ.trim()) {
        navigate(
          `/products/search?keyword=${encodeURIComponent(searchQ.trim())}`
        );
        setSearchQ("");
        setSearchMode(false);
        setMobileMenu(false);
      }
    },
    [searchQ, navigate]
  );

  // logout handler
  const logOut = useCallback(() => {
    const cartKey = isLogged
      ? String(userId)
      : localStorage.getItem("session_id");
    clearCart(cartKey || undefined);
    logoutUser();
    showAlert("success", "👋 You have been logged out!");
    setUserDropdown(false);
    navigate("/");
  }, [isLogged, userId, clearCart, logoutUser, showAlert, navigate]);

  // total price
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
  }, [cartItems]);

  
  // Clear cart confirmation
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const handleConfirmClear = useCallback(async () => {
    setConfirmClearOpen(false);
    try {
      const cartKey = isLogged
        ? String(userId)
        : localStorage.getItem("session_id");
      await clearCart(cartKey || undefined);
      showAlert("success", "Cart cleared.");
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to clear cart.");
    }
  }, [isLogged, userId, clearCart, showAlert]);

  // helper to format currency
  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Quantity change handler
  const handleQtyChange = async (productId: number, newQty: number) => {
    // Find the cart item
    const item = cartItems.find(item => item.cart_product_id === productId);
    if (!item) {
      showAlert("error", "Item not found in cart");
      return;
    }

    // Validate quantity against stock and minimum
    if (newQty < 1) {
      showAlert("error", "Quantity cannot be less than 1");
      return;
    }
    if (newQty > item.stock) {
      showAlert("error", `Only ${item.stock} items available`);
      return;
    }

    setDeletingItems((prev) => ({ ...prev, [productId]: true }));
    try {
      // Use session ID only if user is not logged in
      const sessionId = !isLogged ? localStorage.getItem("session_id") : undefined;
      await updateCart(productId, newQty, sessionId || undefined);
    } catch (err) {
      console.error("Error updating quantity:", err);
      showAlert("error", "Failed to update quantity");
    } finally {
      setDeletingItems((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }
  };

  // Remove item with undo
  const handleRemoveWithUndo = async (item: CartItem) => {
    setDeletingItems((prev) => ({ ...prev, [item.product_id]: true }));
    try {
      await removeFromCart(
        item.product_id,
        isLogged ? undefined : localStorage.getItem("session_id") || undefined
      );
      showAlert("success", `Removed ${item.name || "Item"}`, async () => {
        await addToCart(item.cart_product_id);
      });
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to remove item.");
    } finally {
      setDeletingItems((prev) => {
        const copy = { ...prev };
        delete copy[item.product_id];
        return copy;
      });
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? "shadow-xl py-2" : "py-3 shadow-md"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* NAVBAR MAIN ROW */}
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 md:px-6">
        {/* LEFT: Mobile/Tablet Hamburger - Now visible up to lg breakpoint (1024px) instead of md (768px) */}
        <motion.button
          className="lg:hidden mr-2 focus:outline-none text-gray-700"
          onClick={() => setMobileMenu((v) => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle mobile menu"
        >
          {mobileMenu ? <FaTimes size={22} /> : <FaBars size={22} />}
        </motion.button>

        {/* BRAND / LOGO */}
        <motion.div
          className="cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/")}
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ShopEase
          </span>
        </motion.div>

        {/* MIDDLE: Desktop Categories - Now only visible on lg screens and up (≥1024px) */}
        <nav className="hidden lg:flex space-x-8 xl:space-x-12">
          {categories.slice(0, 5).map((cat) => (
            <motion.span
              key={cat.id}
              onClick={() => navigate(`/categories/subcategories/${cat.id}`)}
              className="relative text-gray-700 hover:text-blue-500 transition group cursor-pointer font-medium whitespace-nowrap"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat.name}
              <motion.span
                className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"
                layoutId="navIndicator"
              />
            </motion.span>
          ))}
        </nav>

        {/* RIGHT: Icons */}
        <div className="flex items-center space-x-5">
          {/* Search */}
          <motion.button
            onClick={() => {
              setSearchMode((v) => !v);
              setMobileMenu(false);
            }}
            className="relative text-gray-700"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle search"
          >
            <FaSearch size={20} />
          </motion.button>

          {/* Orders */}
          <motion.button
            onClick={() => navigate("/order/orders")}
            className="relative text-gray-700"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Orders"
          >
            <FaBoxOpen size={20} />
          </motion.button>

          {/* Cart */}
          <motion.button
            onClick={openCart}
            className="relative text-gray-700"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open cart"
          >
            <FaShoppingCart size={20} />
            {cartItems.length > 0 && (
              <motion.span
                className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                {cartItems.length}
              </motion.span>
            )}
          </motion.button>

          {/* User / Dropdown */}
          <div className="relative">
            {isLogged ? (
              <motion.button
                onClick={() => setUserDropdown((v) => !v)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaUser size={20} className="text-gray-700" />
              </motion.button>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link to="/login" className="transition">
                  <FaUser size={20} className="text-gray-700" />
                </Link>
              </motion.div>
            )}

            <AnimatePresence>
              {userDropdown && isLogged && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 mt-3 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden w-48 z-50"
                >
                  <motion.a
                    onClick={() => {
                      setUserDropdown(false);
                      navigate(`/users/profile`);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700 font-medium"
                    whileHover={{ x: 5 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </motion.a>
                  <motion.button
                    onClick={logOut}
                    className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-50 cursor-pointer flex items-center gap-2 font-medium"
                    whileHover={{ x: 5 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* SLIDE-DOWN SEARCH BAR */}
      <AnimatePresence>
        {searchMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50"
          >
            <form
              onSubmit={doSearch}
              className="max-w-7xl mx-auto py-3 px-4 flex items-center"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-full bg-white border border-gray-200 pl-10 pr-4 py-3 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <motion.button
                type="submit"
                className="ml-2 bg-gradient-to-r  from-blue-600 to-purple-600 px-4 py-3 rounded-lg text-white hover:from-blue-700 hover:to-purple-700 transition h-[48px] flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSearch />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setSearchMode(false)}
                className="ml-2 text-gray-600 hover:text-gray-800 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close search"
              >
                <FaTimes size={20} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE/TABLET MENU - Now visible for screens up to lg breakpoint */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t border-gray-200 shadow-lg lg:hidden"
          >
            <div className="px-4 py-3 grid gap-1">
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span
                    onClick={() => {
                      setMobileMenu(false);
                      navigate(`/categories/subcategories/${cat.id}`);
                    }}
                    className="block text-gray-800 hover:bg-gray-50 rounded-lg px-3 py-3 transition font-medium cursor-pointer"
                  >
                    {cat.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Your Cart
                </h2>
                <motion.button
                  onClick={() => setCartOpen(false)}
                  className="text-gray-500 rounded-full p-2 hover:bg-gray-100"
                  whileHover={{ rotate: 90, scale: 1.08 }}
                >
                  <FaTimes />
                </motion.button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-full text-center py-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-gray-100 rounded-full p-5 mb-4">
                      <FaShoppingCart className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Add some items to get started
                    </p>
                    <motion.button
                      onClick={() => {
                        setCartOpen(false);
                        navigate("/");
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue Shopping
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, idx) => (
                      <motion.div
                        key={item.product_id || idx}
                        className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={
                              item.image_url
                                ? item.image_url.startsWith("http")
                                  ? item.image_url
                                  : `${getApiBaseUrl()}${item.image_url}`
                                : "/placeholder.png" // fallback if undefined
                            }
                            alt={item.name}
                            onError={(e) =>
                              (e.currentTarget.src = placeholderImage)
                            }
                            className="w-16 h-16 object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-gray-800">
                            {item.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              disabled={item.updatingQuantity || item.quantity <= 1}
                              onClick={() =>
                                handleQtyChange(
                                  item.product_id,
                                  item.quantity - 1
                                )
                              }
                              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:hover:bg-gray-200 transition-colors"
                            >
                              -
                            </button>
                            <motion.span 
                              className={`px-4 py-1 rounded-md min-w-[40px] text-center ${
                                item.updatingQuantity ? 'bg-blue-50' : 'bg-gray-50'
                              }`}
                              animate={{
                                scale: item.updatingQuantity ? [1, 1.05, 1] : 1,
                                opacity: item.updatingQuantity ? 0.7 : 1
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              {item.quantity}
                            </motion.span>
                            <button
                              disabled={item.updatingQuantity || item.quantity >= item.stock}
                              onClick={() =>
                                handleQtyChange(
                                  item.product_id,
                                  item.quantity + 1
                                )
                              }
                              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:hover:bg-gray-200 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            ${fmt(item.price * item.quantity)}
                          </p>
                        </div>

                        <motion.button
                          onClick={() => handleRemoveWithUndo(item)}
                          disabled={deletingItems[item.product_id] || false}
                          className={`self-start p-2 rounded-full ${
                            deletingItems[item.product_id]
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-500 hover:bg-red-50"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {deletingItems[item.product_id] ? (
                            <div className="w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <motion.div
                  className="p-5 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between font-semibold text-lg mb-4">
                    <span className="text-gray-700">
                      Total:
                    </span>
                    <span className="text-gray-900">
                      ${fmt(totalPrice)}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmClearOpen(true)}
                      className="flex-1 px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      Clear Cart
                    </button>

                    <motion.button
                      onClick={() => {
                        setCartOpen(false);
                        navigate("/checkout");
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Proceed to Checkout
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {confirmClearOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmClearOpen(false)}
            />
            <motion.div
              className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Clear Cart?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to remove all items from your cart? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <motion.button
                    onClick={() => setConfirmClearOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmClear}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Confirm
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default memo(Navbar);