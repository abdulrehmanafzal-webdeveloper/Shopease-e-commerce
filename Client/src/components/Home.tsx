import { useEffect, memo, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../Context/ProductsContext";
import Carousel from "../components/Carousel";
const Categories = lazy(() => import("../components/Categories"));
import ProductCarousel from "../components/ProductCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFireFlameCurved } from "@fortawesome/free-solid-svg-icons";

const placeholderImage =
  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

const Home = () => {
  const navigate = useNavigate();
  const { homeSections, fetchHomeSections, loading, categories } =
    useProducts();

  // Track if initial data has been loaded
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchHomeSections();
      } catch (error) {
        console.error("Error loading home sections:", error);
      } finally {
        // Set initialLoad to false regardless of success or failure
        // This ensures we transition from loading to content/empty states
        setTimeout(() => setInitialLoad(false), 800); // Small delay for smoother transitions
      }
    };
    loadData();
  }, [fetchHomeSections]);

  // Enhanced skeleton for featured collections

  const SkeletonFeaturedCollection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center p-4 rounded-xl">
      {/* Left Subcategory Skeleton */}
      <div className="md:col-span-1 space-y-4">
        <div className="h-8 w-3/4 bg-gray-200 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent -translate-x-full animate-shimmer" />
        </div>
        <div className="relative h-60 md:h-72 w-full bg-gray-200 rounded-2xl overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent -translate-x-full animate-shimmer" />
          <div className="absolute bottom-4 left-4">
            <div className="h-8 w-24 bg-white/60 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right Product Carousel Skeleton */}
      <div className="md:col-span-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`product-skeleton-${i}`}
              className="bg-white rounded-xl p-3 shadow-md relative overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent -translate-x-full animate-shimmer"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
              <div className="h-32 md:h-40 bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-1/3 bg-gray-200 rounded-full mt-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

 

  return (
    <motion.div
      className="min-h-screen bg-white overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ================= ANIMATED MARQUEE (Top) ================= */}
      <motion.div
        className="w-full bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden py-2 sm:py-3"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="whitespace-nowrap">
          <motion.div
            className="inline-block text-sm sm:text-base md:text-lg font-semibold text-black px-4"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
          >
            100k products at one click{" "}
            <FontAwesomeIcon
              className="text-orange-500"
              icon={faFireFlameCurved}
            />{" "}
            <span className="hidden xs:inline">Flat 199 delivery charges </span>
            <FontAwesomeIcon
              className="text-orange-500"
              icon={faFireFlameCurved}
            />{" "}
            Same day delivery{" "}
            <FontAwesomeIcon
              className="text-orange-500"
              icon={faFireFlameCurved}
            />{" "}
            <span className="hidden sm:inline">Kyu ke Yahan Sab Milta Ha </span>
            <FontAwesomeIcon
              className="text-orange-500"
              icon={faFireFlameCurved}
            />{" "}
            <span className="hidden md:inline">Monthly Deals & Discounts </span>
            <FontAwesomeIcon
              className="text-orange-500"
              icon={faFireFlameCurved}
            />{" "}
            100k products at one click
          </motion.div>
        </div>
      </motion.div>

      {/* ================= HERO CAROUSEL ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Carousel />
      </motion.div>

      {/* ================= ANIMATED MARQUEE (Second) ================= */}
      <motion.div
        className="w-full bg-gradient-to-r from-[#009E9A] to-[#00807C] overflow-hidden py-3 sm:py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="whitespace-nowrap">
          <motion.div
            className="inline-block text-sm sm:text-base md:text-lg font-semibold text-white px-4"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
          >
            🔥 Style & Freshness | All in One Place | Welcome to Generation
            Store | Hot Deals Everyday 🔥
          </motion.div>
        </div>
      </motion.div>

      {/* ================= CATEGORY GRID ================= */}
      <Suspense fallback={<div>Loading categories...</div>}>
        <Categories
          loading={loading}
          categories={categories}
          placeholderImage={placeholderImage}
        />
      </Suspense>
      {/* ================= SUBCATEGORY SECTIONS ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 bg-gray-50">
        <motion.div
          className="text-center mb-10 md:mb-16"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Featured Collections
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collections of trending products
          </p>
        </motion.div>

        <div className="space-y-20 md:space-y-28">
          <AnimatePresence mode="wait">
            {loading || initialLoad ? (
              // Show skeleton placeholders while loading
              Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`featured-skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 md:p-8 rounded-2xl shadow-sm"
                >
                  <SkeletonFeaturedCollection />
                </motion.div>
              ))
            ) : homeSections.length === 0 ? (
              // Show empty state if no sections available
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Featured Collections Yet
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Check back later for our featured collections and product
                  highlights.
                </p>
              </motion.div>
            ) : (
              // Show actual content when loaded
              homeSections.slice(0, 10).map((section, idx) => (
                <motion.div
                  key={section.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1, duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center p-4 sm:p-6 md:p-8 lg:p-10">
                    {/* Left Subcategory Image */}
                    <motion.div
                      className="md:col-span-1 space-y-6"
                      whileHover={{ scale: 1.01 }}
                    >
                      <h2 className="text-2xl md:text-3xl font-bold md:text-nowrap text-gray-800 break-words leading-tight">
                        {section.description}
                      </h2>
                      <div className="relative overflow-hidden rounded-xl shadow-lg aspect-w-4 aspect-h-5 bg-gray-100">
                        <motion.img
                          src={section.image_url || placeholderImage}
                          alt={section.name}
                          className="w-full h-64 sm:h-80 md:h-72 lg:h-80 object-cover cursor-pointer"
                          onClick={() =>
                            navigate(`/products/getproductsbyid/${section.id}`)
                          }
                          onError={(e) =>
                            (e.currentTarget.src = placeholderImage)
                          }
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.5 }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                          <button
                            className="bg-white hover:bg-gray-50 text-gray-800 font-medium px-6 py-3 rounded-lg transition-all shadow-md transform hover:scale-105"
                            onClick={() =>
                              navigate(
                                `/products/getproductsbyid/${section.id}`
                              )
                            }
                          >
                            Shop Now
                          </button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Right Product Carousel */}
                    <div className="md:col-span-2">
                      {section.products.length === 0 ? (
                        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 text-sm">
                              Loading products...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="rounded-xl overflow-hidden"
                        >
                          <ProductCarousel
                            products={section.products}
                            placeholderImage={placeholderImage}
                            showArrows={true}
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(Home);
