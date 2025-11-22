<?php

class TokenController
{
    private $db;
    private $user;
    private $refreshToken;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
        $this->refreshToken = new RefreshToken($this->db);
    }

    // Verificar token
    public function verify()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $token = $data['token'] ?? '';

        if (empty($token)) {
            http_response_code(400);
            return json_encode([
                'success' => false,
                'message' => 'Token es requerido'
            ]);
        }

        $user_data = JWTService::verifyToken($token);

        if ($user_data) {
            // Verificar que el usuario aún existe y está activo
            if ($this->user->findById($user_data['user_id']) && $this->user->is_active) {
                http_response_code(200);
                return json_encode([
                    'success' => true,
                    'message' => 'Token válido',
                    'data' => [
                        'user_id' => $user_data['user_id'],
                        'email' => $user_data['email'],
                        'user' => [
                            'id' => $this->user->id,
                            'email' => $this->user->email,
                            'first_name' => $this->user->first_name,
                            'last_name' => $this->user->last_name
                        ]
                    ]
                ]);
            } else {
                http_response_code(401);
                return json_encode([
                    'success' => false,
                    'message' => 'Usuario no encontrado o desactivado'
                ]);
            }
        } else {
            http_response_code(401);
            return json_encode([
                'success' => false,
                'message' => 'Token inválido o expirado'
            ]);
        }
    }

    // Refresh token
    public function refresh()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $refresh_token = $data['refresh_token'] ?? '';

        if (empty($refresh_token)) {
            http_response_code(400);
            return json_encode([
                'success' => false,
                'message' => 'Refresh token es requerido'
            ]);
        }

        // Buscar refresh token válido
        if ($this->refreshToken->findValidToken($refresh_token)) {
            // Obtener información del usuario
            if ($this->user->findById($this->refreshToken->user_id) && $this->user->is_active) {
                // Generar nuevos tokens
                $new_access_token = JWTService::generateToken($this->user->id, $this->user->email);
                $new_refresh_token = JWTService::generateRefreshToken();

                // Revocar el refresh token anterior
                $this->refreshToken->revokeToken($refresh_token);

                // Guardar nuevo refresh token
                $this->refreshToken->user_id = $this->user->id;
                $this->refreshToken->token = $new_refresh_token;
                $this->refreshToken->expires_at = date('Y-m-d H:i:s', time() + (getenv('REFRESH_TOKEN_EXPIRE') ?: 604800));
                $this->refreshToken->is_revoked = 0;
                $this->refreshToken->create();

                http_response_code(200);
                return json_encode([
                    'success' => true,
                    'message' => 'Tokens actualizados',
                    'data' => [
                        'access_token' => $new_access_token,
                        'refresh_token' => $new_refresh_token,
                        'expires_in' => getenv('JWT_EXPIRE') ?: 3600
                    ]
                ]);
            } else {
                http_response_code(401);
                return json_encode([
                    'success' => false,
                    'message' => 'Usuario no encontrado o desactivado'
                ]);
            }
        } else {
            http_response_code(401);
            return json_encode([
                'success' => false,
                'message' => 'Refresh token inválido o expirado'
            ]);
        }
    }

    // Logout
    public function logout()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $refresh_token = $data['refresh_token'] ?? '';

        if (!empty($refresh_token)) {
            $this->refreshToken->revokeToken($refresh_token);
        }

        http_response_code(200);
        return json_encode([
            'success' => true,
            'message' => 'Logout exitoso'
        ]);
    }
}
