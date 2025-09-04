// src/context/CarouselContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

interface Slide {
  id: number;
  banner_url: string;
  category: string; // backend returns category name as "name AS category"
}

interface CarouselContextType {
  slides: Slide[];
  loading: boolean;
  fetchSlides: (categories?: string[]) => Promise<void>;
}

const CarouselContext = createContext<CarouselContextType>({
  slides: [],
  loading: false,
  fetchSlides: async () => {},
});

const API_BASE = "http://127.0.0.1:8000";

export const CarouselProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch carousel slides
  const fetchSlides = useCallback(async (categories?: string[]) => {
    setLoading(true);

    // Prepare URL based on optional categories
    const url = categories?.length
      ? `${API_BASE}/categories/carousel?categories=${encodeURIComponent(categories.join(","))}`
      : `${API_BASE}/categories/carousel`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to fetch carousel slides");

      // ✅ Our backend returns { slides: [...] }
      setSlides(data.slides || []);
    } catch (err: any) {
      console.error("❌ Carousel fetch failed:", err.message || err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all slides on first load
  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  return (
    <CarouselContext.Provider value={{ slides, loading, fetchSlides }}>
      {children}
    </CarouselContext.Provider>
  );
};

export const useCarousel = () => useContext(CarouselContext);
