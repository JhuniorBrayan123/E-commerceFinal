<?php

class JwtMiddleware
{

    public static function verify($token)
    {
        if (empty($token)) {
            return [
                'success' => false,
                'message' => 'Token no proporcionado'
            ];
        }

        $user_data = JWTService::verifyToken($token);

        if (!$user_data) {
            return [
                'success' => false,
                'message' => 'Token inválido o expirado'
            ];
        }

        return [
            'success' => true,
            'data' => $user_data
        ];
    }
}
