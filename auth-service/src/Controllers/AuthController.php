<?php

class AuthController
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

    // Registro de usuario
    public function register()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validar datos requeridos
        if (empty($data['email']) || empty($data['password']) || empty($data['first_name']) || empty($data['last_name'])) {
            http_response_code(400);
            return json_encode([
                'success' => false,
                'message' => 'Todos los campos son requeridos'
            ]);
        }

        // Validar email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return json_encode([
                'success' => false,
                'message' => 'Email no válido'
            ]);
        }

        // Validar password
        $passwordErrors = PasswordService::validatePassword($data['password']);
        if (!empty($passwordErrors)) {
            http_response_code(400);
            return json_encode([
                'success' => false,
                'message' => 'La contraseña no cumple con los requisitos',
                'errors' => $passwordErrors
            ]);
        }

        // Verificar si el usuario ya existe
        if ($this->user->findByEmail($data['email'])) {
            http_response_code(409);
            return json_encode([
                'success' => false,
                'message' => 'El usuario ya existe'
            ]);
        }

        // Crear usuario
        $this->user->email = $data['email'];
        $this->user->password = $data['password'];
        $this->user->first_name = $data['first_name'];
        $this->user->last_name = $data['last_name'];
        $this->user->is_active = 1;
        $this->user->created_at = date('Y-m-d H:i:s');

        if ($this->user->create()) {
            // Generar tokens
            $access_token = JWTService::generateToken($this->user->id, $this->user->email);
            $refresh_token = JWTService::generateRefreshToken();

            // Guardar refresh token
            $this->refreshToken->user_id = $this->user->id;
            $this->refreshToken->token = $refresh_token;
            $this->refreshToken->expires_at = date('Y-m-d H:i:s', time() + (getenv('REFRESH_TOKEN_EXPIRE') ?: 604800));
            $this->refreshToken->is_revoked = 0;
            $this->refreshToken->create();

            http_response_code(201);
            return json_encode([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'data' => [
                    'user' => [
                        'id' => $this->user->id,
                        'email' => $this->user->email,
                        'first_name' => $this->user->first_name,
                        'last_name' => $this->user->last_name
                    ],
                    'tokens' => [
                        'access_token' => $access_token,
                        'refresh_token' => $refresh_token,
                        'expires_in' => getenv('JWT_EXPIRE') ?: 3600
                    ]
                ]
            ]);
        } else {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'message' => 'Error al crear el usuario'
            ]);
        }
    }

    // Login de usuario
    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validar datos requeridos
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            return json_encode([
                'success' => false,
                'message' => 'Email y contraseña son requeridos'
            ]);
        }

        // Buscar usuario
        if (!$this->user->findByEmail($data['email'])) {
            http_response_code(401);
            return json_encode([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ]);
        }

        // Verificar password
        if (!$this->user->verifyPassword($data['password'])) {
            http_response_code(401);
            return json_encode([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ]);
        }

        // Verificar si el usuario está activo
        if (!$this->user->is_active) {
            http_response_code(403);
            return json_encode([
                'success' => false,
                'message' => 'Usuario desactivado'
            ]);
        }

        // Generar tokens
        $access_token = JWTService::generateToken($this->user->id, $this->user->email);
        $refresh_token = JWTService::generateRefreshToken();

        // Guardar refresh token
        $this->refreshToken->user_id = $this->user->id;
        $this->refreshToken->token = $refresh_token;
        $this->refreshToken->expires_at = date('Y-m-d H:i:s', time() + (getenv('REFRESH_TOKEN_EXPIRE') ?: 604800));
        $this->refreshToken->is_revoked = 0;
        $this->refreshToken->create();

        http_response_code(200);
        return json_encode([
            'success' => true,
            'message' => 'Login exitoso',
            'data' => [
                'user' => [
                    'id' => $this->user->id,
                    'email' => $this->user->email,
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name
                ],
                'tokens' => [
                    'access_token' => $access_token,
                    'refresh_token' => $refresh_token,
                    'expires_in' => getenv('JWT_EXPIRE') ?: 3600
                ]
            ]
        ]);
    }
}
