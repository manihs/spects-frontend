"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  LogOut,
  ShoppingBag,
  Settings,
  UserCircle,
  ChevronDown,
  QrCode,
} from "lucide-react";
import MiniCart from "../cart/MiniCart";
import { useCartStore } from "@/store/cartStore";
import { useSession, signOut } from "next-auth/react";
import { useUserContext } from "@/context/userContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mock brands data - in a real app, you'd fetch this from an API
  const brands = [
    { id: 1, name: "Victor Eyewear", slug: "/victor-eyewear" },
    { id: 2, name: "Ralph Carlo", slug: "/ralph-carlo" },
  ];

  const { data: session, status } = useSession();
  const { userProfile, isAuthenticated } = useUserContext();

  // Log session and userProfile data for debugging
  useEffect(() => {
    if (session || userProfile) {
      console.log("NavBar Data:", {
        session,
        userProfile
      });
    }
  }, [session, userProfile]);

  // Get cart state from Zustand
  const { getTotals } = useCartStore();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get cart count
  const { itemCount } = mounted ? getTotals() : { itemCount: 0 };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setIsProfileOpen(false);
  };

  // Handle brands click for desktop
  const handleBrandsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBrandsOpen(!isBrandsOpen);
  };

  // Handle mobile brands toggle
  const handleMobileBrandsToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBrandsOpen(!isBrandsOpen);
  };

  // Handle brand link click in mobile
  const handleMobileBrandClick = (slug) => {
    setIsBrandsOpen(false);
    setIsMenuOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown containers
      const isOutsideDropdown = !event.target.closest(".dropdown-container") && 
                               !event.target.closest(".mobile-brands-container");
      
      if (isOutsideDropdown) {
        setIsProfileOpen(false);
        setIsCartOpen(false);
        setIsBrandsOpen(false);
        setIsQrOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
        setIsBrandsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="w-full flex flex-col">
      <div className="bg-[#00A3F8] flex flex-col md:flex-row justify-between items-center py-2 px-4 text-center md:text-left">
        {/* Section 1 - Login/Register Banner */}
        {!isAuthenticated ? (
          <div className="flex flex-col md:flex-row items-center text-lg">
            <p className="text-gray-100">
              Please Register or Login to view prices
            </p>
            <div className="flex items-center space-x-2 mt-1 md:mt-0 md:ml-2">
              <Link
                href="/account/login"
                className="hover:text-blue-950 text-white font-medium underline"
              >
                Login
              </Link>
              <span className="text-gray-100">Or</span>
              <Link
                href="/account/register"
                className="text-white hover:text-blue-950 font-medium underline"
              >
                Register Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center text-lg">
            <p className="text-white">
              Welcome {userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}` : 'Guest'}
              {userProfile?.trusted && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Trusted
                </span>
              )}
            </p>
          </div>
        )}

        {/* Section 2 - Social Icons */}
        <div className="flex text-white items-center space-x-4 mt-2 md:mt-0">
          <a
            href="https://www.facebook.com/share/1HDnLwCZay/"
            className="hover:text-blue-950 transition"
            aria-label="Facebook"
          >
            <Facebook size={20} />
          </a>
          <a
            href="https://www.instagram.com/victoreyewear"
            className="hover:text-blue-950 transition"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>
          <a
            href="#"
            className="hover:text-blue-950 transition"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="tel:+919819415150"
            className="hover:text-blue-950 transition"
            aria-label="WhatsApp"
          >
            <Phone size={20} />
          </a>
          <a
            href="mailto:vishvaopticalcompany@gmail.com "
            className="hover:text-blue-950 transition"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
        </div>
      </div>

      {/* Section 3 - Main Navigation */}
      <div
        className={`w-full bg-white py-4 px-6 shadow-md transition-all duration-300 ${
          isScrolled ? "sticky top-0 z-50" : ""
        }`}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative">
                <div className="font-bold text-xl text-blue-600">
                  <img src="/logo.png" className="h-16" alt="Logo" />
                </div>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden focus:outline-none z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center flex-1">
              <ul className="flex space-x-8">
                <li>
                  <Link
                    href="/"
                    className="font-medium text-gray-800 hover:text-blue-600 transition"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about-us"
                    className="font-medium text-gray-800 hover:text-blue-600 transition"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="font-medium text-gray-800 hover:text-blue-600 transition"
                  >
                    Products
                  </Link>
                </li>
                {/* Brands Dropdown */}
                <li className="relative dropdown-container">
                  <div className="flex items-center cursor-pointer">
                    <button
                      onClick={handleBrandsClick}
                      className="font-medium text-gray-800 hover:text-blue-600 transition flex items-center"
                    >
                      Brands
                      <ChevronDown size={16} className="ml-1" />
                    </button>
                  </div>
                  
                  {isBrandsOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-2">
                      {brands.map(brand => (
                        <Link
                          key={brand.id}
                          href={`/brands${brand.slug}`}
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-blue-600 transition"
                          onClick={() => setIsBrandsOpen(false)}
                        >
                          {brand.name}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link
                          href="/brands"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 transition"
                          onClick={() => setIsBrandsOpen(false)}
                        >
                          View all brands
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
                {isAuthenticated && (
                  <li>
                    <Link
                      href="/account/orders"
                      className="font-medium text-gray-800 hover:text-blue-600 transition"
                    >
                      My Orders
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/contact-us"
                    className="font-medium text-gray-800 hover:text-blue-600 transition"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Cart and Profile */}
            <div className="flex items-center space-x-4">
              {/* QR Code Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => {
                    setIsQrOpen(!isQrOpen);
                    if (isCartOpen) setIsCartOpen(false);
                    if (isProfileOpen) setIsProfileOpen(false);
                  }}
                  className="relative p-2 text-gray-800 hover:text-blue-600 transition"
                  aria-label="QR Code"
                >
                  <QrCode size={24} />
                </button>

                {isQrOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 p-4">
                    <div className="flex flex-col items-center">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Scan our QR Code</h3>
                      <img 
                        src="/qrurl.png" 
                        alt="QR Code" 
                        className="w-full h-auto rounded"
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Scan to visit our mobile store
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="relative p-2 text-gray-800 hover:text-blue-600 transition"
                  aria-label="Cart"
                >
                  <ShoppingCart size={24} />
                  {mounted && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </button>

                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50">
                    <MiniCart onClose={() => setIsCartOpen(false)} />
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative dropdown-container">
                <button
                  className="flex items-center text-gray-800 hover:text-blue-600 transition"
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    if (isCartOpen) setIsCartOpen(false);
                  }}
                  aria-label="Profile"
                >
                  <User size={24} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 w-56 mt-4 bg-white rounded-lg shadow-lg py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.user.email}
                          </p>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-blue-600">
                              {session.user.role === "admin"
                                ? "Admin Account"
                                : userProfile?.trusted 
                                  ? "Trusted Customer" 
                                  : "Customer Account"}
                            </p>
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/account"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                          >
                            <UserCircle size={16} className="mr-2" />
                            My Account
                          </Link>
                          <Link
                            href="/account/orders"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                          >
                            <ShoppingBag size={16} className="mr-2" />
                            My Orders
                          </Link>
                        </div>

                        <div className="py-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                          >
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account/login"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Login
                        </Link>
                        <Link
                          href="/admin/login"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Admin Login
                        </Link>
                        <Link
                          href="/account/register"
                          className="block px-4 py-2 text-blue-600 hover:bg-gray-100 border-t border-gray-100 mt-1 pt-1"
                        >
                          Register as Retailer
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-2 relative z-40">
              <ul className="flex flex-col space-y-4">
                <li>
                  <Link
                    href="/"
                    className="block font-medium text-gray-800 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about-us"
                    className="block font-medium text-gray-800 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="block font-medium text-gray-800 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Products
                  </Link>
                </li>
                {/* Mobile Brands Dropdown */}
                <li className="mobile-brands-container">
                  <button
                    className="flex items-center justify-between w-full text-left font-medium text-gray-800 hover:text-blue-600 transition focus:outline-none"
                    onClick={handleMobileBrandsToggle}
                    type="button"
                  >
                    <span>Brands</span>
                    <ChevronDown 
                      size={16} 
                      className={`transform transition-transform duration-200 ${
                        isBrandsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isBrandsOpen && (
                    <div className="pl-4 mt-2 space-y-2 bg-gray-50 rounded-md p-2 ml-2">
                      {brands.map(brand => (
                        <Link
                          key={brand.id}
                          href={`/brands${brand.slug}`}
                          className="block font-medium text-gray-600 hover:text-blue-600 transition py-1 px-2 rounded hover:bg-white"
                          onClick={() => handleMobileBrandClick(brand.slug)}
                        >
                          {brand.name}
                        </Link>
                      ))}
                      <Link
                        href="/brands"
                        className="block font-medium text-blue-600 hover:text-blue-800 transition py-1 px-2 rounded hover:bg-white border-t border-gray-200 pt-2 mt-2"
                        onClick={() => handleMobileBrandClick('/brands')}
                      >
                        View all brands
                      </Link>
                    </div>
                  )}
                </li>
                {isAuthenticated && (
                  <li>
                    <Link
                      href="/account/orders"
                      className="block font-medium text-gray-800 hover:text-blue-600 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/contact-us"
                    className="block font-medium text-gray-800 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </li>
                {isAuthenticated && (
                  <>
                    <li className="border-t border-gray-200 pt-4 mt-2">
                      <Link
                        href="/account"
                        className="block font-medium text-gray-800 hover:text-blue-600 transition flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserCircle size={16} className="mr-2" />
                        My Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/setting"
                        className="block font-medium text-gray-800 hover:text-blue-600 transition flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings size={16} className="mr-2" />
                        Settings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left font-medium text-red-600 hover:text-red-700 transition flex items-center"
                        type="button"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </li>
                  </>
                )}
                <li className="border-t border-gray-200 pt-4 mt-2">
                  <button
                    onClick={() => {
                      setIsQrOpen(!isQrOpen);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left font-medium text-gray-800 hover:text-blue-600 transition flex items-center"
                    type="button"
                  >
                    <QrCode size={16} className="mr-2" />
                    Scan QR Code
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* QR Code Modal for Mobile */}
      {isQrOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:hidden">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Scan our QR Code</h3>
              <button 
                onClick={() => setIsQrOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
            <img 
              src="/qrurl.png" 
              alt="QR Code" 
              className="w-full h-auto rounded"
            />
            <p className="text-sm text-gray-500 mt-4 text-center">
              Scan to visit our mobile store
            </p>
          </div>
        </div>
      )}
    </header>
  );
}