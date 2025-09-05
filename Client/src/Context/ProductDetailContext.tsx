import React, { createContext, useContext, useState, useCallback } from "react";
import { getApiBaseUrl } from "../utils/api";

export type Product = {
  product_id: number;
  product_name: string;
  product_description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id?: number;
  sub_category_id?: number;
  // sub_category_name:string
};

interface ProductDetailContextType {
  product: Product | null;
  relatedProducts: Product[];
  loading: boolean;
  error: string;
  fetchProductDetail: (queryOrId: string, isSearch?: boolean) => Promise<void>;
  fetchSingleProduct: (productId:string)=>Promise<void>;
}

const ProductDetailContext = createContext<ProductDetailContextType>({
  product: null,
  relatedProducts: [],
  loading: false,
  error: "",
  fetchProductDetail: async () => {},
  fetchSingleProduct:async () => {},
});

const API_BASE:string = getApiBaseUrl();

export const ProductDetailProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProductDetail = useCallback(
    async (queryOrId: string, isSearch: boolean = false) => {
      setLoading(true);
      setError("");
      try {
        // 1) Search mode
        if (isSearch && queryOrId && queryOrId.trim()) {
          const response = await fetch(
            `${API_BASE}/products/search?keyword=${encodeURIComponent(
              queryOrId
            )}`
          );
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.detail || "Failed to search products");
          setProduct(null);

          setRelatedProducts(data.products || []);
          return;
        }

        // 2) Fetch by subcategory ID
        if (queryOrId && queryOrId.trim()) {
          const response = await fetch(
            `${API_BASE}/products/getproductsbyid/${encodeURIComponent(
              queryOrId
            )}`
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.detail || "Failed to fetch products by subcategory"
            );
          }
          const productsArray: Product[] = Array.isArray(data)
            ? data
            : data.products || [];
            
          setProduct(null);
          setRelatedProducts(productsArray);
          return;
        }

        // 3) Fetch all products
        const response = await fetch(`${API_BASE}/products/allproducts`);
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.detail || "Failed to fetch all products");
        const productsArray: Product[] = data.products || [];
        console.log(data.products);
        
        setProduct(null);
        setRelatedProducts(productsArray);
      } catch (err: any) {
        console.error("❌ Product fetch failed:", err);
        setError(err.message || "Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    },
    [] // no dependencies — stable reference
  );


  const fetchSingleProduct = useCallback(
  async (productId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/products/getproductbyid/${encodeURIComponent(productId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch product");
      }

      // If backend sends a single object
      setProduct(data.product || []); 
      
      setRelatedProducts(data.related_products || []);
    } catch (err: any) {
      console.error("❌ Single product fetch failed:", err);
      setError(err.message || "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  },
  []
);
  return (
    <ProductDetailContext.Provider
      value={{ product, relatedProducts, loading, error, fetchProductDetail,fetchSingleProduct }}
    >
      {children}
    </ProductDetailContext.Provider>
  );
};

export const useProductDetail = () => useContext(ProductDetailContext);
