import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../Context/ProductsContext";
import { FaChevronLeft } from "react-icons/fa";

export interface SubCategory {
  id: number;
  name: string;
  image_url: string;
  category_id: number;
  category_url: string;
}
import { getApiBaseUrl } from "../utils/api";

const placeholderHero =
  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
const placeholderThumb =
  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

/**
 * SubCategories page
 * route expected: /subcategories/:categoryId  (adjust if your route differs)
 */
const SubCategories: React.FC = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const categoryNum = Number(categoryId);
  const navigate = useNavigate();

  // context helper (we added this earlier)
  const { fetchSubCategories } = useProducts();

  // local state
  const [items, setItems] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  // load subcategories when categoryId changes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      setItems([]);

      if (!categoryId || Number.isNaN(categoryNum)) {
        setError("Invalid category id.");
        setLoading(false);
        return;
      }

      try {
        const subcats = await fetchSubCategories(categoryNum);
        if (!mounted) return;
        setItems(subcats || []);
      } catch (err) {
        console.error("fetchSubCategories error:", err);
        if (mounted) setError("Failed to load subcategories.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [categoryId, categoryNum, fetchSubCategories]);

  // hero image: prefer a category-level banner if available; otherwise fall back
  const heroImage =
    items.length > 0
      ? (items[0] as any).category_url ||
        (items[0].image_url
          ? items[0].image_url.startsWith("http")
            ? items[0].image_url
            : `${getApiBaseUrl()}${items[0].image_url}`
          : placeholderHero)
      : placeholderHero;

  const categoryTitle =
    (items.length > 0 &&
      ((items[0] as any).category_name || `Category ${categoryNum}`)) ||
    `Category ${categoryNum}`;

  // Animation variants for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleImageLoad = (id: number) => {
    setImageLoaded((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center text-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FaChevronLeft className="mr-1" /> Back
        </button>
      </nav>

      {/* Hero/banner section - IMPROVED HEIGHT */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
        {loading ? (
          <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        ) : (
          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem]">
            {/* Background image */}
            <img
              src={heroImage}
              alt={categoryTitle}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).src = placeholderHero)
              }
              loading="eager"
            />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              ></motion.h1>

              <motion.div
                className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: "6rem" }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </div>
          </div>
        )}
      </div>
      {/* Content section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence>
          {loading ? (
            // Skeleton loader grid with the same styling as the actual content
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-72"
                >
                  <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto mt-2" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-center py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-flex flex-col items-center">
                <svg
                  className="w-12 h-12 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-medium text-lg mb-1">
                  Error Loading Categories
                </p>
                <p>{error}</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              className="text-center py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gray-50 text-gray-600 p-6 rounded-xl inline-flex flex-col items-center">
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-xl font-semibold mb-2">
                  No Subcategories Found
                </h3>
                <p className="max-w-sm">
                  This category doesn't have any subcategories at the moment.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {items.map((subcat, index) => {
                const colors = [
                  "bg-gradient-to-br from-red-50 to-red-100",
                  "bg-gradient-to-br from-blue-50 to-blue-100",
                  "bg-gradient-to-br from-green-50 to-green-100",
                  "bg-gradient-to-br from-yellow-50 to-yellow-100",
                  "bg-gradient-to-br from-pink-50 to-pink-100",
                  "bg-gradient-to-br from-purple-50 to-purple-100",
                  "bg-gradient-to-br from-orange-50 to-orange-100",
                  "bg-gradient-to-br from-teal-50 to-teal-100",
                ];
                const bgColor = colors[index % colors.length];
                const isLoaded = imageLoaded[subcat.id] || false;

                return (
                  <motion.div
                    key={subcat.id}
                    variants={cardVariants}
                    whileHover={{
                      y: -8,
                      boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`${bgColor} rounded-xl shadow-md hover:shadow-xl cursor-pointer transition duration-300 overflow-hidden flex flex-col h-72`}
                    onClick={() =>
                      navigate(`/products/getproductsbyid/${subcat.id}`)
                    }
                  >
                    <div className="relative h-48 overflow-hidden bg-white">
                      {/* Image loading skeleton */}
                      {!isLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                      )}

                      <motion.img
                        src={
                          subcat.image_url
                            ? subcat.image_url.startsWith("http")
                              ? subcat.image_url
                              : `${getApiBaseUrl()}${subcat.image_url}`
                            : placeholderThumb
                        }
                        alt={subcat.name}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={() => handleImageLoad(subcat.id)}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            placeholderThumb;
                          handleImageLoad(subcat.id);
                        }}
                        loading="lazy"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: isLoaded ? 1 : 0.9 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center items-center">
                      <motion.span
                        className="text-base md:text-lg font-semibold text-gray-800 text-center line-clamp-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        {subcat.name}
                      </motion.span>
                      <motion.div
                        className="mt-2 bg-white/70 px-3 py-1 rounded-full text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                      >
                        View Products
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubCategories;
