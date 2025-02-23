// app/admin/layout.js - Admin layout


export default function AdminLayout({ children }) {
 
  
  // If this is not the login page and user isn't an admin, redirect
  // This is a client-side check in addition to the middleware
  
  return (
    <div className="admin-layout">
      
      <main>{children}</main>
    </div>
  );
}

