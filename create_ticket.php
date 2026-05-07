<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Methode nicht erlaubt"]);
    exit;
}

// Supabase configuration
$supabaseUrl = "https://bvluvvyvftygnxtmboxw.supabase.co";
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bHV2dnl2ZnR5Z254dG1ib3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzU1NTQsImV4cCI6MjA4NTgxMTU1NH0.sw1wb1pLj9Ne-ZoGbQcR6mA5yDHe2PZbImEzt76lP-o";

// Get form data
$firstname = trim($_POST["firstname"] ?? "");
$lastname = trim($_POST["lastname"] ?? "");
$salutation = trim($_POST["salutation"] ?? "");
$company = trim($_POST["company"] ?? "");
$email = trim($_POST["email"] ?? "");
$phone = trim($_POST["phone"] ?? "");
$message = trim($_POST["message"] ?? "");

// Validate required fields
if (empty($firstname) || empty($lastname) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(["error" => "Bitte füllen Sie alle Pflichtfelder aus."]);
    exit;
}

// Build the ticket title
$title = "Webseite: Support-Anfrage von $salutation $firstname $lastname";
if (!empty($company)) {
    $title = "Webseite: Support-Anfrage von $company ($salutation $firstname $lastname)";
}

// Build the ticket description with all contact details
$description = "";
if (!empty($salutation)) {
    $description .= "Anrede: $salutation\n";
}
$description .= "Name: $firstname $lastname\n";
if (!empty($company)) {
    $description .= "Firma: $company\n";
}
$description .= "E-Mail: $email\n";
if (!empty($phone)) {
    $description .= "Telefon: $phone\n";
}
$description .= "\nProblembeschreibung:\n$message";

// Create the ticket payload
$ticketData = [
    "title" => $title,
    "description" => $description,
    "status" => "open",
    "priority" => "medium",
];

// Send the ticket to Supabase
$ch = curl_init("$supabaseUrl/rest/v1/tickets");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($ticketData),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "apikey: $supabaseKey",
        "Authorization: Bearer $supabaseKey",
        "Prefer: return=representation",
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(["error" => "Verbindungsfehler: $curlError"]);
    exit;
}

if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode(["success" => "Vielen Dank! Ihr Support-Ticket wurde erfolgreich erstellt. Wir melden uns in Kürze bei Ihnen."]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Beim Erstellen des Tickets ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal oder kontaktieren Sie uns telefonisch."]);
}
?>
