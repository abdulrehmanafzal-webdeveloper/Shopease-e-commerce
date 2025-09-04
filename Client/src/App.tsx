import { BrowserRouter, Routes, Route } from "react-router-dom";
// components
import ProductDetail from "./pages/ProductDetail";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Alert from "./components/Alert";
import Products from "./pages/Products";
import SubCategories from "./components/SubCategories";
import Profile from "./components/Profile";
import Orders from "./components/Orders";

// ✅ Context Providers
import { AlertProvider } from "./Context/Alert_context";
import { AuthProvider } from "./Context/AuthContext";
import { CarouselProvider } from "./Context/CarouselContext";
import { ProductDetailProvider } from "./Context/ProductDetailContext";
import { CartProvider } from "./Context/CartContext";
import { ProductsProvider } from "./Context/ProductsContext"; // ✅ Import ProductsProvider
import { CheckoutProvider } from "./Context/CheckoutContext";
import CheckoutForm from "./components/Checkout";
import Footer from "./components/Footer";
import SellWithUs from "./components/SellWithUs";




function App() {
  return (
      <AlertProvider>
        <CartProvider>
          <AuthProvider>
          <CheckoutProvider>
          <ProductsProvider> {/* ✅ Wrap your product context */}
            <CarouselProvider>
              <ProductDetailProvider>
                <BrowserRouter>
                  <Navbar />
                  {/* ✅ Global alert always on top */}
                  <Alert />
                  <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/categories/subcategories/:categoryId" element={<SubCategories/>}/>
                        <Route path="/products/getproductsbyid/:subcategoryId" element={<Products />} />
                        <Route path="/products/getproductbyid/:id" element={<ProductDetail/>}/>
                        <Route path="/products/search" element={<Products />}/> 
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/products/allproducts" element={<Products />} />
                        <Route path="/users/profile" element={<Profile/>}/>
                        <Route path="/checkout" element={<CheckoutForm/>}/>
                        <Route path="/order/orders" element={<Orders />} />
                        <Route path="/sellwithus" element={<SellWithUs/>}/> 
                      </Routes>
                  </div>
                  <Footer/>
                </BrowserRouter>
              </ProductDetailProvider>
            </CarouselProvider>
          </ProductsProvider>
          </CheckoutProvider>
          </AuthProvider>
        </CartProvider>
      </AlertProvider>
  );
}

export default App;
