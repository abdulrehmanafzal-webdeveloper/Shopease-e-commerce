import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../Context/AuthContext";
import { useProducts } from "../Context/ProductsContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AdminOrders from "./AdminOrders";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaList,
  FaBox,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaShoppingBag,
  FaCog,
  FaStore,
  FaTag,
  FaShoppingCart,
  FaChartLine,
  FaUpload,
  FaListAlt,
  FaChevronRight,
  FaImage,
  FaExclamationTriangle,
  FaClock,
  FaFolder,
  FaLayerGroup,
} from "react-icons/fa";

import { getApiBaseUrl } from "../utils/api";

interface ProfileForm {
  name: string;
  email: string;
  password: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  price: number;
  stock: number;
  image_url: string;
  category_name?: string;
}

interface SubCategory {
  id: number;
  name: string;
  image_url: string;
  category_id: number;
  description?: string;
}

const passwordRules = [
  { regex: /.{8,}/, message: "At least 8 characters" },
  { regex: /[A-Z].*[A-Z].*[A-Z]/, message: "At least 3 uppercase letters" },
  { regex: /[a-z].*[a-z]/, message: "At least 2 lowercase letters" },
  {
    regex: /[^A-Za-z0-9].*[^A-Za-z0-9]/,
    message: "At least 2 special characters",
  },
];

const Profile: React.FC = () => {
  const { updateUser, deleteUser, logoutUser, userRole } = useAuth();
  const {
    addCategory,
    deleteCategory,
    deleteSubCategory,
    deleteProduct,
    fetchAllCategories,
    addSubCategory,
    fetchUserProducts,
    updateProductStock,
    updateProduct,
    uploadImage,
  } = useProducts();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Admin states
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    banner_url: "",
  });
  const [newSubCategory, setNewSubCategory] = useState({
    name: "",
    category_id: 0,
    description: "",
    image_url: "",
  });
  const [categoryFile, setCategoryFile] = useState<File | null>(null);
  const [categoryPreview, setCategoryPreview] = useState<string | null>(null);
  const [subCategoryFile, setSubCategoryFile] = useState<File | null>(null);
  const [subCategoryPreview, setSubCategoryPreview] = useState<string | null>(
    null
  );
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{
    type: string;
    text: string;
  } | null>(null);

  // User product states
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [editingStock, setEditingStock] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [stockValues, setStockValues] = useState<{ [key: number]: number }>({});
  const [editingProductName, setEditingProductName] = useState<{
    [key: number]: boolean;
  }>({});
  const [productNameValues, setProductNameValues] = useState<{
    [key: number]: string;
  }>({});
  const [editingProductPrice, setEditingProductPrice] = useState<{
    [key: number]: boolean;
  }>({});
  const [productPriceValues, setProductPriceValues] = useState<{
    [key: number]: number;
  }>({});
  const [userProductsLoading, setUserProductsLoading] = useState(false);
  const [userProductsMessage, setUserProductsMessage] = useState<{
    type: string;
    text: string;
  } | null>(null);

  const originalValues = {
    name: localStorage.getItem("user_name") || "",
    email: localStorage.getItem("user_email") || "",
    password: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileForm>({
    defaultValues: originalValues,
  });

  // Cancel handler
  const handleCancel = () => {
    reset(originalValues);
    setIsEditing(false);
    setShowPassword(false);
  };

  // Handle file uploads for categories and subcategories - functions defined below

  const passwordValue = watch("password", "");

  // Load admin/user data on role change
  useEffect(() => {
    if (userRole === "admin") {
      loadCategories();
      loadUserProducts();
    } else if (userRole === "user") {
      loadUserProducts();
    }
  }, [userRole]);

  const loadCategories = async () => {
    setAdminLoading(true);
    try {
      const categoriesData = await fetchAllCategories();
      setCategories(categoriesData);
    } catch {
      setAdminMessage({ type: "error", text: "Failed to load categories" });
    } finally {
      setAdminLoading(false);
    }
  };

  const loadUserProducts = async () => {
    setUserProductsLoading(true);
    try {
      const products: Product[] = await fetchUserProducts();

      // Filter out any null or undefined products and ensure all required fields exist
      const validProducts = (products || []).filter(
        (product) =>
          product.product_id &&
          product.product_name &&
          product.price !== undefined &&
          product.stock !== undefined
      );
      setUserProducts(validProducts);
    } catch (error) {
      console.error("Error loading user products:", error);
      setUserProductsMessage({
        type: "error",
        text: "Failed to load user products",
      });
    } finally {
      setUserProductsLoading(false);
    }
  };

  if (!localStorage.getItem("user_email")) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ProfileForm) => {
    const { ok } = await updateUser(data);
    if (ok) {
      reset({ ...data, password: "" });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    const { ok } = await deleteUser(localStorage.getItem("user_id") || "");
    if (ok) {
      logoutUser();
      navigate("/register");
    }
  };

  // Admin functions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage(null);

    try {
      // First upload the image if there is one
      let bannerUrl = newCategory.banner_url;

      if (categoryFile) {
        const uploadResult = await uploadImage(categoryFile);
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(
            uploadResult.message || "Failed to upload category banner image"
          );
        }
        bannerUrl = uploadResult.url;
      } else if (!newCategory.banner_url) {
        setAdminMessage({
          type: "error",
          text: "Please upload a banner image or provide a URL",
        });
        setAdminLoading(false);
        return;
      }

      const result = await addCategory({
        ...newCategory,
        banner_url: bannerUrl,
      });

      if (result.success) {
        setAdminMessage({
          type: "success",
          text: "Category added successfully",
        });
        setNewCategory({ name: "", description: "", banner_url: "" });
        setCategoryFile(null);
        setCategoryPreview(null);
        await loadCategories();
      } else {
        setAdminMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setAdminMessage({ type: "error", text: "Failed to add category" });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage(null);

    try {
      // First upload the image if there is one
      let imageUrl = newSubCategory.image_url;

      if (subCategoryFile) {
        const uploadResult = await uploadImage(subCategoryFile);
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(
            uploadResult.message || "Failed to upload subcategory image"
          );
        }
        imageUrl = uploadResult.url;
      } else if (!newSubCategory.image_url) {
        setAdminMessage({
          type: "error",
          text: "Please upload an image or provide a URL",
        });
        setAdminLoading(false);
        return;
      }

      const result = await addSubCategory({
        ...newSubCategory,
        image_url: imageUrl,
      });

      if (result.success) {
        setAdminMessage({
          type: "success",
          text: "Subcategory added successfully",
        });
        setNewSubCategory({
          name: "",
          category_id: 0,
          description: "",
          image_url: "",
        });
        setSubCategoryFile(null);
        setSubCategoryPreview(null);
        await loadCategories();
      } else {
        setAdminMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      console.error("Error adding subcategory:", error);
      setAdminMessage({ type: "error", text: "Failed to add subcategory" });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    setAdminLoading(true);
    setAdminMessage(null);

    try {
      const result = await deleteCategory(categoryId);

      if (result.success) {
        setAdminMessage({
          type: "success",
          text: "Category deleted successfully",
        });
        await loadCategories();
      } else {
        setAdminMessage({
          type: "error",
          text:
            result.message ||
            "Failed to delete category. It may contain subcategories or products.",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setAdminMessage({
        type: "error",
        text: "Failed to delete category. Make sure it does not contain any subcategories or products.",
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this subcategory? This action cannot be undone."
      )
    ) {
      return;
    }

    setAdminLoading(true);
    setAdminMessage(null);

    try {
      const result = await deleteSubCategory(subCategoryId);

      if (result.success) {
        setAdminMessage({
          type: "success",
          text: "Subcategory deleted successfully",
        });
        await loadCategories();
      } else {
        setAdminMessage({
          type: "error",
          text:
            result.message ||
            "Failed to delete subcategory. It may contain products.",
        });
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      setAdminMessage({
        type: "error",
        text: "Failed to delete subcategory. Make sure it does not contain any products.",
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number, product: any) => {
    // Check if the user owns this product
    if (!isProductOwner(product)) {
      setUserProductsMessage({
        type: "error",
        text: "You can only delete your own products",
      });
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this product? Note: This product may be in users' carts or order history."
      )
    )
      return;

    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        setTimeout(() => {
          setUserProductsMessage({
            type: "success",
            text: "Product deleted successfully. Users with this product in their cart or orders will see it as 'Product no longer available'.",
          });
        }, 1500);
        await loadUserProducts();
      } else {
        setUserProductsMessage({
          type: "error",
          text: result.message || "Failed to delete product",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setUserProductsMessage({
        type: "error",
        text: "Failed to delete product",
      });
    }
  };

  const handleStockEdit = (
    productId: number,
    currentStock: number,
    product?: any
  ) => {
    // If product is not provided, look it up from userProducts
    if (!product) {
      product = userProducts.find((p) => p.product_id === productId);
    }

    // Only allow editing if the user owns this product
    if (product && isProductOwner(product)) {
      setEditingStock((prev) => ({ ...prev, [productId]: true }));
      setStockValues((prev) => ({ ...prev, [productId]: currentStock }));
    } else {
      setUserProductsMessage({
        type: "error",
        text: "You can only edit your own products",
      });
    }
  };

  const handleProductNameEdit = (
    productId: number,
    currentName: string,
    product?: any
  ) => {
    // If product is not provided, look it up from userProducts
    if (!product) {
      product = userProducts.find((p) => p.product_id === productId);
    }

    // Only allow editing if the user owns this product
    if (product && isProductOwner(product)) {
      setEditingProductName((prev) => ({ ...prev, [productId]: true }));
      setProductNameValues((prev) => ({ ...prev, [productId]: currentName }));
    } else {
      setUserProductsMessage({
        type: "error",
        text: "You can only edit your own products",
      });
    }
  };

  const handleProductPriceEdit = (
    productId: number,
    currentPrice: number,
    product?: any
  ) => {
    // If product is not provided, look it up from userProducts
    if (!product) {
      product = userProducts.find((p) => p.product_id === productId);
    }

    // Only allow editing if the user owns this product
    if (product && isProductOwner(product)) {
      setEditingProductPrice((prev) => ({ ...prev, [productId]: true }));
      setProductPriceValues((prev) => ({ ...prev, [productId]: currentPrice }));
    } else {
      setUserProductsMessage({
        type: "error",
        text: "You can only edit your own products",
      });
    }
  };

  const handleStockSave = async (productId: number) => {
    try {
      const stockValue = stockValues[productId];
      if (stockValue < 0) {
        setUserProductsMessage({
          type: "error",
          text: "Stock cannot be negative",
        });
        return;
      }

      const result = await updateProductStock(productId, stockValue);
      if (result.success) {
        setUserProductsMessage({
          type: "success",
          text: "Stock updated successfully",
        });
        setEditingStock((prev) => ({ ...prev, [productId]: false }));
        await loadUserProducts();
      } else {
        setUserProductsMessage({
          type: "error",
          text: result.message || "Failed to update stock",
        });
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      setUserProductsMessage({ type: "error", text: "Failed to update stock" });
    }
  };

  const handleProductNameSave = async (productId: number) => {
    try {
      const nameValue = productNameValues[productId];
      if (!nameValue || nameValue.trim() === "") {
        setUserProductsMessage({
          type: "error",
          text: "Product name cannot be empty",
        });
        return;
      }

      const result = await updateProduct({
        product_id: productId,
        product_name: nameValue,
      });

      if (result.success) {
        setTimeout(() => {
          setUserProductsMessage({
            type: "success",
            text: "Product name updated successfully",
          });
        }, 1000);

        setEditingProductName((prev) => ({ ...prev, [productId]: false }));
        await loadUserProducts();
      } else {
        setUserProductsMessage({
          type: "error",
          text: result.message || "Failed to update product name",
        });
      }
    } catch (error) {
      console.error("Error updating product name:", error);
      setUserProductsMessage({
        type: "error",
        text: "Failed to update product name",
      });
    }
  };

  const handleProductPriceSave = async (productId: number) => {
    try {
      const priceValue = productPriceValues[productId];
      if (priceValue <= 0) {
        setUserProductsMessage({
          type: "error",
          text: "Price must be greater than zero",
        });
        return;
      }

      const result = await updateProduct({
        product_id: productId,
        price: priceValue,
      });

      if (result.success) {
        setUserProductsMessage({
          type: "success",
          text: "Product price updated successfully",
        });
        setEditingProductPrice((prev) => ({ ...prev, [productId]: false }));
        await loadUserProducts();
      } else {
        setUserProductsMessage({
          type: "error",
          text: result.message || "Failed to update product price",
        });
      }
    } catch (error) {
      console.error("Error updating product price:", error);
      setUserProductsMessage({
        type: "error",
        text: "Failed to update product price",
      });
    }
  };

  // Helper function to check if a product belongs to the current user
  const isProductOwner = (product: any) => {
    if (!product || !product.user_id) return false;

    // Get user ID from context if available, or from localStorage as fallback
    const currentUserId = parseInt(localStorage.getItem("user_id") || "0");
    console.log("Current User ID:", currentUserId);
    return product.user_id === currentUserId;
  };

  // File upload handlers for categories and subcategories
  const handleCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setCategoryFile(null);
      setCategoryPreview(null);
      return;
    }

    setCategoryFile(selectedFile);
    setCategoryPreview(URL.createObjectURL(selectedFile));
  };

  const handleCategoryFileRemove = () => {
    setCategoryFile(null);
    setCategoryPreview(null);
    const input = document.getElementById(
      "categoryFileUpload"
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleSubCategoryFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setSubCategoryFile(null);
      setSubCategoryPreview(null);
      return;
    }

    setSubCategoryFile(selectedFile);
    setSubCategoryPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubCategoryFileRemove = () => {
    setSubCategoryFile(null);
    setSubCategoryPreview(null);
    const input = document.getElementById(
      "subCategoryFileUpload"
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  // Function to render edit buttons only if user owns the product
  const renderEditButton = (product: any, onClickFn: () => void) => {
    if (isProductOwner(product)) {
      return (
        <motion.button
          onClick={onClickFn}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="ml-2 text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          <FaEdit className="text-xs" />
        </motion.button>
      );
    }
    return null;
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  // Determine tabs based on role
  const getTabs = () => {
    const baseTabs = ["profile", "orders", "settings"];
    if (userRole === "admin") {
      return [...baseTabs, "admin-categories", "admin-products"];
    } else if (userRole === "user") {
      return [...baseTabs, "my-products"];
    }
    return baseTabs;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            My Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your profile, orders, and preferences
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <motion.div
            className="lg:w-1/4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/30"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {localStorage.getItem("user_name")?.charAt(0).toUpperCase()}
                </motion.div>
                <motion.div
                  className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white text-center">
                {localStorage.getItem("user_name")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 text-center">
                {localStorage.getItem("user_email")}
              </p>
              {userRole && (
                <motion.span
                  className="mt-3 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-medium shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
                </motion.span>
              )}
            </div>

            <div className="space-y-2">
              {getTabs().map((item) => (
                <motion.button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-4 py-3 rounded-xl capitalize flex items-center justify-between transition-all duration-200 ${
                    activeTab === item
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3 bg-white/20 dark:bg-gray-700/50 p-2 rounded-lg">
                      {item === "profile" && (
                        <FaUser className="text-sm text-indigo-500" />
                      )}
                      {item === "orders" && (
                        <FaShoppingBag className="text-sm text-purple-500" />
                      )}
                      {item === "settings" && (
                        <FaCog className="text-sm text-gray-500" />
                      )}
                      {item === "admin-categories" && (
                        <FaTag className="text-sm text-green-500" />
                      )}
                      {item === "admin-products" && (
                        <FaStore className="text-sm text-blue-500" />
                      )}
                      {item === "my-products" && (
                        <FaShoppingCart className="text-sm text-orange-500" />
                      )}
                    </span>
                    <span className="font-medium">
                      {item.replace("-", " ")}
                    </span>
                  </div>
                  <FaChevronRight
                    className={`text-xs transition-transform ${
                      activeTab === item ? "rotate-90" : ""
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 w-full border border-white/20 dark:border-gray-700/30"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                        <FaUser className="text-indigo-500" />
                      </div>
                      Personal Information
                    </h2>
                    {!isEditing && (
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium shadow-md transition-all duration-200 flex items-center"
                      >
                        <FaEdit className="mr-2 text-sm" />
                        Edit Profile
                      </motion.button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          {...register("name", {
                            required: "Full name is required",
                            minLength: {
                              value: 3,
                              message: "Name must be at least 3 characters",
                            },
                          })}
                          placeholder="Full Name"
                          readOnly={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 ${
                            !isEditing
                              ? "bg-gray-100/50 dark:bg-gray-700/50 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800"
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FaExclamationTriangle className="mr-1 text-xs" />
                          {errors.name.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Enter a valid email",
                            },
                          })}
                          type="email"
                          placeholder="Email Address"
                          readOnly={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 ${
                            !isEditing
                              ? "bg-gray-100/50 dark:bg-gray-700/50 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FaExclamationTriangle className="mr-1 text-xs" />
                          {errors.email.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          {...register("password", {
                            validate: {
                              strength: (value) =>
                                value === "" ||
                                passwordRules.every((rule) =>
                                  rule.regex.test(value)
                                ) ||
                                "Password does not meet strength requirements",
                            },
                          })}
                          type={showPassword ? "text" : "password"}
                          placeholder="New Password"
                          readOnly={!isEditing}
                          className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 ${
                            !isEditing
                              ? "bg-gray-100/50 dark:bg-gray-700/50 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800"
                          }`}
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        )}
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FaExclamationTriangle className="mr-1 text-xs" />
                          {errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Password Rules */}
                    {isEditing && passwordValue && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2 text-sm mb-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border"
                      >
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password Requirements:
                        </p>
                        {passwordRules.map((rule, idx) => {
                          const valid = rule.regex.test(passwordValue);
                          return (
                            <motion.p
                              key={idx}
                              className={`flex items-center ${
                                valid ? "text-green-600" : "text-red-500"
                              }`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              {valid ? (
                                <FaCheck className="mr-2 text-green-500 text-xs" />
                              ) : (
                                <FaTimes className="mr-2 text-red-500 text-xs" />
                              )}
                              {rule.message}
                            </motion.p>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* Buttons */}
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row gap-3 mt-8"
                      >
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex-1 py-3 rounded-xl font-medium shadow-md transition-all flex items-center justify-center ${
                            isSubmitting
                              ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                          }`}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            <>
                              <FaCheck className="mr-2 text-sm" />
                              Save Changes
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleCancel}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium shadow-md transition-colors flex items-center justify-center"
                        >
                          <FaTimes className="mr-2 text-sm" />
                          Cancel
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleDelete}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-md transition-all flex items-center justify-center"
                        >
                          <FaTrash className="mr-2 text-sm" />
                          Delete Account
                        </motion.button>
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {userRole === "admin" ? (
                    <AdminOrders />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 text-center max-w-md border border-indigo-100 dark:border-gray-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
                          <FaShoppingBag className="text-2xl text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                          Order History
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Your order history will appear here once you start
                          shopping. Start exploring our products to make your
                          first purchase!
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate("/products")}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium shadow-md transition-all flex items-center mx-auto"
                        >
                          <FaShoppingBag className="mr-2" />
                          Start Shopping
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 text-center max-w-md border border-indigo-100 dark:border-gray-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                      <FaCog className="text-2xl text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                      Account Settings
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Customize your account preferences, notification settings,
                      and privacy options here.
                    </p>
                    <div className="space-y-3 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium shadow-sm transition-all text-gray-700 dark:text-gray-200 flex items-center justify-center"
                      >
                        Notification Preferences
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium shadow-sm transition-all text-gray-700 dark:text-gray-200 flex items-center justify-center"
                      >
                        Privacy Settings
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium shadow-sm transition-all text-gray-700 dark:text-gray-200 flex items-center justify-center"
                      >
                        Language & Region
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {userRole === "admin" && activeTab === "admin-categories" && (
                <motion.div
                  key="admin-categories"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                      <FaTag className="text-green-500" />
                    </div>
                    Manage Categories
                  </h2>

                  {/* Add Category Form */}
                  <motion.div
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 mb-8 shadow-md border border-indigo-100 dark:border-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {adminMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-4 rounded-xl text-sm flex items-center ${
                          adminMessage.type === "success"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {adminMessage.type === "success" ? (
                          <FaCheck className="mr-2 text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="mr-2 text-red-500" />
                        )}
                        {adminMessage.text}
                      </motion.div>
                    )}
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                      <FaPlus className="mr-2 text-green-500" />
                      Add New Category
                    </h3>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newCategory.description}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Banner Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-all duration-300 relative bg-white dark:bg-gray-800 group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCategoryFileChange}
                            className="hidden"
                            id="categoryFileUpload"
                          />

                          {categoryPreview ? (
                            <div className="relative w-full">
                              <img
                                src={categoryPreview}
                                alt="Banner Preview"
                                className="w-full h-40 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <button
                                type="button"
                                onClick={handleCategoryFileRemove}
                                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                              >
                                <FaTimes className="text-red-500 text-sm" />
                              </button>
                              <p className="text-sm text-gray-500 mt-2">
                                Click to change image
                              </p>
                            </div>
                          ) : (
                            <label
                              htmlFor="categoryFileUpload"
                              className="cursor-pointer block w-full h-full"
                            >
                              <div className="flex flex-col items-center justify-center py-4">
                                <FaUpload className="text-indigo-500 text-3xl mb-3" />
                                <p className="text-gray-600 font-medium">
                                  Click to upload banner image
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                  JPG, PNG up to 5MB
                                </p>
                              </div>
                            </label>
                          )}
                        </div>

                        {!categoryFile && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Or provide a Banner URL
                            </label>
                            <input
                              type="text"
                              value={newCategory.banner_url}
                              onChange={(e) =>
                                setNewCategory({
                                  ...newCategory,
                                  banner_url: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              placeholder="https://example.com/banner.jpg"
                            />
                          </div>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        disabled={adminLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center w-full"
                      >
                        {adminLoading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Adding...
                          </span>
                        ) : (
                          <>
                            <FaPlus className="mr-2" />
                            Add Category
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>

                  {/* Add Subcategory Form */}
                  <motion.div
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 mb-8 shadow-md border border-indigo-100 dark:border-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                      <FaPlus className="mr-2 text-purple-500" />
                      Add New Subcategory
                    </h3>
                    <form onSubmit={handleAddSubCategory} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subcategory Name
                        </label>
                        <input
                          type="text"
                          value={newSubCategory.name}
                          onChange={(e) =>
                            setNewSubCategory({
                              ...newSubCategory,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Parent Category
                        </label>
                        <select
                          value={newSubCategory.category_id}
                          onChange={(e) =>
                            setNewSubCategory({
                              ...newSubCategory,
                              category_id: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                        >
                          <option value={0}>Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newSubCategory.description}
                          onChange={(e) =>
                            setNewSubCategory({
                              ...newSubCategory,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subcategory Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-all duration-300 relative bg-white dark:bg-gray-800 group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSubCategoryFileChange}
                            className="hidden"
                            id="subCategoryFileUpload"
                          />

                          {subCategoryPreview ? (
                            <div className="relative w-full">
                              <img
                                src={subCategoryPreview}
                                alt="Subcategory Preview"
                                className="w-full h-40 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <button
                                type="button"
                                onClick={handleSubCategoryFileRemove}
                                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                              >
                                <FaTimes className="text-red-500 text-sm" />
                              </button>
                              <p className="text-sm text-gray-500 mt-2">
                                Click to change image
                              </p>
                            </div>
                          ) : (
                            <label
                              htmlFor="subCategoryFileUpload"
                              className="cursor-pointer block w-full h-full"
                            >
                              <div className="flex flex-col items-center justify-center py-4">
                                <FaUpload className="text-indigo-500 text-3xl mb-3" />
                                <p className="text-gray-600 font-medium">
                                  Click to upload subcategory image
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                  JPG, PNG up to 5MB
                                </p>
                              </div>
                            </label>
                          )}
                        </div>

                        {!subCategoryFile && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Or provide an Image URL
                            </label>
                            <input
                              type="text"
                              value={newSubCategory.image_url}
                              onChange={(e) =>
                                setNewSubCategory({
                                  ...newSubCategory,
                                  image_url: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        disabled={adminLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center w-full"
                      >
                        {adminLoading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Adding...
                          </span>
                        ) : (
                          <>
                            <FaPlus className="mr-2" />
                            Add Subcategory
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>

                  {/* Existing Categories List */}
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                      <FaList className="mr-2 text-indigo-500" />
                      Existing Categories
                    </h3>
                    {adminLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <motion.div
                            key={`category-skeleton-${index}`}
                            className="border rounded-xl p-4 shadow-md bg-white dark:bg-gray-700 overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <div className="flex flex-col space-y-4">
                              <div className="w-full h-40 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                              <div className="space-y-2">
                                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
                              </div>
                              <div className="flex justify-between pt-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : categories.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No categories found.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                          <motion.div
                            key={category.id}
                            className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-700 flex flex-col"
                            whileHover={{ y: -5, scale: 1.02 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 100 }}
                          >
                            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800">
                              {category.banner_url ? (
                                <img
                                  src={
                                    category.banner_url
                                      ? category.banner_url.startsWith("http")
                                        ? category.banner_url
                                        : `${getApiBaseUrl}${category.banner_url}`
                                      : ""
                                  }
                                  alt={category.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://via.placeholder.com/400x200?text=No+Image";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                  <FaImage className="text-4xl text-gray-400" />
                                </div>
                              )}
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <motion.button
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="ml-auto bg-white text-red-500 p-2 rounded-full shadow-lg hover:bg-red-50"
                                >
                                  <FaTrash className="text-sm" />
                                </motion.button>
                              </div>
                            </div>

                            <div className="p-5 flex-grow">
                              <div className="flex flex-col">
                                <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">
                                  {category.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                  {category.description ||
                                    "No description provided"}
                                </p>
                              </div>

                              <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-600">
                                {category.subcategories &&
                                  category.subcategories.length > 0 && (
                                    <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                      <FaFolder className="mr-1 text-xs" />
                                      {category.subcategories.length}{" "}
                                      subcategories
                                    </div>
                                  )}
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <FaClock className="mr-1" /> Last updated
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* List of Subcategories */}
                  <motion.div
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 mt-8 shadow-md border border-indigo-100 dark:border-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                      <FaListAlt className="mr-2 text-purple-500" />
                      All Subcategories
                    </h3>

                    {adminLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <motion.div
                            key={`subcategory-skeleton-${index}`}
                            className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-700 flex flex-col"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
                            <div className="p-5">
                              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6 mb-2 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6 mb-4 animate-pulse"></div>
                              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-600 flex items-center justify-between">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full w-24 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : categories.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No subcategories found.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.flatMap((category) =>
                          (category.subcategories || []).map(
                            (subcategory: SubCategory) => (
                              <motion.div
                                key={subcategory.id}
                                className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-700 flex flex-col"
                                whileHover={{ y: -5, scale: 1.02 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                              >
                                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800">
                                  {subcategory.image_url ? (
                                    <img
                                    // do the same thing for this src attribute as we done on top
                                      src={subcategory.image_url?subcategory.image_url.startsWith("http")
                                        ? subcategory.image_url
                                        : `${getApiBaseUrl}${subcategory.image_url}`:""}
                                      alt={subcategory.name}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "https://via.placeholder.com/400x200?text=No+Image";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30">
                                      <FaImage className="text-4xl text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <motion.button
                                      onClick={() =>
                                        handleDeleteSubCategory(subcategory.id)
                                      }
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="ml-auto bg-white text-red-500 p-2 rounded-full shadow-lg hover:bg-red-50"
                                    >
                                      <FaTrash className="text-sm" />
                                    </motion.button>
                                  </div>
                                </div>

                                <div className="p-5 flex-grow">
                                  <div className="flex flex-col">
                                    <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">
                                      {subcategory.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                      {subcategory.description ||
                                        "No description provided"}
                                    </p>
                                  </div>

                                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-600">
                                    <span className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-300 text-xs rounded-full font-medium">
                                      {category.name}
                                    </span>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                      <FaLayerGroup className="mr-1" />{" "}
                                      Subcategory
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          )
                        )}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {userRole === "admin" && activeTab === "admin-products" && (
                <motion.div
                  key="admin-products"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                      <FaStore className="text-blue-500" />
                    </div>
                    Manage Products
                  </h2>

                  <motion.div
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-md border border-indigo-100 dark:border-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                      <FaChartLine className="mr-2 text-green-500" />
                      All Products
                    </h3>
                    {userProductsMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-4 rounded-xl text-sm flex items-center ${
                          userProductsMessage.type === "success"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {userProductsMessage.type === "success" ? (
                          <FaCheck className="mr-2 text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="mr-2 text-red-500" />
                        )}
                        {userProductsMessage.text}
                      </motion.div>
                    )}
                    {userProductsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : userProducts.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No products found.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userProducts.map((product) => (
                          <motion.div
                            key={product.product_id}
                            className="border rounded-xl p-4 hover:shadow-lg transition-all duration-300 group bg-white dark:bg-gray-700"
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                {/* Product Name (Editable) */}
                                {editingProductName[product.product_id] ? (
                                  <div className="mb-2">
                                    <input
                                      type="text"
                                      value={
                                        productNameValues[product.product_id] ||
                                        product.product_name
                                      }
                                      onChange={(e) =>
                                        setProductNameValues({
                                          ...productNameValues,
                                          [product.product_id]: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <div className="flex space-x-1 mt-2">
                                      <motion.button
                                        onClick={() =>
                                          handleProductNameSave(
                                            product.product_id
                                          )
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                      >
                                        <FaCheck className="text-sm" />
                                      </motion.button>
                                      <motion.button
                                        onClick={() =>
                                          setEditingProductName({
                                            ...editingProductName,
                                            [product.product_id]: false,
                                          })
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <FaTimes className="text-sm" />
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <h4 className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-500 transition-colors">
                                      {product.product_name}
                                    </h4>
                                    <motion.button
                                      onClick={() =>
                                        handleProductNameEdit(
                                          product.product_id,
                                          product.product_name
                                        )
                                      }
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="ml-2 text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    >
                                      <FaEdit className="text-xs" />
                                    </motion.button>
                                  </div>
                                )}

                                {/* Price (Editable) */}
                                {editingProductPrice[product.product_id] ? (
                                  <div className="mt-3">
                                    <div className="flex items-center">
                                      <span className="text-sm mr-2">$</span>
                                      <input
                                        type="number"
                                        value={
                                          productPriceValues[
                                            product.product_id
                                          ] || product.price
                                        }
                                        onChange={(e) =>
                                          setProductPriceValues({
                                            ...productPriceValues,
                                            [product.product_id]:
                                              parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        step="0.01"
                                        min="0"
                                        className="w-24 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div className="flex space-x-1 mt-2">
                                      <motion.button
                                        onClick={() =>
                                          handleProductPriceSave(
                                            product.product_id
                                          )
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                      >
                                        <FaCheck className="text-sm" />
                                      </motion.button>
                                      <motion.button
                                        onClick={() =>
                                          setEditingProductPrice({
                                            ...editingProductPrice,
                                            [product.product_id]: false,
                                          })
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <FaTimes className="text-sm" />
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center mt-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      $
                                      {typeof product.price === "number"
                                        ? product.price.toFixed(2)
                                        : product.price}
                                    </p>
                                    <motion.button
                                      onClick={() =>
                                        handleProductPriceEdit(
                                          product.product_id,
                                          product.price
                                        )
                                      }
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="ml-2 text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    >
                                      <FaEdit className="text-xs" />
                                    </motion.button>
                                  </div>
                                )}

                                {/* Stock */}
                                <div className="flex items-center mt-3">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                    Stock:
                                  </span>
                                  {editingStock[product.product_id] ? (
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        value={
                                          stockValues[product.product_id] ||
                                          product.stock
                                        }
                                        onChange={(e) =>
                                          setStockValues({
                                            ...stockValues,
                                            [product.product_id]:
                                              parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="w-20 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        min="0"
                                      />
                                      <div className="flex space-x-1">
                                        <motion.button
                                          onClick={() =>
                                            handleStockSave(product.product_id)
                                          }
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                        >
                                          <FaCheck className="text-sm" />
                                        </motion.button>
                                        <motion.button
                                          onClick={() =>
                                            setEditingStock({
                                              ...editingStock,
                                              [product.product_id]: false,
                                            })
                                          }
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                          <FaTimes className="text-sm" />
                                        </motion.button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <span
                                        className={`text-sm font-medium ${
                                          product.stock > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {product.stock}
                                      </span>
                                      {renderEditButton(product, () =>
                                        handleStockEdit(
                                          product.product_id,
                                          product.stock,
                                          product
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {product.image_url && (
                                <img
                                  src={
                                    product.image_url.startsWith("http")
                                      ? product.image_url
                                      : `${getApiBaseUrl}${product.image_url}`
                                  }
                                  alt={product.name}
                                  className="w-16 h-16 rounded-lg object-cover ml-3 shadow-md"
                                />
                              )}
                            </div>
                            <div className="flex justify-end mt-4">
                              <motion.button
                                onClick={() =>
                                  handleDeleteProduct(
                                    product.product_id,
                                    product
                                  )
                                }
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                              >
                                <FaTrash />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {userRole === "user" && activeTab === "my-products" && (
                <motion.div
                  key="my-products"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                      <FaShoppingCart className="text-orange-500" />
                    </div>
                    My Products
                  </h2>

                  <motion.div
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-md border border-indigo-100 dark:border-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                      <FaBox className="mr-2 text-purple-500" />
                      Manage Your Products
                    </h3>
                    {userProductsMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-4 rounded-xl text-sm flex items-center ${
                          userProductsMessage.type === "success"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {userProductsMessage.type === "success" ? (
                          <FaCheck className="mr-2 text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="mr-2 text-red-500" />
                        )}
                        {userProductsMessage.text}
                      </motion.div>
                    )}
                    {userProductsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : userProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                          <FaBox className="text-2xl text-indigo-600" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          You haven't added any products yet.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate("/sellwithus")}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium shadow-md transition-all flex items-center mx-auto"
                        >
                          <FaPlus className="mr-2" />
                          Add Your First Product
                        </motion.button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userProducts.map((product) => (
                          <motion.div
                            key={product.product_id}
                            className="border rounded-xl p-4 hover:shadow-lg transition-all duration-300 group bg-white dark:bg-gray-700"
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="flex items-start mb-3">
                              {product.image_url && (
                                <img
                                  src={
                                    product.image_url.startsWith("http")
                                      ? product.image_url
                                      : `${getApiBaseUrl}${product.image_url}`
                                  }
                                  alt={product.product_name}
                                  className="w-16 h-16 rounded-lg object-cover mr-3 shadow-md"
                                />
                              )}
                              <div className="flex-1">
                                {/* Product Name (Editable) */}
                                {editingProductName[product.product_id] ? (
                                  <div className="mb-2">
                                    <input
                                      type="text"
                                      value={
                                        productNameValues[product.product_id] ||
                                        product.product_name
                                      }
                                      onChange={(e) =>
                                        setProductNameValues({
                                          ...productNameValues,
                                          [product.product_id]: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <div className="flex space-x-1 mt-2">
                                      <motion.button
                                        onClick={() =>
                                          handleProductNameSave(
                                            product.product_id
                                          )
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                      >
                                        <FaCheck className="text-sm" />
                                      </motion.button>
                                      <motion.button
                                        onClick={() =>
                                          setEditingProductName({
                                            ...editingProductName,
                                            [product.product_id]: false,
                                          })
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <FaTimes className="text-sm" />
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <h4 className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-500 transition-colors">
                                      {product.product_name}
                                    </h4>
                                    <motion.button
                                      onClick={() =>
                                        handleProductNameEdit(
                                          product.product_id,
                                          product.product_name
                                        )
                                      }
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="ml-2 text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    >
                                      <FaEdit className="text-xs" />
                                    </motion.button>
                                  </div>
                                )}

                                {/* Price (Editable) */}
                                {editingProductPrice[product.product_id] ? (
                                  <div className="mt-3">
                                    <div className="flex items-center">
                                      <span className="text-sm mr-2">$</span>
                                      <input
                                        type="number"
                                        value={
                                          productPriceValues[
                                            product.product_id
                                          ] || product.price
                                        }
                                        onChange={(e) =>
                                          setProductPriceValues({
                                            ...productPriceValues,
                                            [product.product_id]:
                                              parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        step="0.01"
                                        min="0"
                                        className="w-24 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div className="flex space-x-1 mt-2">
                                      <motion.button
                                        onClick={() =>
                                          handleProductPriceSave(
                                            product.product_id
                                          )
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                      >
                                        <FaCheck className="text-sm" />
                                      </motion.button>
                                      <motion.button
                                        onClick={() =>
                                          setEditingProductPrice({
                                            ...editingProductPrice,
                                            [product.product_id]: false,
                                          })
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <FaTimes className="text-sm" />
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center mt-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      $
                                      {typeof product.price === "number"
                                        ? product.price.toFixed(2)
                                        : product.price}
                                    </p>
                                    <motion.button
                                      onClick={() =>
                                        handleProductPriceEdit(
                                          product.product_id,
                                          product.price
                                        )
                                      }
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="ml-2 text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    >
                                      <FaEdit className="text-xs" />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <motion.button
                                  onClick={() =>
                                    handleDeleteProduct(
                                      product.product_id,
                                      product
                                    )
                                  }
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <FaTrash className="text-sm" />
                                </motion.button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center">
                                <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">
                                  Stock:
                                </span>
                                {editingStock[product.product_id] ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      value={
                                        stockValues[product.product_id] ||
                                        product.stock
                                      }
                                      onChange={(e) =>
                                        setStockValues({
                                          ...stockValues,
                                          [product.product_id]:
                                            parseInt(e.target.value) || 0,
                                        })
                                      }
                                      className="w-20 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                      min="0"
                                    />
                                    <div className="flex space-x-1">
                                      <motion.button
                                        onClick={() =>
                                          handleStockSave(product.product_id)
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                      >
                                        <FaCheck className="text-sm" />
                                      </motion.button>
                                      <motion.button
                                        onClick={() =>
                                          setEditingStock({
                                            ...editingStock,
                                            [product.product_id]: false,
                                          })
                                        }
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <FaTimes className="text-sm" />
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`text-sm font-medium ${
                                        product.stock > 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {product.stock}
                                    </span>
                                    {renderEditButton(product, () =>
                                      handleStockEdit(
                                        product.product_id,
                                        product.stock,
                                        product
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                              <div
                                className={`text-xs px-2 py-1 rounded-full ${
                                  product.stock > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.stock > 0
                                  ? "In Stock"
                                  : "Out of Stock"}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
