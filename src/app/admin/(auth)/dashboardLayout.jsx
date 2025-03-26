'use client'

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard as Dashboard, 
  ShoppingBag, 
  Users, 
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname hook

const AdminDashboardLayout = ({ children }) => {
  const pathname = usePathname(); // Use Next.js router hook to get current path
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeSubmenus, setActiveSubmenus] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define menu items
  const menuItems = [
    { 
      title: 'Dashboard', 
      icon: <Dashboard size={20} />, 
      path: '/admin/dashboard' 
    },
    { 
      title: 'Create Product', 
      icon: <Package size={20} />, 
      path: '/admin/product/create' 
    },
    { 
      title: 'Products', 
      icon: <Package size={20} />, 
      path: '/admin/product',
      submenu: [
        { title: 'Products', path: '/admin/product/' },
        { title: 'Attribute', path: '/admin/product/attribute' },
        { title: 'Categories', path: '/admin/product/categories' },
        { title: 'Collections', path: '/admin/product/collections' },
      ] 
    },
    {
      title: 'Orders',
      icon: <ShoppingBag size={20} />,
      path: '/admin/orders',
    },
    {
      title: 'Customers',
      icon: <Users size={20} />,
      path: '/admin/customers'
    },
    {
      title: 'Settings',
      icon: <Settings size={20} />,
      path: '/admin/settings',
      submenu: [
        { title: 'Store', path: '/admin/settings/store' },
        { title: 'Users', path: '/admin/settings/users' },
        { title: 'System', path: '/admin/settings/system' }
      ]
    }
  ];

  // Update active submenus when path changes
  useEffect(() => {
    // Initialize active submenus based on current path
    const initialActiveSubmenus = {};
    menuItems.forEach((item, index) => {
      if (item.submenu && pathname.startsWith(item.path)) {
        initialActiveSubmenus[index] = true;
      }
    });
    setActiveSubmenus(initialActiveSubmenus);
    
    // Handle mobile menu state on navigation
    setIsMobileMenuOpen(false);
  }, [pathname]); // Re-run when pathname changes

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
      
      if (window.innerWidth < 640) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial load
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainColor = 'rgb(8 76 115)';

  // Toggle submenu visibility
  const toggleSubmenu = (index, e) => {
    // Prevent the click from triggering navigation if clicking the dropdown area
    if (e) {
      e.stopPropagation();
    }
    
    setActiveSubmenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Check if a given path matches the current path or is a parent of the current path
  const isActive = (path) => {
    if (!pathname) return false;
    if (path === '/admin/dashboard' && pathname === path) {
      return true;
    }
    
    // Special case for exact match
    if (pathname === path) {
      return true;
    }
    
    // Check if it's a parent path (but not dashboard)
    return pathname.startsWith(path) && path !== '/admin/dashboard';
  };

  // Check if a specific submenu item is active
  const isSubmenuItemActive = (path) => {
    return pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed left-0 h-full flex flex-col transition-all duration-300 z-40
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          border-r border-gray-200`}
        style={{ backgroundColor: mainColor }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-opacity-20 border-gray-200">
          {isSidebarOpen && (
            <div className="text-xl font-bold text-white">
              <span>Admin Portal</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-white hover:bg-white/10"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Menu - With flex-grow to take available space */}
        <nav className="flex-grow overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <div className="relative">
                    {item.submenu ? (
                      <div className="flex flex-col">
                        {/* Parent menu item - Made navigatable */}
                        <div className="flex items-center">
                          <Link
                            href={item.path}
                            className={`flex-grow flex items-center p-2 rounded-lg transition-colors ${
                              isActive(item.path) 
                                ? 'bg-white/20 text-white' 
                                : 'text-white hover:bg-white/10'
                            }`}
                          >
                            <span className="mr-3">{item.icon}</span>
                            {isSidebarOpen && <span>{item.title}</span>}
                          </Link>
                          
                          {isSidebarOpen && (
                            <button
                              onClick={(e) => toggleSubmenu(index, e)}
                              className={`p-2 rounded-lg transition-colors ${
                                isActive(item.path) 
                                  ? 'text-white' 
                                  : 'text-white hover:bg-white/10'
                              }`}
                              aria-expanded={activeSubmenus[index]}
                              aria-controls={`submenu-${index}`}
                            >
                              <ChevronDown 
                                size={16} 
                                className={`transform transition-transform duration-300 ${
                                  activeSubmenus[index] ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        
                        {/* Submenu */}
                        {isSidebarOpen && (
                          <div 
                            id={`submenu-${index}`}
                            className={`pl-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                              activeSubmenus[index] ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            {item.submenu.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                href={subItem.path}
                                className={`block p-2 rounded-lg transition-colors ${
                                  isSubmenuItemActive(subItem.path)
                                    ? 'bg-white/20 text-white'
                                    : 'text-gray-100 hover:bg-white/10'
                                }`}
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        className={`flex items-center p-2 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-white/20 text-white'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {isSidebarOpen && <span>{item.title}</span>}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Logout Button - Positioned at the bottom */}
        <div className="p-4 border-t border-gray-700 mt-auto">
          <button
            className="w-full flex items-center p-2 text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={20} className="mr-3" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300
        ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
        ml-0
      `}>
        {/* Top Navbar */}
        <div 
          className={`fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 z-20
            ${isMobileMenuOpen ? 'pl-4' : 'pl-16 md:pl-4'}
            ${isSidebarOpen ? 'md:left-64' : 'md:left-20'}`}
        >
          <div className="flex items-center justify-between h-full px-4">
            <div className="font-semibold text-gray-800">
              {/* Dynamic page title based on current path */}
              {menuItems.find(item => isActive(item.path))?.title || 'Admin Dashboard'}
            </div>

            <div className="flex items-center space-x-4">
              {/* Simple avatar placeholder */}
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 pt-20 pb-16 min-h-screen bg-gray-100">
          {children}
        </div>

        {/* Footer */}
        <div 
          className={`fixed bottom-0 right-0 left-0 h-12 bg-white border-t border-gray-200 transition-all duration-300
            ${isSidebarOpen ? 'md:left-64' : 'md:left-20'}`}
        >
          <div className="flex items-center justify-between h-full px-4">
            <div className="text-sm text-gray-500">
              © 2025 OpticalConnect. All rights reserved.
            </div>
            <div className="text-sm text-gray-500">
              Admin Portal v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;