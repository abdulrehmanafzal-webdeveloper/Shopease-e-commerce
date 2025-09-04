import React, { useRef,memo } from "react";
import { FaShoppingCart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useCart } from "../Context/CartContext";
import { useAlert } from "../Context/Alert_context";

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  price: number;
  stock: number;
  image_url: string;
}

interface ProductCarouselProps {
  products: Product[];
  placeholderImage: string;
  showArrows?: boolean;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  placeholderImage,
  showArrows = false,
}) => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const { isLogged } = useAuth();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 250;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full">
      {showArrows && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-100"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-100"
          >
            <FaChevronRight />
          </button>
        </>
      )}

      <div
        ref={carouselRef}
        className="
          overflow-hidden flex space-x-4 pb-2
          scrollbar-hide snap-x snap-mandatory scroll-smooth
        "
      >
        {products.map((product) => {
          const outOfStock = product.stock !== undefined && product.stock <= 0;

          return (
            <div
              key={product.product_id}
              onClick={() => navigate(`/products/getproductbyid/${product.product_id}`)}
              className={`min-w-[30%] sm:w-[180px] bg-white rounded-xl border-2 border-solid border-gray-200 shadow hover:shadow-xl transition duration-300 relative group snap-start ${
                outOfStock ? "grayscale opacity-70" : ""
              }`}
            >
              <img
                src={
                  product.image_url?
                  product.image_url.startsWith("http")
                    ? product.image_url
                    : `http://localhost:8000${product.image_url}`
                    :""
                }
                alt={product.product_name}
                className="w-full h-40 object-cover cursor-pointer bg-white rounded-t-xl"
                onError={(e) => (e.currentTarget.src = placeholderImage)}
              />
              {!outOfStock && isLogged ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.product_id, 1 || undefined);
                    showAlert(
                      "success",
                      `🎉 ${product.product_name} is successfully added to cart...`
                    );
                  }}
                  className="absolute top-2 right-2 bg-white shadow-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-blue-600 hover:text-white"
                >
                  <FaShoppingCart />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(
                      product.product_id,
                      1 || undefined,
                      localStorage.getItem("session_id") || undefined
                    );
                    showAlert(
                      "success",
                      `🎉 ${product.product_name} is successfully added to cart...`
                    );
                  }}
                  className="absolute top-2 right-2 bg-white shadow-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-blue-600 hover:text-white"
                >
                  <FaShoppingCart />
                </button>
              )}
              <div
                className="p-3 text-center cursor-pointer"
                onClick={() => navigate(`/product/${product.product_id}`)}
              >
                <h3 className="text-sm font-semibold text-gray-800 truncate">
                  {product.product_name}
                </h3>
                {product.price && (
                  <p className="text-blue-600 font-medium mt-1 text-sm">
                    Rs{product.price}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(ProductCarousel);
