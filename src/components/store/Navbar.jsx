'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X, Facebook, Instagram, Linkedin, Mail, Phone, LogOut } from 'lucide-react';
import MiniCart from '../cart/MiniCart';
import { useCartStore } from '@/store/cartStore';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get cart count
  const { itemCount } = mounted ? getTotals() : { itemCount: 0 };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    setIsProfileOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen || isCartOpen) {
        if (!event.target.closest('.dropdown-container')) {
          setIsProfileOpen(false);
          setIsCartOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isCartOpen]);

  return (
    <header className="w-full flex flex-col">
      {/* Section 1 - Login/Register Banner */}
      {!isAuthenticated && (
        <div className="w-full bg-blue-300 py-2 px-4">
          <div className="container mx-auto flex justify-center items-center text-lg">
            <p className="text-gray-700">Please Register or Login to view prices</p>
            <Link href="/account/login" className="text-blue-600 font-medium ml-2 hover:underline">
              Login
            </Link>
            <span className="mx-2 text-gray-500">Or</span>
            <Link href="/account/register" className="text-blue-600 font-medium hover:underline">
              Register Now
            </Link>
          </div>
        </div>
      )}

      {/* Section 2 - Register/Login and Social Links */}
      <div className="w-full bg-blue-50 text-gray-600 py-4 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="hidden md:flex">
            {!isAuthenticated ? (
              <Link href="/account/login" className="mr-4 text-sm hover:text-blue-500 transition">
                Register/Login
              </Link>
            ) : (
              <span className="mr-4 text-sm">Welcome, {session.user.name}</span>
            )}
          </div>

          {/* Social Media Links */}
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-blue-300 transition" aria-label="Facebook">
              <Facebook size={16} />
            </a>
            <a href="#" className="hover:text-blue-300 transition" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="#" className="hover:text-blue-300 transition" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="#" className="hover:text-blue-300 transition" aria-label="WhatsApp">
              <Phone size={16} />
            </a>
            <a href="#" className="hover:text-blue-300 transition" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Section 3 - Main Navigation */}
      <div 
        className={`w-full bg-white py-4 px-6 shadow-md transition-all duration-300 ${
          isScrolled ? 'sticky top-0 z-50' : ''
        }`}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative w-32">
                <div className="font-bold text-xl text-blue-600">
                <img src="/logo.svg" className='h-12'/>
                </div>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden focus:outline-none" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center flex-1">
              <ul className="flex space-x-8">
                <li>
                  <Link href="/" className="font-medium text-gray-800 hover:text-blue-600 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about-us" className="font-medium text-gray-800 hover:text-blue-600 transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="font-medium text-gray-800 hover:text-blue-600 transition">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="font-medium text-gray-800 hover:text-blue-600 transition">
                    Brands
                  </Link>
                </li>
                <li>
                  <Link href="/contact-us" className="font-medium text-gray-800 hover:text-blue-600 transition">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Cart and Profile */}
            <div className="flex items-center space-x-4">
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
                      {itemCount > 99 ? '99+' : itemCount}
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
                  <div className="absolute right-0 w-48 mt-4 bg-white rounded-lg shadow-lg py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                          <p className="text-xs text-gray-500">{session.user.email}</p>
                        </div>
                        <Link href="/account" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                          My Account
                        </Link>
                        <Link href="/account/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/account/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                          Login
                        </Link>
                        <Link href="/account/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                          Register
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
                    href="/about" 
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
                <li>
                  <Link 
                    href="/contact" 
                    className="block font-medium text-gray-800 hover:text-blue-600 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}