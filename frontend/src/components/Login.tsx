// src/components/Login.tsx
import React, { useState } from "react";
import { authService, LoginData } from "../services/authService";

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.login(formData);

      if (result.success && result.data) {
        // Guardar token en localStorage
        localStorage.setItem("access_token", result.data.tokens.access_token);
        localStorage.setItem("refresh_token", result.data.tokens.refresh_token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        onLoginSuccess(result.data.tokens.access_token, result.data.user);
      } else {
        setError(result.message || "Error en el login");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToRegister}
          className="text-blue-500 hover:text-blue-700"
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </div>
  );
};

export default Login;
