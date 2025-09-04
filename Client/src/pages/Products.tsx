import React, { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLocation, useParams } from "react-router-dom";
import { useProductDetail } from "../Context/ProductDetailContext";
import { FiFilter, FiX, FiSearch, FiSliders, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import { BiSortAlt2 } from "react-icons/bi";

const Products: React.FC = () => {
  const location = useLocation();
  const { subcategoryId } = useParams<{ subcategoryId?: any }>();
  // Grab search query from URL (?keyword=...)
  const query = new URLSearchParams(location.search).get("keyword") || "";

  const {
    relatedProducts: products,
    loading,
    error,
    fetchProductDetail,
  } = useProductDetail();

  // Filter controls
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"" | "price-asc" | "price-desc" | "name-asc" | "name-desc">("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRangeValue, setPriceRangeValue] = useState<[number, number]>([0, 0]);

  // derive price bounds from current products (for nicer UX)
  useEffect(() => {
    if (!products || products.length === 0) {
      setMinPrice(0);
      setMaxPrice(0);
      setPriceRangeValue([0, 0]);
      return;
    }
    const prices = products.map((p) => Number(p.price) || 0);
    
    const lo = Math.min(...prices);
    const hi = Math.max(...prices);
    setMinPrice(lo);
    setMaxPrice(hi);
    setPriceRangeValue([lo, hi]);
  }, [products]);

  // fetch logic
  useEffect(() => {
    if (query.trim()) {
      // 1) Search mode
      fetchProductDetail(query, true);
    } else if (subcategoryId) {
      // 2) Products by subcategory ID
      fetchProductDetail(subcategoryId, false);
    } else {
      // 3) All products
      fetchProductDetail("", false);
    }
  }, [query, subcategoryId, fetchProductDetail]);

  // apply frontend filtering/sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const price = Number(p.price) || 0;
      return price >= priceRangeValue[0] && price <= priceRangeValue[1];
    });
 
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name-asc") {
      result = [...result].sort((a, b) => a.product_name.localeCompare(b.product_name));
    } else if (sortBy === "name-desc") {
      result = [...result].sort((a, b) => b.product_name.localeCompare(a.product_name));
    }

    return result;
  }, [products, priceRangeValue, sortBy]);

  // Reset filters
  const resetFilters = () => {
    if (products.length) {
      const prices = products.map((p) => Number(p.price) || 0);
      setMinPrice(Math.min(...prices));
      setMaxPrice(Math.max(...prices));
      setPriceRangeValue([Math.min(...prices), Math.max(...prices)]);
    } else {
      setMinPrice(0);
      setMaxPrice(0);
      setPriceRangeValue([0, 0]);
    }
    setSortBy("");
  };

  // Get page title based on context
  const getPageTitle = () => {
    if (query) {
      return `Search results for "${query}"`;
    } else if (subcategoryId) {
      return "Products";
    }
    return "All Products";
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100 }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 } 
    }
  };

  // Generate loading skeleton cards
  const LoadingSkeletons = () => (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div 
          key={`skeleton-${i}`} 
          variants={itemVariants}
          className="rounded-2xl shadow-sm bg-white border border-gray-100 overflow-hidden h-[380px]"
        >
          <div className="h-48 w-full bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-100 rounded animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
            </div>
            <div className="pt-4 flex justify-between items-center">
              <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );

  // Empty state component
  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="bg-indigo-50 rounded-full p-6 mb-4">
        <FiSearch className="text-4xl text-indigo-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
      <p className="text-gray-600 max-w-md mb-6">
        We couldn't find any products matching your criteria. Try adjusting your filters or search query.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetFilters}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
      >
        <FiRefreshCw /> Reset Filters
      </motion.button>
    </motion.div>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{getPageTitle()}</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? (
              <span>Loading products...</span>
            ) : (
              <span>Showing {filteredProducts.length} products</span>
            )}
          </p>
          
          {/* Mobile filter button */}
          <button 
            className="md:hidden px-4 py-2 border rounded-lg text-gray-700 flex items-center gap-2 bg-white shadow-sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <FiSliders />
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </motion.div>

      {/* Desktop filter bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="hidden md:flex mb-6 bg-white rounded-xl shadow-sm p-4 items-center gap-6 border border-gray-100"
      >
        <div className="flex items-center gap-2">
          <FiFilter className="text-indigo-500" />
          <span className="font-medium text-gray-700">Filters:</span>
        </div>

        {/* Price range slider */}
        <div className="flex flex-1 items-center gap-3">
          <span className="text-sm text-gray-600">Price Range:</span>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-medium">Rs. {priceRangeValue[0]}</span>
            <div className="flex-1 px-2">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={priceRangeValue[0]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPriceRangeValue([val, Math.max(val, priceRangeValue[1])]);
                }}
                className="w-full accent-indigo-600"
              />
            </div>
            <span className="text-sm font-medium">Rs. {priceRangeValue[1]}</span>
            <div className="flex-1 px-2">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={priceRangeValue[1]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPriceRangeValue([Math.min(priceRangeValue[0], val), val]);
                }}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <BiSortAlt2 className="text-indigo-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
          >
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Reset button */}
        {(priceRangeValue[0] !== minPrice || 
          priceRangeValue[1] !== maxPrice || 
          sortBy !== "") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetFilters}
            className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg flex items-center gap-1 hover:bg-red-100 transition-colors"
          >
            <FiX /> Reset
          </motion.button>
        )}
      </motion.div>

      {/* Mobile filters (collapsible) */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-100 overflow-hidden"
          >
            <div className="space-y-4">
              {/* Price inputs */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Price Range</label>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500">Min</span>
                  <input
                    type="number"
                    className="w-24 border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-300"
                    value={priceRangeValue[0]}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPriceRangeValue([v, Math.max(v, priceRangeValue[1])]);
                    }}
                    min={0}
                  />
                  <span className="text-xs text-gray-500">Max</span>
                  <input
                    type="number"
                    className="w-24 border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-300"
                    value={priceRangeValue[1]}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPriceRangeValue([Math.min(priceRangeValue[0], v), v]);
                    }}
                    min={0}
                  />
                </div>
                
                {/* Slider */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRangeValue[1]}
                  onChange={(e) => {
                    setPriceRangeValue([priceRangeValue[0], Number(e.target.value)]);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Sort by */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300 text-sm"
                >
                  <option value="">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              <div className="flex justify-between pt-2 border-t">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg flex items-center gap-1"
                >
                  <FiRefreshCw size={14} /> Reset Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <LayoutGroup>
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {error && (
            <motion.div 
              variants={itemVariants}
              className="col-span-full bg-red-50 p-4 rounded-lg text-red-600 flex items-center gap-2"
            >
              <FiAlertTriangle /> {"No products found"}
            </motion.div>
          )}

          {loading ? (
            <LoadingSkeletons />
          ) : filteredProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.product_id}
                  variants={itemVariants}
                  layout
                  exit="exit"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </LayoutGroup>
    </div>
  );
};

export default Products;