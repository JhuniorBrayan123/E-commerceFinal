import React, { useState } from "react";
import { authService } from "../services/authService";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface RegisterProps {
  onRegisterSuccess: (token: string, userData: User) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      if (result.success && result.data) {
        localStorage.setItem("access_token", result.data.tokens.access_token);
        localStorage.setItem("refresh_token", result.data.tokens.refresh_token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        onRegisterSuccess(result.data.tokens.access_token, result.data.user);
      } else {
        alert(result.message || "Error al registrarse");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Crear una cuenta
      </h2>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700">Nombre</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Ingresa tu nombre"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Ingresa tu apellido"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-700 hover:bg-primary-800 text-white py-2 rounded-lg"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        ¿Ya tienes una cuenta?
        <button
          onClick={onSwitchToLogin}
          className="text-primary-700 font-semibold ml-1 hover:underline"
        >
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
};

export default Register;
