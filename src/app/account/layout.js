'use client'

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  ShoppingBag, 
  User,
  Package,
  Settings,
  LogOut,
  Heart,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function AccountLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define menu items for customer account
  const menuItems = [
    { 
      title: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      path: '/account/' 
    },
    { 
      title: 'My Profile', 
      icon: <User size={20} />, 
      path: '/account/profile' 
    },
    { 
      title: 'My Orders', 
      icon: <ShoppingBag size={20} />, 
      path: '/account/orders' 
    },
    {
      title: 'Shop Now',
      icon: <Package size={20} />,
      path: '/products',
    }
  ];

  // Handle mobile menu and resize
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

  // Check if a route is active
  const isActive = (path) => {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(path);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Show login/register page if not authenticated
  if (pathname === '/account/login' || pathname === '/account/register') {
    return <div className="min-h-screen">{children}</div>;
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect unauthenticated users (handled by middleware)
  if (status === 'unauthenticated') {
    return children; // Middleware will handle redirect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button - only visible on small screens */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay - only visible when mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {isSidebarOpen && (
            <div className="text-xl font-bold text-blue-600">
              <span>My Account</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 md:block hidden"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.path}
                    className={`flex items-center p-2 rounded-lg transition-colors
                      ${isActive(item.path) 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {isSidebarOpen && <span>{item.title}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-2 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
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
        ml-0 pt-16 md:pt-0
      `}>
        {/* Main Content Area */}
        <div className="p-4 md:p-6 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}