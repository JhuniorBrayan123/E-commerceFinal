import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
