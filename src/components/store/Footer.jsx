// components/Footer.jsx

'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X, Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer (){
    return (
      <footer className="bg-gray-900 text-white">
        {/* Main Footer Area */}
        <div className="container mx-auto py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4">About Our Store</h3>
              <div className="mb-4">
                <div className="font-bold text-2xl text-white mb-2">LOGO</div>
              </div>
              <p className="text-gray-400 mb-4">
                We offer premium products with exceptional service. Shop with confidence for quality items at competitive prices.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
  
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-gray-400 hover:text-white transition">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="text-gray-400 hover:text-white transition">
                    Brands
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
  
            {/* Customer Service */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-400 hover:text-white transition">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
  
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 mt-1"><Mail size={16} /></span>
                  <span className="text-gray-400">support@yourdomain.com</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1"><Phone size={16} /></span>
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li>
                  <form className="mt-4">
                    <p className="text-gray-400 mb-2">Subscribe to our newsletter</p>
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="Your email"
                        className="px-4 py-2 w-full text-gray-800 rounded-l-md focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 px-4 py-2 rounded-r-md hover:bg-blue-700 transition"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </li>
              </ul>
            </div>
          </div>
        </div>
  
        {/* Copyright */}
        <div className="bg-gray-950 py-4">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Your Company Name. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <ul className="flex space-x-4">
                  <li>
                    <img 
                      src="/api/placeholder/60/30" 
                      alt="Payment Method" 
                      className="h-6"
                    />
                  </li>
                  <li>
                    <img 
                      src="/api/placeholder/60/30" 
                      alt="Payment Method" 
                      className="h-6"
                    />
                  </li>
                  <li>
                    <img 
                      src="/api/placeholder/60/30" 
                      alt="Payment Method" 
                      className="h-6"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  };