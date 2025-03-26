'use client';
import Footer from "@/components/store/Footer";
import Navbar from "@/components/store/Navbar";
import CheckoutNavbar from "@/components/store/CheckoutNavbar";
import { usePathname } from 'next/navigation';

export default function StoreLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="store-layout">

     {!pathname?.startsWith('/checkout') ? (<Navbar />) : (<CheckoutNavbar />)}
      <main>{children}</main>
      <Footer />
    </div>
  );
}