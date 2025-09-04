// src/components/SellWithUs.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useProducts } from "../Context/ProductsContext";
import { useAlert } from "../Context/Alert_context";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiX, FiPlus, FiDollarSign, FiBox } from "react-icons/fi";

interface FormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  sub_category_id: number;
}

const SellWithUs = () => {
  const { isLogged } = useAuth();
  const { addProduct, fetchCarouselSlides, uploadImage } = useProducts();
  const { showAlert } = useAlert();

  const [subCategories, setSubCategories] = useState<
    { id: number; name: string }[]
  >([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image_url: "",
    sub_category_id: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);

  // ✅ Load subcategories
  useEffect(() => {
    const loadSubCategories = async () => {
      try {
        const slides = await fetchCarouselSlides();
        if (slides) {
          setSubCategories(
            slides.map((s: any) => ({
              id: s.id,
              name: s.sub_category_name,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };
    loadSubCategories();
  }, [fetchCarouselSlides]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" || name === "sub_category_id"
          ? Number(value)
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    const input = document.getElementById("fileUpload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!isLogged) {
      setMessage("You must be logged in to sell a product.");
      return;
    }

    if (!file) {
      setMessage("Please upload a product image.");
      return;
    }

    if (formData.price < 0 || formData.stock < 0) {
      setMessage("❌ Price and stock cannot be negative.");
      return;
    }

    try {
      setLoading(true);
      setIsHoveringSubmit(false);

      const uploadResult = await uploadImage(file);
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.message || "Upload failed");
      }

      const result = await addProduct({
        ...formData,
        image_url: uploadResult.url,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      showAlert(
        "success",
        `🎉 ${formData.name} is successfully added to cart...`
      );
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        image_url: "",
        sub_category_id: 0,
      });
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Add product error:", err);
      showAlert("error", `❌ ${formData.name} could not be added to cart...`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto p-4 sm:p-6"
    >
      <motion.div
        className="bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-100"
        whileHover={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          y: -5,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full"></div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <motion.h2
              className="text-3xl font-bold text-white"
              whileHover={{ scale: 1.02 }}
            >
              Sell With Us
            </motion.h2>
            <motion.p
              className="text-indigo-100 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Share your products with our community
            </motion.p>
          </motion.div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!isLogged ? (
              <motion.div
                key="login-required"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 rounded-xl text-center"
              >
                <p className="text-red-600 font-medium">
                  Please log in to add a product
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="sell-form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-gray-700 font-medium mb-2">
                    Product Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-gray-700 font-medium mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      placeholder="Write a short description..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[120px] shadow-inner"
                      required
                    />
                    <div className="absolute left-4 top-4 text-indigo-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Price & Stock */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div whileHover={{ y: -3 }}>
                    <label className="block text-gray-700 font-medium mb-2">
                      Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">
                        <FiDollarSign />
                      </div>
                      <input
                        type="number"
                        name="price"
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -3 }}>
                    <label className="block text-gray-700 font-medium mb-2">
                      Stock Quantity
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">
                        <FiBox />
                      </div>
                      <input
                        type="number"
                        name="stock"
                        placeholder="0"
                        min={0}
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                        required
                      />
                    </div>
                  </motion.div>
                </motion.div>

                {/* File Upload Modern */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-gray-700 font-medium mb-2">
                    Product Image
                  </label>
                  <motion.div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-all duration-300 relative bg-gradient-to-br from-gray-50 to-white group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label
                      htmlFor="fileUpload"
                      className="cursor-pointer block w-full h-full"
                    >
                      <AnimatePresence mode="wait">
                        {preview ? (
                          <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full h-64 flex items-center justify-center"
                          >
                            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
                              <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <motion.button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 transition-all shadow-lg border border-gray-300"
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiX className="w-4 h-4 text-red-500" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="upload-prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-8"
                          >
                            <motion.div
                              className="bg-indigo-100 rounded-full p-4 mb-4 group-hover:scale-110 transition-transform"
                              animate={{
                                rotate: [0, 5, -5, 0],
                                y: [0, -5, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                              }}
                            >
                              <FiUpload className="w-8 h-8 text-indigo-600" />
                            </motion.div>
                            <p className="text-gray-600 font-medium">
                              Drag & drop or click to upload
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                              JPG, PNG up to 5MB
                            </p>
                            <motion.div
                              className="mt-4 text-xs text-indigo-500 font-medium"
                              animate={{ opacity: [0.6, 1, 0.6] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Click or drop your image here
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </label>
                  </motion.div>
                </motion.div>

                {/* Subcategory */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-gray-700 font-medium mb-2">
                    Sub Category
                  </label>
                  <div className="relative">
                    <select
                      name="sub_category_id"
                      value={formData.sub_category_id}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-10 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                      required
                    >
                      <option value={0}>Select a sub category</option>
                      {subCategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-medium text-white shadow-lg relative overflow-hidden ${
                      loading
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 cursor-wait"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    }`}
                    whileHover={
                      !loading
                        ? {
                            scale: 1.02,
                            background: [
                              "linear-gradient(45deg, #7c3aed, #c084fc)",
                              "linear-gradient(45deg, #c084fc, #7c3aed)",
                              "linear-gradient(45deg, #7c3aed, #c084fc)",
                            ],
                            transition: { duration: 0.5, repeat: Infinity },
                          }
                        : {}
                    }
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    onHoverStart={() => !loading && setIsHoveringSubmit(true)}
                    onHoverEnd={() => !loading && setIsHoveringSubmit(false)}
                  >
                    <AnimatePresence>
                      {isHoveringSubmit && !loading && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 10, opacity: 0 }}
                          transition={{ duration: 0.8 }}
                          className="absolute inset-0 bg-white opacity-0 rounded-full"
                          style={{ originX: 0.5, originY: 0.5 }}
                        />
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-center relative z-10">
                      {loading ? (
                        <>
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
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiPlus className="mr-2" />
                          Add Product
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && (
              <motion.p
                className="mt-4 p-3 rounded-lg text-center bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-600 font-medium"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SellWithUs;
