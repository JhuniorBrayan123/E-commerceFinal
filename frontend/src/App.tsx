import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import LoginModal from "./components/LoginModal";
import PageTransition from "./components/PageTransition";
import { authService } from "./services/authService";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Categorias from "./pages/Categorias";
import Sensores from "./pages/Sensores";
import SensorDetalle from "./pages/SensorDetalle";
import Carrito from "./pages/Carrito";
import CRUDCategorias from "./pages/CRUDCategorias";
import Checkout from "./pages/Checkout";
import PaymentMethod from "./pages/PaymentMethod";
import ConfirmPayment from "./pages/ConfirmPayment";
import PaymentResult from "./pages/PaymentResult";
import BannerCarousel from "./components/BannerCarousel";


// 👇👇 NUEVO IMPORT QUE TE PEDÍ 👇👇
import SupportPage from "./pages/SupportPage";
import MisPedidos from "./pages/MisPedidos";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalView, setLoginModalView] = useState<"login" | "register">("login");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const result = await authService.verifyToken(token);
        if (result.success && result.data) {
          setUser(result.data.user);
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  };

  const handleLoginSuccess = (token: string, userData: User) => {
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  const handleRegisterSuccess = (token: string, userData: User) => {
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  const openLoginModal = (view: "login" | "register" = "login") => {
    setLoginModalView(view);
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      authService.logout(refreshToken);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      // Abrir modal de login en lugar de redirigir
      if (!isLoginModalOpen) {
        openLoginModal("login");
      }
      return null;
    }
    return <>{children}</>;
  };

  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={handleLogout} onOpenLogin={() => openLoginModal("login")} />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialView={loginModalView}
      />

      <PageTransition>
        <Routes>

          {/* Rutas públicas - accesibles sin login */}
          <Route
            path="/"
            element={
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/categorias"
            element={
              <AuthenticatedLayout>
                <Categorias />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/categorias/:id"
            element={
              <AuthenticatedLayout>
                <Categorias />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/soporte"
            element={
              <AuthenticatedLayout>
                <SupportPage />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/sensores/:stringParam/:id"
            element={
              <AuthenticatedLayout>
                <Sensores />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/sensores"
            element={
              <AuthenticatedLayout>
                <Sensores />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/sensores/:id"
            element={
              <AuthenticatedLayout>
                <SensorDetalle />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/carrito"
            element={
              <AuthenticatedLayout>
                <Carrito />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <MisPedidos />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas protegidas - requieren login */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Checkout />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-method"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <PaymentMethod />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/confirm-payment"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ConfirmPayment />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-result"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <PaymentResult />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CRUDCategorias />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </Router>
  );
}

export default App;
