<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $company = trim($_POST["company"] ?? "");
    $phone = trim($_POST["phone"] ?? "");
    $subject = trim($_POST["subject"] ?? "Anfrage über Webseite");
    $message = trim($_POST["message"] ?? "");

    // Check required fields
    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(["error" => "Bitte füllen Sie alle Pflichtfelder aus."]);
        exit;
    }

    // Prepare email
    $to = "info@gross-ict.ch";
    $email_subject = "[Webseite] $subject";
    
    $email_content = "Name: $name\n";
    $email_content .= "E-Mail: $email\n";
    if (!empty($company)) {
        $email_content .= "Firma: $company\n";
    }
    if (!empty($phone)) {
        $email_content .= "Telefon: $phone\n";
    }
    $email_content .= "\nNachricht:\n$message\n";

    // Headers - we use info@gross-ict.ch as the sender to avoid spam filter issues
    // and set the Reply-To to the actual sender's email address.
    $headers = "From: Webseite <info@gross-ict.ch>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Send email (Using -f to set the envelope sender, crucial for Hetzner and spam filters)
    if (mail($to, $email_subject, $email_content, $headers, "-f" . $to)) {
        http_response_code(200);
        echo json_encode(["success" => "Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet."]);
    } else {
        http_response_code(500);
        $error = error_get_last();
        echo json_encode(["error" => "Beim Senden der Nachricht ist ein Fehler aufgetreten. Details: " . ($error['message'] ?? 'Unbekannter Fehler')]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Methode nicht erlaubt"]);
}
?>
