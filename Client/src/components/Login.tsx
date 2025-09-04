import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import { useAlert } from "../Context/Alert_context";
import { useAuth } from "../Context/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { loginUser, setIsLogged } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const { ok, result } = await loginUser(data);

      if (ok && result?.access_token) {
        // Save session for current tab
        localStorage.setItem("user_email", result.user.email);
        localStorage.setItem("token", result.access_token);

        setIsLogged(true);
        showAlert("success", "🎉 Login successful! Redirecting...");
        navigate("/", { replace: true });
      } else {
        const detail = result?.detail?.toLowerCase() || "";
        if (detail.includes("invalid")) {
          setError("password", { message: "Invalid email or password" });
        } else {
          showAlert("error", result?.detail || "Invalid email or password");
        }
      }
    } catch {
      showAlert("error", "Server not responding. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 sm:p-6">
      <motion.div
        className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Form Side */}
        <div className="w-full md:w-3/5 order-2 md:order-1 p-6 sm:p-8 lg:p-10">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 mb-6">Sign in to continue your shopping journey</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                  className="w-full pl-10 p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-sm hover:shadow-md"
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1.5 pl-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("password", { required: "Password is required" })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-sm hover:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 focus:outline-none hover:text-gray-700 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1.5 pl-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all shadow-md mt-2 ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-100"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </motion.button>

              <p className="text-center text-gray-600 mt-4">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 font-medium hover:underline focus:outline-none"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Illustration Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full md:w-2/5 order-1 md:order-2 relative overflow-hidden"
        >
          <div className="h-full min-h-[200px] md:min-h-0 w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="relative z-10 p-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6 flex justify-center"
              >
                <FontAwesomeIcon
                  icon={faCartShopping}
                  className="text-white"
                  size="5x"
                />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Welcome Back!
              </h3>
              <p className="text-white/90 mb-6 max-w-xs mx-auto">
                Sign in to access your profile, orders, and continue your shopping journey.
              </p>
              <div className="hidden sm:block">
                <motion.div
                  className="flex gap-2 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-2 rounded-full bg-white/50"
                    ></div>
                  ))}
                </motion.div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/20"
                  style={{
                    width: `${Math.random() * 200 + 50}px`,
                    height: `${Math.random() * 200 + 50}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 10 + 15}s infinite ease-in-out`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Note: Animation keyframes are now defined in Login.css */}
    </div>
  );
}