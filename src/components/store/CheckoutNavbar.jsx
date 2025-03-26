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
} from "lucide-react";
import MiniCart from "../cart/MiniCart";
import { useCartStore } from "@/store/cartStore";
import { useSession, signOut } from "next-auth/react";

export default function CheckoutNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen || isCartOpen) {
        if (!event.target.closest(".dropdown-container")) {
          setIsProfileOpen(false);
          setIsCartOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen, isCartOpen]);

  return (
    <header className="w-full flex flex-col">
     
     
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
                  <img src="/logo.png" className=" h-16" />
                </div>
              </div>
            </Link>

           
           

            {/* Cart and Profile */}
            <div className="flex items-center space-x-4">
             
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
                            href="/orders"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                          >
                            <ShoppingBag size={16} className="mr-2" />
                            My Orders
                          </Link>
                          <Link
                            href="/settings"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                          >
                            <Settings size={16} className="mr-2" />
                            Settings
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
                          href="/login"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Register
                        </Link>
                        <Link
                          href="/register-retailer"
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
            <div className="md:hidden mt-4 pb-2">
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
                <li>
                  <Link
                    href="/brands"
                    className="block font-medium text-gray-800 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Brands
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link
                      href="/orders"
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
                        href="/settings"
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
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}