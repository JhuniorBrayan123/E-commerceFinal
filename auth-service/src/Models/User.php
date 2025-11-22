<?php

class User
{
    private $conn;
    private $table_name = "users";

    public $id;
    public $email;
    public $password;
    public $first_name;
    public $last_name;
    public $is_active;
    public $created_at;
    public $updated_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Crear usuario
    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . " 
                SET email=:email, password=:password, first_name=:first_name, 
                    last_name=:last_name, is_active=:is_active, created_at=:created_at";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));

        // Hash password
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);

        // Bind parameters
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":is_active", $this->is_active);
        $stmt->bindParam(":created_at", $this->created_at);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Buscar usuario por email
    public function findByEmail($email)
    {
        $query = "SELECT id, email, password, first_name, last_name, is_active, created_at 
                  FROM " . $this->table_name . " 
                  WHERE email = :email LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->is_active = $row['is_active'];
            $this->created_at = $row['created_at'];

            return true;
        }
        return false;
    }

    // Buscar usuario por ID
    public function findById($id)
    {
        $query = "SELECT id, email, first_name, last_name, is_active, created_at 
                  FROM " . $this->table_name . " 
                  WHERE id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->is_active = $row['is_active'];
            $this->created_at = $row['created_at'];

            return true;
        }
        return false;
    }

    // Verificar password
    public function verifyPassword($password)
    {
        return password_verify($password, $this->password);
    }
}
