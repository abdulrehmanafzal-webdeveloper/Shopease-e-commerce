import { useState, useEffect, memo, useRef } from "react";
import { motion, AnimatePresence, useAnimation,type Variant } from "framer-motion";
import { useProducts } from "../Context/ProductsContext";
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause } from "react-icons/fa";

const placeholderImage = "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

// Define proper types for variants
interface AnimationVariants {
  enter: (dir: number) => Variant;
  center: Variant;
  exit: (dir: number) => Variant;
  [key: string]: any; // Add index signature for string keys
}

const Carousel: React.FC = () => {
  const { fetchCarouselSlides, loading } = useProducts();

  const [slides, setSlides] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const progressAnimation = useAnimation();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch slides on mount and limit to 10
  useEffect(() => {
    const loadSlides = async () => {
      const fetchedSlides = await fetchCarouselSlides();
      setSlides(fetchedSlides.slice(0, 10)); // Limit to 10 slides
    };
    loadSlides();
  }, [fetchCarouselSlides]);

  // Preload images
  useEffect(() => {
    slides.forEach((slide, idx) => {
      if (!slide.image_url) return;
      const img = new Image();
      img.src = slide.image_url;
      img.onload = () => setLoadedImages((prev) => ({ ...prev, [idx]: true }));
    });
  }, [slides]);

  // Auto-play with progress animation
  useEffect(() => {
    if (slides.length <= 1 || paused) {
      progressAnimation.stop();
      return;
    }
    
    progressAnimation.start({
      scaleX: [0, 1],
      transition: { duration: 4, ease: "linear" }
    });
    
    const timer = setTimeout(nextSlide, 4000);
    return () => clearTimeout(timer);
  }, [slides, current, paused, progressAnimation]);

  const nextSlide = () => {
    if (!slides.length) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (!slides.length) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    if (!slides.length || index === current) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Animation variants with proper typing
  const variants: AnimationVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0.5,
      scale: 0.95,
      zIndex: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
      transition: { duration: 0.5, type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0.5,
      scale: 0.95,
      zIndex: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    })
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="relative w-full overflow-hidden h-64 sm:h-80 md:h-96 lg:h-[450px] xl:h-[500px]  bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // No slides state
  if (!slides.length) {
    return (
      <div className="w-full overflow-hidden h-64 sm:h-80 md:h-96 lg:h-[450px] xl:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-center px-4">
          <svg 
            className="w-16 h-16 mx-auto mb-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No images available</p>
          <p className="text-sm mt-2">Check back later for new content</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[current];
  const currentLoaded = loadedImages[current] ?? false;

  return (
    <div
      ref={carouselRef}
      className="relative w-full overflow-hidden h-64 sm:h-80 md:h-96 lg:h-[450px] xl:h-[500px] shadow-xl group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/70 origin-left z-30"
        initial={{ scaleX: 0 }}
        animate={progressAnimation}
        key={current}
      />
      
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        {currentSlide && (
          <motion.div
            key={currentSlide.id ?? current}
            className="absolute inset-0 w-full h-full"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="relative w-full h-full overflow-hidden">
              {/* Loading skeleton */}
              {!currentLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
              )}
              
              {/* Actual image */}
              <img
                src={currentSlide.image_url || placeholderImage}
                alt={currentSlide.sub_category_name || "Sub Category"}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  currentLoaded ? "opacity-100" : "opacity-0"
                }`}
                onError={(e) => {
                  e.currentTarget.src = placeholderImage;
                  setLoadedImages((prev) => ({ ...prev, [current]: true }));
                }}
                loading="lazy"
              />
              
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Caption - adjusted bottom padding to prevent overlap with dots */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 pb-14 sm:p-6 sm:pb-16 md:p-8 md:pb-16 z-20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                key={`caption-${current}`}
              >
                <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 drop-shadow-lg line-clamp-2">
                  {currentSlide.sub_category_name || "Featured Category"}
                </h2>
                {currentSlide.description && (
                  <p className="text-white/90 text-sm md:text-base drop-shadow-md hidden sm:block line-clamp-2">
                    {currentSlide.description}
                  </p>
                )}
                {currentSlide.link && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-3 px-4 py-2 bg-white text-black rounded-lg font-medium text-sm md:text-base hover:bg-opacity-90 transition-all"
                  >
                    Explore Now
                  </motion.button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-2 md:p-4">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm text-white z-40 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous Slide"
        >
          <FaChevronLeft className="text-white" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm text-white z-40 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next Slide"
        >
          <FaChevronRight className="text-white" />
        </motion.button>
      </div>

      {/* Play/Pause button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setPaused(!paused)}
        className="absolute top-4 right-4 z-40 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={paused ? "Play slideshow" : "Pause slideshow"}
      >
        {paused ? <FaPlay size={12} /> : <FaPause size={12} />}
      </motion.button>

      {/* Dots navigation - improved z-index to ensure it's above caption */}
      <div className="absolute z-40 flex space-x-2 -translate-x-1/2 bottom-4 left-1/2">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goToSlide(i)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-white/50 shadow-md transition-all duration-300 ${
              i === current
                ? "bg-white scale-110 w-4 md:w-6"
                : "bg-white/40 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(Carousel);