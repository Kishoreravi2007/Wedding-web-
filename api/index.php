<?php
declare(strict_types=1);

$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$normalized = strtolower(rtrim($requestUri ?? '', '/'));

if (strpos($normalized, '/api/contact') !== false) {
    require_once __DIR__ . '/contact.php';
    handleContactRequest();
    exit;
}

http_response_code(404);
header('Content-Type: application/json; charset=UTF-8');
echo json_encode([
    'success' => false,
    'error' => 'Endpoint not found.',
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
exit;

