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
$email = trim($_POST["email"] ?? "");
$calculationJson = $_POST["calculation"] ?? "{}";
$calculation = json_decode($calculationJson, true) ?: [];

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Bitte geben Sie eine gültige E-Mail-Adresse ein."]);
    exit;
}

// 1. Send E-Mail to User
$to = $email;
$subject = "[Gross ICT] Ihr Festpreis-Angebot / Anfrage";

$fmtChf = function($n) {
    return 'CHF ' . number_format($n, 0, '.', '\'');
};

$emailContent = "Guten Tag,\n\n";
$emailContent .= "Vielen Dank für Ihre Anfrage über unseren Webseitenrechner.\n";
$emailContent .= "Hier ist die Zusammenfassung Ihrer Konfiguration:\n\n";

if (!empty($calculation)) {
    $discountPct = $calculation['discountPct'] ?? 0;
    $customerLabel = $calculation['customerLabel'] ?? 'Unternehmen / KMU';
    
    $emailContent .= "Kundentyp: $customerLabel" . ($discountPct > 0 ? " (-$discountPct %)" : "") . "\n\n";
    
    if (isset($calculation['items']) && is_array($calculation['items'])) {
        foreach ($calculation['items'] as $item) {
            $emailContent .= "• " . $item['label'] . ": " . $fmtChf($item['price']) . "\n";
        }
    }
    
    $emailContent .= "\n";
    $emailContent .= "Festpreis (einmalig): " . $fmtChf($calculation['total'] ?? 0) . "\n";
    $emailContent .= "Hosting monatlich: " . $fmtChf($calculation['monthlyHosting'] ?? 0) . "\n";
    $emailContent .= "Wartung monatlich: " . $fmtChf($calculation['monthlyMaint'] ?? 0) . "\n\n";
}

$emailContent .= "Wie geht es nun weiter?\n";
$emailContent .= "Wir werden Ihre Anfrage prüfen und uns innert 2 Arbeitstagen persönlich bei Ihnen melden, um die Details zu besprechen.\n\n";
$emailContent .= "Freundliche Grüsse\nGross ICT\n\n";
$emailContent .= "Gross ICT\nNeuhushof 3\n6144 Zell LU\ninfo@gross-ict.ch\nhttps://gross-ict.ch";

$headers = "From: Gross ICT <info@gross-ict.ch>\r\n";
$headers .= "Reply-To: info@gross-ict.ch\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Optional: Bcc an info@gross-ict.ch zur Sicherheit
$headers .= "Bcc: info@gross-ict.ch\r\n";

mail($to, $subject, $emailContent, $headers, "-f info@gross-ict.ch");

// 2. Create Quote in Supabase
// A) Find latest quote number
$chSearch = curl_init("$supabaseUrl/rest/v1/quotes?select=quote_number&quote_number=like.ANG-%&order=quote_number.desc&limit=1");
curl_setopt_array($chSearch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPGET => true,
    CURLOPT_HTTPHEADER => [
        "apikey: $supabaseKey",
        "Authorization: Bearer $supabaseKey"
    ]
]);
$searchRes = curl_exec($chSearch);
curl_close($chSearch);

$latestNum = 0;
if ($searchRes) {
    $searchData = json_decode($searchRes, true);
    if (!empty($searchData) && isset($searchData[0]['quote_number'])) {
        $numPart = str_replace("ANG-" . date("Y") . "-" . date("m") . "-", "", $searchData[0]['quote_number']);
        $latestNum = intval($numPart);
    }
}
$newQuoteNumber = "ANG-" . date("Y") . "-" . date("m") . "-" . str_pad($latestNum + 1, 3, "0", STR_PAD_LEFT);

// Notizen vorbereiten
$notes = "Anfrage über Webseitenrechner\nE-Mail: $email\n\nGewählte Konfiguration:\n";
if (isset($calculation['items']) && is_array($calculation['items'])) {
    foreach ($calculation['items'] as $item) {
        $notes .= "- " . $item['label'] . ": " . $fmtChf($item['price']) . "\n";
    }
}
$notes .= "\nHosting monatlich: " . $fmtChf($calculation['monthlyHosting'] ?? 0);
$notes .= "\nWartung monatlich: " . $fmtChf($calculation['monthlyMaint'] ?? 0);

// Subtotal & Total
$total = floatval($calculation['total'] ?? 0);
// 8.1% MwSt annehmen für die Speicherung, oder Brutto = Netto falls nicht anders definiert. Wir speichern einfach das Total.
$subtotal = round($total / 1.081, 2);
$tax = $total - $subtotal;

// B) Insert Quote
$quoteData = [
    "quote_number" => $newQuoteNumber,
    "quote_date" => date("Y-m-d"),
    "valid_until" => date("Y-m-d", strtotime("+30 days")),
    "status" => "draft",
    "notes" => $notes,
    "subtotal" => $subtotal,
    "tax" => $tax,
    "total" => $total
];

$chInsert = curl_init("$supabaseUrl/rest/v1/quotes");
curl_setopt_array($chInsert, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($quoteData),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "apikey: $supabaseKey",
        "Authorization: Bearer $supabaseKey",
        "Prefer: return=representation"
    ]
]);
$insertRes = curl_exec($chInsert);
$httpCode = curl_getinfo($chInsert, CURLINFO_HTTP_CODE);
curl_close($chInsert);

// 3. Send Push Notification via Edge Function
if ($httpCode >= 200 && $httpCode < 300) {
    $pushData = [
        "recipients" => "all_admins",
        "recipientType" => "admin",
        "title" => "📄 Neue Festpreis-Anfrage",
        "body" => "Anfrage von $email für $total CHF",
        "data" => [
            "category" => "quotes", // This is important for user preferences
            "type" => "new_quote",
            "url" => "/quotes"
        ]
    ];

    $pushCh = curl_init("$supabaseUrl/functions/v1/send-push");
    curl_setopt_array($pushCh, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($pushData),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer $supabaseKey"
        ]
    ]);
    curl_exec($pushCh);
    curl_close($pushCh);

    echo json_encode(["success" => "Vielen Dank! Das Angebot wurde angefordert. Wir melden uns in Kürze."]);
} else {
    // Quote creation failed
    http_response_code(500);
    echo json_encode(["error" => "Ein interner Fehler ist aufgetreten (CRM). Die E-Mail wurde jedoch gesendet."]);
}
?>
