
import React, { createContext, useContext, useState, useCallback } from "react";
import { getApiBaseUrl } from "../utils/api";

export interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  price: number;
  stock: number;
  image_url: string;
}

export interface CarouselSlide {
  id: number;
  image_url: string;
  sub_category_name: string;
}

export interface HomeSection {
  id: number; // subcategory id
  name: string; // subcategory name
  image_url: string;
  banner_url: string;
  category_id: number;
  category_name?: string;
  products: Product[];
  description: string;
}

export interface SubCategory {
  id: number;
  name: string;
  image_url: string;
  category_id: number;
  category_url: string;
}

export interface CategorySection {
  id: number;
  name: string;
  banner_url: string;
  description: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  image_url: string;
}

export interface Order {
  id: number;
  user_email: string;
  state: string;
  city: string;
  address: string;
  phone_number: string;
  payment_method: string;
  transaction_id?: string;
  card_last4?: string;
  order_date?: string;
  status?: string;
  items: OrderItem[];
}

export interface ProductsContextType {
  homeSections: HomeSection[];
  loading: boolean;
  error: string;
  fetchHomeSections: () => Promise<void>;
  fetchCarouselSlides: (categories?: string[]) => Promise<CarouselSlide[]>;
  fetchSubCategories: (categoryId: number) => Promise<SubCategory[]>;
  categories: CategorySection[];
  uploadImage: (
    file: File
  ) => Promise<{ success: boolean; url?: string; message: string }>;
  addProduct: (productData: {
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    sub_category_id: number;
  }) => Promise<{ success: boolean; message: string }>;

  // Admin functions
  addCategory: (categoryData: {
    name: string;
    description: string;
    banner_url: string;
  }) => Promise<{ success: boolean; message: string }>;
  deleteCategory: (categoryId: number) => Promise<{ success: boolean; message: string }>;
  deleteSubCategory: (subCategoryId: number) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (productId: number) => Promise<{ success: boolean; message: string }>;
  fetchAllCategories: () => Promise<CategorySection[]>;
  addSubCategory: (subCategoryData: {
    name: string;
    category_id: number;
    description: string;
    image_url: string;
  }) => Promise<{ success: boolean; message: string }>;
  fetchAllOrders: () => Promise<Order[]>;

  // User functions
  fetchUserProducts: () => Promise<Product[]>;
  deleteUserProduct: (productId: number) => Promise<{ success: boolean; message: string }>;
  updateProductStock: (productId: number, stock: number) => Promise<{ success: boolean; message: string }>;
  updateProduct: (productData: {
    product_id: number;
    product_name?: string;
    product_description?: string;
    price?: number;
    stock?: number;
    image_url?: string;
  }) => Promise<{ success: boolean; message: string }>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setcategories] = useState<CategorySection[]>([]);

  // Get token for authorization
  const getToken = () => localStorage.getItem("token");

  const API_BASE = getApiBaseUrl();
  const CATEGORY_BASE = `${API_BASE}/categories`;
  const PRODUCT_BASE = `${API_BASE}/products`;
  const ORDERS_BASE = `${API_BASE}/order`;

  // Fetch homepage dynamic sections
  const fetchHomeSections = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${CATEGORY_BASE}/home-sections?limit_subcats=10&products_per_subcat=20`
      );
      const res2 = await fetch(`${CATEGORY_BASE}/all`);
      const data = await res.json();
      const data2 = await res2.json();

      const mappedSections: HomeSection[] = (data.sections || []).map(
        (s: any) => ({
          id: s.id,
          name: s.name,
          image_url: s.image_url || "",
          banner_url: s.banner_url || "",
          category_id: s.category_id,
          category_name: s.category_name || "",
          description: s.description || "",
          products: (s.products || []).map((p: any) => ({
            product_id: p.product_id,
            product_name: p.product_name,
            product_description: p.description || "",
            price: p.price || 0,
            stock: p.stock || 0,
            image_url: p.image_url || "",
            category: p.category_name || "",
          })),
        })
      );
      
    

      const category_section: CategorySection[] = (data2.categories || []).map(
        (s: any) => ({
          id: s.id,
          name: s.name,
          banner_url: s.banner_url || "",
          description: s.description || "",
        })
      );
      setHomeSections(mappedSections);
      setcategories(category_section);
    } catch {
      setError("Failed to load home sections");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch carousel slides
  const fetchCarouselSlides = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/categories/carousel");
      const data = await res.json();
      const slides: CarouselSlide[] = (data.slides || []).map((s: any) => ({
        id: s.id,
        image_url: s.image_url || "",
        sub_category_name: s.sub_category_name || "",
      }));
      return slides;
    } catch {
      setError("Failed to load carousel slides");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subcategories for a given category
  const fetchSubCategories = useCallback(async (categoryId: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CATEGORY_BASE}/subcategories/${categoryId}`);
      const data = await res.json();

      const subcats: SubCategory[] = (data.subcategories || []).map(
        (sc: any) => ({
          id: sc.id,
          name: sc.name,
          image_url: sc.image_url || "",
          category_id: sc.category_id,
          category_url: sc.banner_url,
        })
      );

      return subcats;
    } catch {
      setError("Failed to load subcategories");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Product (Sell With Us form submit)
  const addProduct = useCallback(
    async (productData: {
      name: string;
      description: string;
      price: number;
      stock: number;
      image_url: string;
      sub_category_id: number;
    }) => {
      setLoading(true);
      setError("");
      console.log(productData);

      try {
        const token = getToken();
        const res = await fetch(`${PRODUCT_BASE}/enterproduct`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          throw new Error("Failed to add product");
        }

        return { success: true, message: "Product added successfully" };
      } catch (err) {
        setError("Failed to add product");
        return { success: false, message: "Error adding product" };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Upload Image (for Sell With Us form)
  const uploadImage = useCallback(
    async (
      file: File
    ): Promise<{ success: boolean; url?: string; message: string }> => {
      setLoading(true);
      setError("");
      try {
        const formData = new FormData();
        formData.append("file", file);
        const token = getToken();

        const res = await fetch(`${PRODUCT_BASE}/upload-image`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`, // required
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Backend response:", res.status, errorText);
          throw new Error("Image upload failed");
        }

        const data = await res.json();
        return {
          success: true,
          url: data.url,
          message: "Image uploaded successfully",
        };
      } catch (err) {
        setError("Failed to upload image");
        return { success: false, message: "Error uploading image" };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Admin functions
  const addCategory = async (categoryData: {
    name: string;
    description: string;
    banner_url: string;
  }) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${CATEGORY_BASE}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || "Failed to add category" };
      }

      return { success: true, message: "Category added successfully" };
    } catch (err) {
      console.error("Error adding category:", err);
      return { success: false, message: "An error occurred while adding category" };
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${PRODUCT_BASE}/deleteproduct/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || "Failed to delete product" };
      }

      return { success: true, message: "Product deleted successfully" };
    } catch (err) {
      console.error("Error deleting product:", err);
      return { success: false, message: "An error occurred while deleting product" };
    }
  };

  const fetchAllCategories = async () => {
    try {
      const response = await fetch(`${CATEGORY_BASE}/all`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      return data.categories || [];
    } catch (err) {
      console.error("Error fetching all categories:", err);
      return [];
    }
  };
  
  const deleteCategory = async (categoryId: number) => {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          message: "Authorization required",
        };
      }

      const res = await fetch(`${CATEGORY_BASE}/delete/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        return {
          success: false,
          message: errorData.detail || "Failed to delete category",
        };
      }

      return { success: true, message: "Category deleted successfully" };
    } catch (err) {
      return {
        success: false,
        message: "Error deleting category",
      };
    }
  };
  
  const deleteSubCategory = async (subCategoryId: number) => {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          message: "Authorization required",
        };
      }

      const res = await fetch(`${CATEGORY_BASE}/sub/delete/${subCategoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        return {
          success: false,
          message: errorData.detail || "Failed to delete subcategory",
        };
      }

      return { success: true, message: "Subcategory deleted successfully" };
    } catch (err) {
      return {
        success: false,
        message: "Error deleting subcategory",
      };
    }
  };

  const addSubCategory = async (subCategoryData: {
    name: string;
    category_id: number;
    description: string;
    image_url: string;
  }) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${CATEGORY_BASE}/sub/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subCategoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || "Failed to add subcategory" };
      }

      return { success: true, message: "Subcategory added successfully" };
    } catch (err) {
      console.error("Error adding subcategory:", err);
      return { success: false, message: "An error occurred while adding subcategory" };
    }
  };

  // User functions
  const fetchUserProducts = async () => {
  try {
    const role = localStorage.getItem("user_role");
    console.log(role);
    
    let url = `${PRODUCT_BASE}/allproducts`;

    // adjust URL based on role
    if (role === "user") {
      url = `${PRODUCT_BASE}/allproducts/${localStorage.getItem("user_id")}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();


    return data.products || [];
  } catch (err) {
    console.error("Error fetching user products:", err);
    return [];
  }
};


  const deleteUserProduct = async (productId: number) => {
    return deleteProduct(productId); // Reuse the deleteProduct function
  };

  const updateProductStock = async (productId: number, stock: number) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      // Get current product details
      const productResponse = await fetch(`${PRODUCT_BASE}/getproductbyid/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!productResponse.ok) {
        return { success: false, message: "Failed to fetch product details" };
      }

      const productData = await productResponse.json();
      const product = productData.product;

      if (!product) {
        return { success: false, message: "Product not found" };
      }

      // Update the product with new stock
      const updateData = {
        product_id: productId,
        price: product.price,
        stock: stock,
        image_url: product.image_url,
        sub_category_id: product.sub_category_id,
      };

      const response = await fetch(`${PRODUCT_BASE}/updateproduct`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || "Failed to update product stock" };
      }

      return { success: true, message: "Product stock updated successfully" };
    } catch (err) {
      console.error("Error updating product stock:", err);
      return { success: false, message: "An error occurred while updating product stock" };
    }
  };
  
  const updateProduct = async (productData: {
    product_id: number;
    product_name?: string;
    product_description?: string;
    price?: number;
    stock?: number;
    image_url?: string;
  }) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      // Get current product details to preserve unchanged fields
      const productResponse = await fetch(`${PRODUCT_BASE}/getproductbyid/${productData.product_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!productResponse.ok) {
        return { success: false, message: "Failed to fetch product details" };
      }

      const currentProductData = await productResponse.json();
      const currentProduct = currentProductData.product;

      if (!currentProduct) {
        return { success: false, message: "Product not found" };
      }

      // Merge current data with updates
      const updateData = {
        product_id: productData.product_id,
        price: productData.price !== undefined ? productData.price : currentProduct.price,
        stock: productData.stock !== undefined ? productData.stock : currentProduct.stock,
        image_url: productData.image_url || currentProduct.image_url,
        sub_category_id: currentProduct.sub_category_id,
        // Additional field updates for the new API
        product_name: productData.product_name || currentProduct.product_name,
        product_description: productData.product_description || currentProduct.product_description
      };

      const response = await fetch(`${PRODUCT_BASE}/updateproduct`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || "Failed to update product" };
      }

      return { success: true, message: "Product updated successfully" };
    } catch (err) {
      console.error("Error updating product:", err);
      return { success: false, message: "An error occurred while updating the product" };
    }
  };

  // Admin - fetch all orders
  const fetchAllOrders = useCallback(async (): Promise<Order[]> => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        return [];
      }

      const res = await fetch(`${ORDERS_BASE}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch orders");
      }

      const data = await res.json();
      console.log(data.orders);
      
      return data as Order[];
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        homeSections,
        loading,
        error,
        fetchHomeSections,
        fetchCarouselSlides,
        fetchSubCategories,
        categories,
        addProduct,
        uploadImage,
        addCategory,
        deleteProduct,
        deleteCategory,
        deleteSubCategory,
        fetchAllCategories,
        addSubCategory,
        fetchUserProducts,
        deleteUserProduct,
        updateProductStock,
        updateProduct,
        fetchAllOrders,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

// Custom hook
export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductsProvider");
  return ctx;
};
