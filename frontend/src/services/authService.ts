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
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    return await response.json();
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
