import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: User) => void;
  initialView?: "login" | "register";
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialView = "login",
}) => {
  const [currentView, setCurrentView] = useState<"login" | "register">(initialView);

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar el scroll actual
      const scrollY = window.scrollY;
      // Bloquear scroll del body
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restaurar scroll cuando se cierra el modal
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Resetear a login cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView);
    }
  }, [isOpen, initialView]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSuccess = (token: string, user: User) => {
    onLoginSuccess(token, user);
    onClose();
  };

  const handleRegisterSuccess = (token: string, user: User) => {
    onLoginSuccess(token, user);
    onClose();
  };

  return (
    <>
      {/* Overlay con backdrop blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 animate-[fadeIn_0.2s_ease-in-out]"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: "fadeIn 0.2s ease-in-out" }}
      />

      {/* Modal centrado con animación Scale Up y Fade In */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto modal-enter"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal con botón cerrar */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              {currentView === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              aria-label="Cerrar modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            {currentView === "login" ? (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setCurrentView("register")}
              />
            ) : (
              <Register
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setCurrentView("login")}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;

