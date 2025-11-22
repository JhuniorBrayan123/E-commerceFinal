import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import { authService } from "./services/authService";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Categorias from "./pages/Categorias";
import Productos from "./pages/Productos";
import ProductoDetalle from "./pages/ProductoDetalle";
import Sensores from "./pages/Sensores";
import Carrito from "./pages/Carrito";
import Inventario from "./pages/Inventario";
import CRUDProductos from "./pages/CRUDProductos";
import CRUDCategorias from "./pages/CRUDCategorias";

// 👇👇 NUEVO IMPORT QUE TE PEDÍ 👇👇
import SupportPage from "./pages/SupportPage";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAuthView, setCurrentAuthView] = useState<"login" | "register">(
    "login"
  );

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
  };

  const handleRegisterSuccess = (token: string, userData: User) => {
    setUser(userData);
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
    setCurrentAuthView("login");
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  };

  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    );
  };

  const AuthPage = () => {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          {currentAuthView === "login" ? (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentAuthView("register")}
            />
          ) : (
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setCurrentAuthView("login")}
            />
          )}
        </div>
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
    <Router>
      {!user ? (
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      ) : (
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/"
            element={
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/productos"
            element={
              <AuthenticatedLayout>
                <Productos />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/productos/:id"
            element={
              <AuthenticatedLayout>
                <ProductoDetalle />
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

          {/* 👇👇 NUEVA RUTA /soporte 👇👇 */}
          <Route
            path="/soporte"
            element={
              <AuthenticatedLayout>
                <SupportPage />
              </AuthenticatedLayout>
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/carrito"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Carrito />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sensores"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Sensores />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Inventario />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CRUDProductos />
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

          {/* Redirecciones */}
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
