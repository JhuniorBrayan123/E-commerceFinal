// src/services/authService.ts
const API_BASE_URL = "http://localhost:8081/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
}

export const authService = {
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        // Si la respuesta no es OK, intentar parsear el JSON de error
        try {
          const errorData = await response.json();
          return {
            success: false,
            message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          };
        } catch {
          return {
            success: false,
            message: `Error ${response.status}: ${response.statusText}`,
          };
        }
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // Capturar errores de red (CORS, conexión, etc.)
      console.error("Error de red en login:", error);
      return {
        success: false,
        message: error.message || "Error de conexión. Verifica que el servidor esté corriendo.",
      };
    }
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    return await response.json();
  },

  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        // Si el token no es válido, retornar respuesta de error sin lanzar excepción
        return {
          success: false,
          message: "Token inválido o expirado",
        };
      }

      return await response.json();
    } catch (error) {
      // Silenciar errores de red para evitar logs innecesarios
      return {
        success: false,
        message: "Error al verificar token",
      };
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    return await response.json();
  },

  async logout(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    return await response.json();
  },
};
