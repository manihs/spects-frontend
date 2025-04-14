// components/Footer.jsx

'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X, Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer (){
    return (
      <footer className="bg-blue-50 text-black">
        {/* Main Footer Area */}
        <div className="container mx-auto py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
  
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    Brands
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
  
            {/* Customer Service */}
            <div>
              <h3 className="text-xl font-medium mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 text-sm hover:text-blue-500 transition">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
  
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-medium mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 mt-1"><Mail size={16} /></span>
                  <span className="text-gray-600 text-sm ">info@vishvaopticscompany.com</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1"><Phone size={16} /></span>
                  <span className="text-gray-600 text-sm" >+(91) 9819 415 150</span>
                </li>
              
              </ul>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="text-xl font-medium mb-4">About Our Store</h3>
              <div className="mb-4">
                <div className="font-bold text-2xl text-white mb-2">
                  <img src="/logo.png" alt="" className='h-16'/>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
              Vishva Optical Company stands as a renowned entity in the eyewear industry, esteemed for its consistent delivery of high-quality optical products in the B2B market.
              </p>
              {/* <div className="flex space-x-4">
                <a href="#" className="text-gray-600 text-sm hover:text-blue-500 transition" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-600 text-sm hover:text-blue-500 transition" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-600 text-sm hover:text-blue-500 transition" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div> */}
            </div>
          </div>
        </div>
  
        {/* Copyright */}
        <div className="bg-[#00A3F8]  py-4">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white text-sm ">
                &copy; {new Date().getFullYear()} Vishva Optics Company. All rights reserved.
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