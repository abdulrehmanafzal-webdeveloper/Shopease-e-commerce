// src/components/ProductCard.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useCart } from "../Context/CartContext";
import { useAlert } from "../Context/Alert_context";
import { FiShoppingCart, FiAlertTriangle, FiLoader } from "react-icons/fi";
import { IoEyeOutline } from "react-icons/io5";

export type Product = {
  product_id: number;
  product_name: string;
  product_description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id?: number;
  sub_category_id?: number;
};

interface Props {
  product: Product;
}

const placeholderImage = "https://via.placeholder.com/300x300?text=No+Image";

export const ProductCard: React.FC<Props> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { showAlert } = useAlert();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Calculate how many of this product are already in cart
  const quantityInCart =
    cartItems.find((item) => item.cart_product_id === product?.product_id)
      ?.stock || 0;

  // Always compute stock dynamically
  const availableStock =
    product?.stock !== undefined
      ? quantityInCart === 0
        ? product?.stock
        : quantityInCart
      : 0;

  const handleClick = () => {
    navigate(`/products/getproductbyid/${product.product_id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    const id = localStorage.getItem("user_id");
    let session = localStorage.getItem("session_id");

    if (!id && !session) {
      session =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      localStorage.setItem("session_id", session);
    }

    try {
      await addToCart(product.product_id, 1, session ?? undefined);
      showAlert(
        "success",
        `🎉 ${product.product_name} is successfully added to cart...`
      );
    } catch (error) {
      showAlert(
        "error",
        `Failed to add ${product.product_name} to cart. Please try again.`
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Determine badge color based on stock level
  const stockBadgeClass = availableStock === 0 
    ? "bg-red-100 text-red-700"
    : availableStock < 5
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700";

  return (
    <motion.div
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      tabIndex={0}
      role="button"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
      }}
      whileTap={{ scale: 0.97 }}
      className="relative rounded-2xl shadow-sm bg-white transition-all duration-300 flex flex-col justify-between h-[380px] outline-none border border-gray-100 overflow-hidden group"
    >
      {/* Quick view button overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white text-gray-800 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <IoEyeOutline className="text-lg" /> Quick View
        </motion.button>
      </div>

      {/* Stock badge */}
      <div className="absolute top-3 left-3 z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`px-2 py-1 rounded-full text-xs font-medium ${stockBadgeClass}`}
        >
          {availableStock === 0
            ? "Out of Stock"
            : availableStock < 5
              ? `Only ${availableStock} left`
              : `In Stock ${availableStock}`}
        </motion.div>
      </div>

      {/* Product Image */}
      <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
        {/* Loading skeleton */}
        <div 
          className={`absolute inset-0 bg-gray-100 animate-pulse ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
        />
        
        <motion.img
          src={
            product.image_url.startsWith("http")
              ? product.image_url
              : `http://localhost:8000${product.image_url}`
          }
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
            setIsImageLoaded(true);
          }}
          alt={product.product_name}
          className="w-full h-full object-cover  group-hover:scale-110 transition-transform duration-500"
          style={{ opacity: isImageLoaded ? 1 : 0 }}
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow p-4">
        <h3 className="text-lg font-semibold line-clamp-1 text-gray-800 group-hover:text-indigo-600 transition-colors">
          {product.product_name}
        </h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2 flex-grow">
          {product.product_description || "No description available."}
        </p>

        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-indigo-600 font-bold text-xl">
              Rs. {product.price.toLocaleString()}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={availableStock <= 0 || isAddingToCart}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
          >
            {isAddingToCart ? (
              <>
                <FiLoader className="animate-spin text-lg" />
                <span>Adding...</span>
              </>
            ) : availableStock <= 0 ? (
              <>
                <FiAlertTriangle className="text-lg" />
                <span>Sold Out</span>
              </>
            ) : (
              <>
                <FiShoppingCart className="text-lg" />
                <span>Add to Cart</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};