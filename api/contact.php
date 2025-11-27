<?php
declare(strict_types=1);

require_once __DIR__ . '/../services/AiResponder.php';
require_once __DIR__ . '/../services/MailService.php';

define('WEDDINGWEB_PROJECT_ROOT', dirname(__DIR__));
define('RATE_LIMIT_SECONDS', 300);
define('SPAM_KEYWORDS', [
    'free money',
    'earn cash',
    'viagra',
    'loan offer',
    'work from home',
    'click here',
    'visit my website',
    'urgent offer',
]);

function handleContactRequest(): void
{
    $rootDir = WEDDINGWEB_PROJECT_ROOT;
    loadDotEnv("{$rootDir}/.env");
    setCorsHeaders();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respondJson(405, [
            'success' => false,
            'error' => 'Only POST /api/contact is supported.',
        ]);
    }

    $payload = json_decode(file_get_contents('php://input') ?: '', true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($payload)) {
        respondJson(400, [
            'success' => false,
            'error' => 'Invalid JSON payload.',
        ]);
    }

    $name = sanitizeString($payload['name'] ?? '');
    $email = filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $phone = sanitizePhone($payload['phone'] ?? '');
    $message = sanitizeString($payload['message'] ?? '');
    $context = sanitizeString($payload['context'] ?? $payload['form'] ?? 'Contact form');

    if ($name === '' || $message === '') {
        respondJson(400, [
            'success' => false,
            'error' => 'Name and message are required.',
        ]);
    }

    if ($email === false) {
        logSecurityEvent('invalid_email', 'Invalid email received: ' . ($payload['email'] ?? 'n/a'), $rootDir);
        respondJson(400, [
            'success' => false,
            'error' => 'A valid email address is required.',
        ]);
    }

    if (isSpam($name . ' ' . $message)) {
        logSecurityEvent('spam_detected', 'Spam keywords detected for email: ' . $email, $rootDir);
        respondJson(422, [
            'success' => false,
            'error' => 'Your message appears to be spam. Please revise and try again.',
        ]);
    }

    enforceRateLimit($email, $rootDir);

    try {
        $geminiKey = env('GEMINI_API_KEY');
        $smtpHost = env('SMTP_HOST');
        $smtpPort = (int)env('SMTP_PORT', '587');
        $smtpUser = env('SMTP_USER');
        $smtpPass = env('SMTP_PASS');
        $adminEmail = env('ADMIN_EMAIL');
        $fromEmail = env('SMTP_FROM', $smtpUser);
        $fromName = env('SMTP_FROM_NAME', 'WeddingWeb Support');

        if ($geminiKey === null) {
            throw new RuntimeException('Missing GEMINI_API_KEY in environment.');
        }

        if ($smtpHost === null || $smtpUser === null || $smtpPass === null || $adminEmail === null) {
            throw new RuntimeException('SMTP_HOST, SMTP_USER, SMTP_PASS, and ADMIN_EMAIL must be configured.');
        }

        $aiResponder = new AiResponder($geminiKey);
        $aiReply = $aiResponder->generateReply($name, $message, $context);

        $mailService = new MailService(
            $smtpHost,
            $smtpPort,
            $smtpUser,
            $smtpPass,
            $fromEmail,
            $fromName,
            $adminEmail
        );

        $trackingId = uniqid('enquiry_', true);
        $timestamp = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DATE_ATOM);

        $mailService->sendAutoReplyToCustomer($email, $name, $aiReply);
        $mailService->sendAdminNotification([
            'trackingId' => $trackingId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'context' => $context,
            'message' => $message,
            'reply' => $aiReply,
            'created_at' => $timestamp,
        ]);

        saveEnquiry("{$rootDir}/storage/enquiries", [
            'id' => $trackingId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'message' => $message,
            'context' => $context,
            'reply' => $aiReply,
            'created_at' => $timestamp,
        ]);

        respondJson(200, [
            'success' => true,
            'reply' => $aiReply,
            'trackingId' => $trackingId,
        ]);
    } catch (Throwable $exception) {
        error_log('Auto email responder error: ' . $exception->getMessage());
        respondJson(500, [
            'success' => false,
            'error' => 'Unable to process the enquiry at this time.',
            'details' => $exception->getMessage(),
        ]);
    }
}

if (php_sapi_name() !== 'cli' && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    handleContactRequest();
}

function setCorsHeaders(): void
{
    $origin = env('FRONTEND_URL', '*');
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: ' . ($origin === '*' ? '*' : $origin));
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Cache-Control: no-store');
}

function isSpam(string $text): bool
{
    $lower = mb_strtolower($text, 'UTF-8');

    foreach (SPAM_KEYWORDS as $keyword) {
        if (strpos($lower, $keyword) !== false) {
            return true;
        }
    }

    return false;
}

function enforceRateLimit(string $email, string $rootDir): void
{
    $rateDir = "{$rootDir}/storage/rate_limits";

    if (!is_dir($rateDir) && !mkdir($rateDir, 0755, true) && !is_dir($rateDir)) {
        throw new RuntimeException("Unable to create rate limit storage at {$rateDir}.");
    }

    $filename = $rateDir . '/' . md5(strtolower($email)) . '.json';
    $now = time();

    if (file_exists($filename)) {
        $stored = json_decode(file_get_contents($filename) ?: '{}', true);
        $lastSent = isset($stored['last_sent']) ? (int)$stored['last_sent'] : 0;

        if (($now - $lastSent) < RATE_LIMIT_SECONDS) {
            logSecurityEvent('rate_limited', "Rate limit triggered for {$email}", $rootDir);
            respondJson(429, [
                'success' => false,
                'error' => 'You can only submit one enquiry per 5 minutes. Please try again later.',
                'retryAfterSeconds' => RATE_LIMIT_SECONDS - ($now - $lastSent),
            ]);
        }
    }

    $payload = json_encode(['email' => $email, 'last_sent' => $now], JSON_UNESCAPED_SLASHES);

    if ($payload === false) {
        throw new RuntimeException('Failed to serialize rate limit payload.');
    }

    file_put_contents($filename, $payload, LOCK_EX);
}

function respondJson(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitizeString(string $value): string
{
    return trim(preg_replace('/\s+/', ' ', $value));
}

function sanitizePhone(string $value): string
{
    $clean = preg_replace('/[^\d+\-\s()]/', '', $value);
    return trim(preg_replace('/\s+/', ' ', $clean));
}

function loadDotEnv(string $path): array
{
    if (!is_readable($path)) {
        return [];
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $vars = [];

    foreach ($lines as $line) {
        $trimmed = trim($line);

        if ($trimmed === '' || $trimmed[0] === '#') {
            continue;
        }

        if (!preg_match('/^([A-Za-z0-9_]+)\s*=\s*(.*)$/', $trimmed, $matches)) {
            continue;
        }

        $key = $matches[1];
        $value = $matches[2];
        $value = unquote($value);
        $vars[$key] = $value;
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
    }

    return $vars;
}

function unquote(string $value): string
{
    $value = trim($value);

    if ($value === '') {
        return '';
    }

    $first = $value[0];
    $last = $value[strlen($value) - 1];

    if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
        $value = substr($value, 1, -1);
    }

    return str_replace('\n', "\n", $value);
}

function env(string $key, $default = null)
{
    if (array_key_exists($key, $_ENV) && $_ENV[$key] !== null && $_ENV[$key] !== false) {
        return $_ENV[$key];
    }

    $value = getenv($key);

    if ($value !== false) {
        return $value;
    }

    return $default;
}

function saveEnquiry(string $directory, array $record): void
{
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException("Unable to create storage directory at {$directory}.");
    }

    $createdAt = $record['created_at'] ?? null;

    try {
        if ($createdAt !== null) {
            $date = new DateTimeImmutable($createdAt);
        } else {
            $date = new DateTimeImmutable('now', new DateTimeZone('UTC'));
        }
    } catch (Exception $e) {
        $date = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    }

    $filename = $directory . '/' . $date->format('Y-m-d-His');

    if (file_exists($filename . '.json')) {
        $filename .= '_' . bin2hex(random_bytes(4));
    }

    $filename .= '.json';

    $encoded = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

    if ($encoded === false) {
        throw new RuntimeException('Failed to serialize enquiry record.');
    }

    if (file_put_contents($filename, $encoded, LOCK_EX) === false) {
        throw new RuntimeException("Unable to write enquiry data to {$filename}.");
    }
}

function logSecurityEvent(string $type, string $message, string $rootDir): void
{
    $logDir = "{$rootDir}/storage/logs";

    if (!is_dir($logDir) && !mkdir($logDir, 0755, true) && !is_dir($logDir)) {
        return;
    }

    $logEntry = [
        'timestamp' => (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DATE_ATOM),
        'type' => $type,
        'message' => $message,
    ];

    $line = json_encode($logEntry, JSON_UNESCAPED_SLASHES) . PHP_EOL;

    if ($line !== false) {
        file_put_contents("{$logDir}/auto_responder.log", $line, FILE_APPEND | LOCK_EX);
    }
}

