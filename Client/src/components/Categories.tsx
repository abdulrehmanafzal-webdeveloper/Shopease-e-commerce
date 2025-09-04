import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { type CategorySection } from "../Context/ProductsContext";

interface CategoriesProps {
  loading: boolean;
  categories: CategorySection[];
  placeholderImage: string;
}

// Predefined background colors like Al-Fatah pattern
const categoryColors = [
  "bg-gradient-to-br from-[#FFE8C8] to-[#FFD8A8]",
  "bg-gradient-to-br from-[#D6F6D6] to-[#C0E8C0]",
  "bg-gradient-to-br from-[#FDDDE6] to-[#FCCCD5]",
  "bg-gradient-to-br from-[#FCE9E3] to-[#FAD9D0]",
  "bg-gradient-to-br from-[#DCE8F9] to-[#C9D9F5]",
  "bg-gradient-to-br from-[#EDE7F6] to-[#E0D6F2]",
];

const Categories = ({ loading, categories, placeholderImage }: CategoriesProps) => {
  const navigate = useNavigate();

  // Enhanced skeleton cards with gradient animation
  const SkeletonCard = () => (
    <div className="overflow-hidden rounded-2xl shadow-md relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-x-full animate-shimmer" />
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-56 w-full overflow-hidden">
        <div className="h-40 bg-gray-300/50 rounded-t-2xl" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-3/4 bg-gray-300/70 rounded" />
          <div className="h-3 w-1/2 bg-gray-300/50 rounded" />
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

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <motion.div
        className="text-center mb-10 md:mb-12"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Shop by Category
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our wide range of categories and find what you're looking
          for
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {loading || !categories.length
            ? // Show skeleton while loading OR when categories array is empty
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  variants={fadeInUp}
                  initial="hidden" // 👈 start from hidden state
                  animate="visible" // 👈 animate to visible state
                  exit="exit" // 👈 animate exit state when removed
                  transition={{ delay: i * 0.05 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
            : categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer transform transition-all duration-300"
                  variants={fadeInUp}
                  initial="hidden" // 👈 start from hidden state
                  animate="visible" // 👈 animate to visible state
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(`/categories/subcategories/${cat.id}`)
                  }
                >
                  <div
                    className={`${
                      categoryColors[index % categoryColors.length]
                    } h-full flex flex-col`}
                  >
                    <div className="p-4 sm:p-5 flex-1 flex flex-col items-center justify-center">
                      <div className="bg-white rounded-xl p-2 shadow-md mb-4 w-full overflow-hidden">
                        <div className="relative overflow-hidden rounded-lg aspect-w-4 aspect-h-3">
                          <img
                            src={cat.banner_url || placeholderImage}
                            alt={cat.name}
                            className="w-full h-48 sm:h-52 md:h-44 object-cover hover:scale-110 transition-transform duration-500 rounded-lg"
                            onError={(e) =>
                              (e.currentTarget.src = placeholderImage)
                            }
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2">
                          {cat.name}
                        </span>
                        <div className="mt-2 inline-block text-sm py-1 px-3 bg-white/70 rounded-full text-gray-700 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          Shop Now
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default memo(Categories);
