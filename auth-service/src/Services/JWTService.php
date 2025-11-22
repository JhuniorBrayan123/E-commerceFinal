<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTService
{
    private static $secret_key;
    private static $algorithm = 'HS256';

    public static function init()
    {
        self::$secret_key = getenv('JWT_SECRET') ?: 'fallback_secret_key';
    }

    // Generar JWT token
    public static function generateToken($user_id, $email)
    {
        self::init();

        $issued_at = time();
        $expiration_time = $issued_at + (getenv('JWT_EXPIRE') ?: 3600);

        $payload = [
            'iss' => 'auth-service', // Issuer
            'iat' => $issued_at, // Issued at
            'exp' => $expiration_time, // Expiration
            'data' => [
                'user_id' => $user_id,
                'email' => $email
            ]
        ];

        return JWT::encode($payload, self::$secret_key, self::$algorithm);
    }

    // Verificar JWT token
    public static function verifyToken($token)
    {
        self::init();

        try {
            $decoded = JWT::decode($token, new Key(self::$secret_key, self::$algorithm));
            return (array) $decoded->data;
        } catch (Exception $e) {
            return false;
        }
    }

    // Generar refresh token
    public static function generateRefreshToken()
    {
        return bin2hex(random_bytes(64));
    }
}
