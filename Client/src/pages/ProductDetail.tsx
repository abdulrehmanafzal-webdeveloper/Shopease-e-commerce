import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTruck, FaUndo, FaShieldAlt, FaShareAlt, FaArrowLeft, FaStar, FaRegStar, FaHeart } from "react-icons/fa";
import { useProductDetail } from "../Context/ProductDetailContext";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { useAlert } from "../Context/Alert_context";

const placeholderImage = "https://via.placeholder.com/500x500?text=Loading+Product";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { product, relatedProducts, loading, error, fetchSingleProduct } = useProductDetail();
  const { addToCart, cartItems } = useCart();
  const { isLogged } = useAuth();
  const { showAlert } = useAlert();

  // quantity is the only mutable "selection" state
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Magnifier state
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transformOrigin: "center center",
    transform: "scale(1)",
  });

  // Fetch product on mount / id change
  useEffect(() => {
    setIsImageLoaded(false);
    if (id) fetchSingleProduct(id);
  }, [id, fetchSingleProduct]);

  // Set selected image when product loads
  useEffect(() => {
    if (product?.image_url) setSelectedImage(product.image_url);
  }, [product]);

  // --- derive how many of this product are already in cart (server truth) ---
  const inCart = product && cartItems
    ? cartItems.find((it) => it.product_id === product.product_id)?.quantity || 0
    : 0;

  // productStock is the server-provided stock (0 if undefined)
  const productStock = product?.stock ?? 0;

  // maxSelectable is the maximum the user can select right now (including what's in cart)
  const maxSelectable = Math.max(productStock, 0);

  // availableAfterSelection is what you can show in the UI as "items left" after current selection
  const availableAfterSelection = Math.max(productStock - inCart - quantity, 0);

  // Ensure quantity is always within valid bounds whenever product/cart changes
  useEffect(() => {
    if (!product) return;

    if (maxSelectable === 0) {
      // nothing available -> set to 0 and user cannot add
      setQuantity(0);
    } else {
      // ensure quantity is at least 1 and not more than maxSelectable
      setQuantity((prev) => {
        const base = prev <= 0 ? 1 : prev;
        return Math.min(base, maxSelectable);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.product_id, maxSelectable, inCart]);

  // Handlers that respect maxSelectable (no mutation of stock)
  const handleIncrease = () => {
    setQuantity((q) => {
      if (q >= maxSelectable) return q;
      return q + 1;
    });
  };

  const handleDecrease = () => {
    setQuantity((q) => {
      // allow going down to 1 (or 0 if no stock)
      if (q <= 1) return q;
      return q - 1;
    });
  };

  // Add to Cart (uses your context's addToCart which itself fetches/refreshes cart)
  const handleAddToCart = async () => {
    if (!product || quantity <= 0) return;

    try {
      setIsAdding(true);
      if (isLogged) {
        await addToCart(product.product_id, quantity);
      } else {
        await addToCart(
          product.product_id,
          quantity,
          localStorage.getItem("session_id") || undefined
        );
      }

      showAlert(
        "success",
        `🎉 ${product.product_name} added to cart (${quantity})`
      );
      // cartItems will be refreshed by addToCart -> fetchCart, and the effect above will clamp quantity if needed
    } catch (err) {
      showAlert("error", "Server not responding. Please try again later.");
    } finally {
      setIsAdding(false);
    }
  };

  // Magnifier
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.5)",
      transition: "transform 0.2s ease",
    });
  };
  
  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)",
      transition: "transform 0.3s ease",
    });
  };

  // Function to handle image loading
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // Rendering error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Failed to Load Product</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Rendering loading skeleton
  if (loading || !product) {
    return (
      <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8 animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Image Skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden animate-pulse">
                <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
              </div>
              
              <div className="flex space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
              
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse"></div>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Related Products Skeleton */}
          <div className="mt-16 space-y-6">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white border rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Function to format price with commas
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="min-h-screen bg-white py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto mb-6">
        <nav className="flex items-center text-sm font-medium text-gray-500">
          <button onClick={() => navigate(-1)} className="hover:text-gray-900 flex items-center transition-colors">
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Product Details</span>
        </nav>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Product Images */}
          <div className="space-y-4">
            <motion.div
              className="rounded-2xl overflow-hidden group relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-square flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Image loading skeleton */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
              )}
              
              <img
                src={(selectedImage || product.image_url)?.startsWith("http")
                  ? selectedImage || product.image_url
                  : `http://localhost:8000${selectedImage || product.image_url}`
                }
                alt={product.product_name || "Product Image"}
                style={zoomStyle}
                className={`w-full h-full object-contain transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onError={(e) => {
                  e.currentTarget.src = placeholderImage;
                  handleImageLoad();
                }}
                onLoad={handleImageLoad}
                loading="eager"
              />
              
              {/* Zoom instruction */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Hover to zoom
              </div>
              
              {/* Favorite button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
                className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
              >
                <FaHeart className={isFavorite ? "text-red-500" : "text-gray-400"} />
              </button>
            </motion.div>

            {/* Thumbnails */}
            <div className="flex space-x-3 justify-center">
              {[
                product.image_url.startsWith("http")
                  ? product.image_url
                  : `http://localhost:8000${product.image_url}`,
                product.image_url.startsWith("http")
                  ? product.image_url
                  : `http://localhost:8000${product.image_url}`,
                product.image_url.startsWith("http")
                  ? product.image_url
                  : `http://localhost:8000${product.image_url}`,
              ].map((img, idx) => (
                <motion.div
                  key={idx}
                  className={`border-2 rounded-lg cursor-pointer p-1 w-20 h-20 sm:w-24 sm:h-24 ${
                    selectedImage === img ? "border-yellow-400 shadow-md" : "border-gray-200"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(img)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <img
                    src={img || placeholderImage}
                    alt={`Product thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain rounded"
                    onError={(e) => (e.currentTarget.src = placeholderImage)}
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-start">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.product_name}</h1>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaShareAlt className="cursor-pointer text-gray-500 hover:text-gray-800" />
              </motion.div>
            </div>
            
            {/* Product rating */}
            <div className="flex items-center mt-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  i < 4 ? <FaStar key={i} /> : <FaRegStar key={i} />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">(128 reviews)</span>
            </div>
            
            {/* Product description */}
            <p className="text-gray-600 mb-6">
              {product.product_description || "No description available for this product. Please contact customer service for more information."}
            </p>

            {/* Price */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <p className="text-3xl font-bold text-gray-900">
                Rs. {formatPrice(product.price)}
              </p>
              
              {/* Stock status */}
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    availableAfterSelection > 10
                      ? "bg-green-100 text-green-800"
                      : availableAfterSelection > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {availableAfterSelection > 10
                    ? `In Stock ${availableAfterSelection}`
                    : availableAfterSelection > 0
                    ? `Only ${availableAfterSelection} left`
                    : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            {maxSelectable > 0 ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center">
                  <button
                    className="w-10 h-10 rounded-l-lg border border-r-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="h-10 w-16 border text-center text-gray-800 font-medium focus:outline-none focus:ring-0"
                  />
                  <button
                    className="w-10 h-10 rounded-r-lg border border-l-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleIncrease}
                    disabled={quantity >= maxSelectable}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <span className="block text-sm font-medium text-gray-700 mb-2">Quantity</span>
                <div className="bg-gray-100 px-4 py-3 rounded-lg text-gray-500">
                  Currently unavailable
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.button
                onClick={handleAddToCart}
                disabled={isAdding || quantity <= 0 || maxSelectable === 0}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400 shadow-md hover:shadow-lg"
              >
                {isAdding
                  ? "Adding..."
                  : `🛒 Add to Cart - Rs. ${formatPrice(product.price * quantity)}`}
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-black text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Buy Now
              </motion.button>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                  <FaTruck className="text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold">Free Shipping</h4>
                  <p className="text-sm text-gray-600">On orders over Rs. 15,000</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <FaUndo className="text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold">30-Day Returns</h4>
                  <p className="text-sm text-gray-600">Easy exchanges with no hassle</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <FaShieldAlt className="text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold">2-Year Warranty</h4>
                  <p className="text-sm text-gray-600">Comprehensive coverage included</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div 
            className="mt-16 md:mt-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              <AnimatePresence>
                {relatedProducts.map((rp, index) => (
                  <motion.div
                    key={rp.product_id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => navigate(`/products/getproductbyid/${rp.product_id}`)}
                  >
                    <div className="relative pt-[100%] bg-gray-50">
                      <img
                        src={rp.image_url || placeholderImage}
                        alt={rp.product_name}
                        className="absolute top-0 left-0 w-full h-full object-contain p-3 hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = placeholderImage)}
                      />
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 flex-grow">{rp.product_name}</h3>
                      <p className="text-sm font-semibold text-gray-900">Rs. {formatPrice(rp.price)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;