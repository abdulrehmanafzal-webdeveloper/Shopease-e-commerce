import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaEnvelope,
  FaHeadset,
  FaTruck,
  FaShieldAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail("");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 pt-16 pb-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ x: -100, y: -100, opacity: 0 }}
          animate={{ 
            x: isScrolled ? [-100, -50] : [-100, 0],
            y: isScrolled ? [-100, -50] : [-100, 0],
            opacity: 0.1,
            rotate: isScrolled ? [0, 5] : [0, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute -top-1/3 -right-1/4 w-full aspect-square bg-gradient-to-r from-indigo-900/10 to-purple-900/10 rounded-full"
        ></motion.div>
        <motion.div 
          initial={{ x: 50, y: 50, opacity: 0 }}
          animate={{ 
            x: isScrolled ? [50, 100] : [50, 0],
            y: isScrolled ? [50, 100] : [50, 0],
            opacity: 0.05,
            rotate: isScrolled ? [0, -5] : [0, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-900/5 to-purple-900/5 rounded-full"
        ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Newsletter Section - Moved to top */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 max-w-2xl mx-auto lg:max-w-4xl"
        >
          <motion.h3
            variants={item}
            className="text-white text-xl font-semibold mb-5 pb-2 border-b border-gray-700 text-center"
            whileHover={{ scale: 1.05 }}
          >
            Stay Updated with Our Latest Deals
          </motion.h3>
          
          <motion.div variants={item} className="mb-6 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for updates on new products, special offers and discounts
            </p>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative max-w-md mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    y: { duration: 0.3 },
                    scale: { duration: 0.5, repeat: 1, repeatType: "reverse" }
                  }}
                  className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded-lg text-center"
                >
                  Thank you for subscribing!
                </motion.div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-32 md:pr-36 lg:pr-32 py-3 text-sm bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 transition-all duration-300 peer"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <FiMail />
                    </div>
                    
                    {/* Floating label effect */}
                    <motion.label
                      initial={{ opacity: 0, y: 0 }}
                      animate={{
                        opacity: email || isFocused ? 1 : 0,
                        y: email || isFocused ? -32 : 0,
                      }}
                      className="absolute left-12 top-1 bg-gray-800 px-2 text-xs text-indigo-400 pointer-events-none transition-all duration-300"
                    >
                      Email
                    </motion.label>
                  </div>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ 
                      scale: 1.05,
                      background: "linear-gradient(45deg, #7c3aed, #c084fc)",
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-1 px-4 py-2 text-sm"
                    animate={{
                      scale: [1, 1.03, 1],
                      transition: {
                        duration: 2,
                        repeat: Infinity
                      }
                    }}
                  >
                    <span className="hidden md:inline">Subscribe</span>
                    <span className="md:hidden">
                      <FaPaperPlane />
                    </span>
                  </motion.button>
                </div>
              )}
            </motion.form>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <motion.div
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-2"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="inline-block mb-4"
            >
              <h2 className="text-3xl font-bold text-white">
                <motion.span 
                  className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: isHovered ? ["0%", "100%"] : ["100%", "0%"]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ 
                    backgroundSize: "200% 100%",
                  }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  ShopEase
                </motion.span>
              </h2>
            </motion.div>
            <motion.p 
              className="text-gray-400 mb-6 max-w-md"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Your one-stop shop for everything. Quality products, secure
              payments, and fast delivery.
            </motion.p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {[
                {
                  icon: FaTruck,
                  text: "Fast Delivery",
                  color: "text-blue-400",
                },
                {
                  icon: FaShieldAlt,
                  text: "Secure Payments",
                  color: "text-green-400",
                },
                {
                  icon: FaHeadset,
                  text: "24/7 Support",
                  color: "text-purple-400",
                },
                {
                  icon: FaEnvelope,
                  text: "Free Returns",
                  color: "text-yellow-400",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={item}
                  className="flex items-center gap-3"
                  whileHover={{ 
                    y: -5,
                    scale: 1.03,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className={`p-2 bg-gray-800 rounded-lg ${feature.color}`}
                    animate={{ 
                      rotate: [0, 5, 0, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: idx * 0.3
                    }}
                  >
                    <feature.icon />
                  </motion.div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h3
              variants={item}
              className="text-white text-lg font-semibold mb-5 pb-2 border-b border-gray-700 inline-block"
              whileHover={{ scale: 1.05 }}
            >
              Quick Links
            </motion.h3>
            <motion.ul variants={container} className="space-y-3">
              {[
                { text: "Shop", path: "/" },
                { text: "Categories", path: "/categories" },
                { text: "About Us", path: "/about" },
                { text: "Contact", path: "/contact" },
                { text: "Sell With Us", path: "/sellwithus" },
              ].map((link, idx) => (
                <motion.li 
                  key={idx} 
                  variants={item}
                  whileHover={{ x: 5 }}
                >
                  <a
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors group"
                  >
                    <motion.span 
                      className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-indigo-500 transition-colors"
                      animate={{
                        x: [0, 5, 0],
                        scale: [1, 1.5, 1]
                      }}
                      transition={{ 
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                        delay: idx * 0.2
                      }}
                    ></motion.span>
                    <motion.span 
                      className="group-hover:translate-x-1 transition-transform"
                      whileHover={{ color: "#a78bfa" }}
                    >
                      {link.text}
                    </motion.span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Support */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h3
              variants={item}
              className="text-white text-lg font-semibold mb-5 pb-2 border-b border-gray-700 inline-block"
              whileHover={{ scale: 1.05 }}
            >
              Support
            </motion.h3>
            <motion.ul variants={container} className="space-y-3">
              {[
                { text: "FAQ", path: "/faq" },
                { text: "Returns", path: "/returns" },
                { text: "Shipping Info", path: "/shipping" },
                { text: "Payment Options", path: "/payment" },
                { text: "Track Order", path: "/tracking" },
              ].map((link, idx) => (
                <motion.li 
                  key={idx} 
                  variants={item}
                  whileHover={{ x: 5 }}
                >
                  <a
                    href={link.path}
                    className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors group"
                  >
                    <motion.span 
                      className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-purple-500 transition-colors"
                      animate={{
                        x: [0, 5, 0],
                        scale: [1, 1.5, 1]
                      }}
                      transition={{ 
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                        delay: idx * 0.2
                      }}
                    ></motion.span>
                    <motion.span 
                      className="group-hover:translate-x-1 transition-transform"
                      whileHover={{ color: "#c084fc" }}
                    >
                      {link.text}
                    </motion.span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Social Media Section - Stay Connected */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="md:col-span-1 lg:col-span-1 "
          >
            <motion.h3
              variants={item}
              className="text-white text-lg font-semibold mb-5 pb-2 border-b border-gray-700 inline-block"
              whileHover={{ scale: 1.05 }}
            >
              Stay Connected
            </motion.h3>

            <motion.div variants={item} className="flex space-x-3 mb-6">
              {[
                { icon: FaFacebookF, color: "hover:bg-blue-600", href: "#" },
                { icon: FaTwitter, color: "hover:bg-blue-400", href: "#" },
                {
                  icon: FaInstagram,
                  color: "hover:bg-gradient-to-r from-yellow-500 to-pink-500",
                  href: "#",
                },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.1,
                    rotate: [0, 10, -10, 5, 0]
                  }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 bg-gray-800 rounded-full ${social.color} transition-colors relative overflow-hidden`}
                  animate={{
                    y: [0, -5, 0],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      delay: idx * 0.3
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                  <social.icon className="text-lg" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ShopEase. All rights reserved.
          </p>

          <div className="flex items-center space-x-6 mt-6 md:mt-0">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ 
                  y: -5,
                  scale: 1.2,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FaCcVisa className="text-2xl text-gray-400 hover:text-white transition-colors" />
              </motion.div>
              <motion.div
                whileHover={{ 
                  y: -5,
                  scale: 1.2,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FaCcMastercard className="text-2xl text-gray-400 hover:text-white transition-colors" />
              </motion.div>
              <motion.div
                whileHover={{ 
                  y: -5,
                  scale: 1.2,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FaCcPaypal className="text-2xl text-gray-400 hover:text-white transition-colors" />
              </motion.div>
            </div>
            <div className="hidden sm:block h-5 w-px bg-gray-700"></div>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="text-gray-500 hover:text-white text-sm transition-colors"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                Privacy Policy
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-500 hover:text-white text-sm transition-colors"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                Terms of Service
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-500 hover:text-white text-sm transition-colors"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                Cookies
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}