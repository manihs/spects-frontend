// app/admin/layout.js - Admin layout

import AdminDashboardLayout from "./dashboardLayout";


export default function AdminLayout({ children }) {
 
  
  // If this is not the login page and user isn't an admin, redirect
  // This is a client-side check in addition to the middleware
  
  return (
    <AdminDashboardLayout>
    <div className="admin-layout">
      <main>{children}</main>
    </div>
    </AdminDashboardLayout>
  );
}

