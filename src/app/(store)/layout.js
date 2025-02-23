import Footer from "@/components/store/Footer";
import Navbar from "@/components/store/Navbar";


export default function StoreLayout({ children }) {
  return (
    <div className="store-layout">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}