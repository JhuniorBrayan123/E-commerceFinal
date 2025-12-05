<?php

class JWTService
{
    private string $secret;
    private int $expiration = 3600; // 1 hora

    public function __construct(string $secret = 'your-secret-key')
    {
        $this->secret = $secret;
    }

    /**
     * Generar JWT token
     */
    public function generateToken(int $userId, string $email): string
    {
        $header = $this->base64Encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));

        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'exp' => time() + $this->expiration,
            'iat' => time()
        ];

        $payload = $this->base64Encode(json_encode($payload));

        $signature = $this->base64Encode(
            hash_hmac('sha256', "$header.$payload", $this->secret, true)
        );

        return "$header.$payload.$signature";
    }

    /**
     * Verificar JWT token
     */
    public function verifyToken(string $token): array|false
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        [$header, $payload, $signature] = $parts;

        // Verificar firma
        $expectedSignature = $this->base64Encode(
            hash_hmac('sha256', "$header.$payload", $this->secret, true)
        );

        if ($signature !== $expectedSignature) {
            return false;
        }

        // Decodificar payload
        $decodedPayload = json_decode($this->base64Decode($payload), true);

        if (!$decodedPayload) {
            return false;
        }

        // Verificar expiración
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return false;
        }

        return $decodedPayload;
    }

    /**
     * Generar refresh token (string aleatorio de 128 caracteres)
     */
    public function generateRefreshToken(): string
    {
        return bin2hex(random_bytes(64)); // 128 caracteres hexadecimales
    }

    private function base64Encode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64Decode(string $data): string|false
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', strlen($data) % 4), true);
    }
}
