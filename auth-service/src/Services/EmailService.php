<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    public static function sendVerificationEmail($email, $token)
    {
        $mail = new PHPMailer(true);

        try {
            // Configuración del servidor
            $mail->isSMTP();
            $mail->Host       = getenv('SMTP_HOST');
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('SMTP_USER');
            $mail->Password   = getenv('SMTP_PASS');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = getenv('SMTP_PORT');

            // Remitente y destinatario
            $mail->setFrom(getenv('SMTP_FROM_EMAIL'), getenv('SMTP_FROM_NAME'));
            $mail->addAddress($email);

            // Contenido
            $mail->isHTML(true);
            $mail->Subject = 'Verifica tu cuenta';
            
            $verificationLink = getenv('FRONTEND_URL') . "/verify-email?token=" . $token;
            
            $mail->Body    = "
                <h1>Bienvenido a AgroCode</h1>
                <p>Gracias por registrarte. Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
                <p><a href='$verificationLink'>Verificar mi cuenta</a></p>
                <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
            ";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Error al enviar email: {$mail->ErrorInfo}");
            return false;
        }
    }
}
