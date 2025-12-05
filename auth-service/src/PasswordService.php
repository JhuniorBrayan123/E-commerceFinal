<?php

class PasswordService
{
    /**
     * Validar que la contraseña cumpla con los requisitos
     * @param string $password
     * @return array Lista de errores (vacío si es válida)
     */
    public function validatePassword(string $password): array
    {
        $errors = [];

        // Mínimo 8 caracteres
        if (strlen($password) < 8) {
            $errors[] = "La contraseña debe tener al menos 8 caracteres";
        }

        // Al menos una mayúscula
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = "La contraseña debe contener al menos una letra mayúscula";
        }

        // Al menos una minúscula
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = "La contraseña debe contener al menos una letra minúscula";
        }

        // Al menos un número
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = "La contraseña debe contener al menos un número";
        }

        // Al menos un carácter especial
        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>?\/\\|`~]/', $password)) {
            $errors[] = "La contraseña debe contener al menos un carácter especial";
        }

        return $errors;
    }

    /**
     * Hash de la contraseña usando bcrypt
     * @param string $password
     * @return string|false Hash de la contraseña
     */
    public function hashPassword(string $password): string|false
    {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    /**
     * Verificar que la contraseña coincida con el hash
     * @param string $password
     * @param string $hash
     * @return bool
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }
}
