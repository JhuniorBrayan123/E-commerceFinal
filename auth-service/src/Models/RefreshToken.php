<?php

class RefreshToken
{
    private $conn;
    private $table_name = "refresh_tokens";

    public $id;
    public $user_id;
    public $token;
    public $expires_at;
    public $is_revoked;
    public $created_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Crear refresh token
    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . " 
                SET user_id=:user_id, token=:token, expires_at=:expires_at, is_revoked=:is_revoked";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":token", $this->token);
        $stmt->bindParam(":expires_at", $this->expires_at);
        $stmt->bindParam(":is_revoked", $this->is_revoked);

        return $stmt->execute();
    }

    // Buscar token válido
    public function findValidToken($token)
    {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE token = :token 
                  AND is_revoked = 0 
                  AND expires_at > NOW() 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->token = $row['token'];
            $this->expires_at = $row['expires_at'];
            $this->is_revoked = $row['is_revoked'];
            $this->created_at = $row['created_at'];

            return true;
        }
        return false;
    }

    // Revocar token
    public function revokeToken($token)
    {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_revoked = 1 
                  WHERE token = :token";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);

        return $stmt->execute();
    }

    // Revocar todos los tokens de un usuario
    public function revokeAllUserTokens($user_id)
    {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_revoked = 1 
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);

        return $stmt->execute();
    }
}
