<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;

$autoload = __DIR__ . '/../vendor/autoload.php';

if (!file_exists($autoload)) {
    throw new RuntimeException('Composer autoload not found. Run `composer install` to fetch PHPMailer.');
}

require_once $autoload;

/**
 * PHPMailer-backed helper for WeddingWeb auto replies and admin alerts.
 */
class MailService
{
    private string $host;
    private int $port;
    private string $user;
    private string $pass;
    private string $fromEmail;
    private string $fromName;
    private string $adminEmail;

    public function __construct(
        string $host,
        int $port,
        string $user,
        string $pass,
        string $fromEmail,
        string $fromName,
        string $adminEmail
    ) {
        foreach (['host' => $host, 'user' => $user, 'pass' => $pass, 'fromEmail' => $fromEmail, 'adminEmail' => $adminEmail] as $key => $value) {
            if (trim($value) === '') {
                throw new InvalidArgumentException("{$key} is required for MailService.");
            }
        }

        if ($port <= 0) {
            throw new InvalidArgumentException('SMTP port must be a positive integer.');
        }

        $this->host = trim($host);
        $this->port = $port;
        $this->user = trim($user);
        $this->pass = trim($pass);
        $this->fromEmail = trim($fromEmail);
        $this->fromName = trim($fromName) ?: 'WeddingWeb Support';
        $this->adminEmail = trim($adminEmail);
    }

    /**
     * Send the AI-generated reply to the customer.
     *
     * @throws PHPMailerException
     */
    public function sendAutoReplyToCustomer(string $email, string $name, string $aiReply): void
    {
        $subject = 'Thanks for contacting WeddingWeb';
        $body = <<<BODY
Hi {$name}, thank you for contacting WeddingWeb!

{$aiReply}

Best regards,
Team WeddingWeb
https://weddingweb.co.in
BODY;

        $this->sendMail($subject, $body, $email, $name);
    }

    /**
     * Notify the admin with the enquiry details and AI response.
     *
     * @param array<string, string> $data
     * @throws PHPMailerException
     */
    public function sendAdminNotification(array $data): void
    {
        $trackingId = $data['trackingId'] ?? 'unknown';
        $name = $data['name'] ?? 'Unnamed guest';
        $email = $data['email'] ?? 'no-email';
        $phone = $data['phone'] ?? 'n/a';
        $context = $data['context'] ?? 'Contact form';
        $message = $data['message'] ?? '';
        $reply = $data['reply'] ?? '';
        $receivedAt = $data['created_at'] ?? gmdate(DATE_ATOM);

        $subject = "New enquiry from {$name}";
        $body = <<<BODY
Tracking ID: {$trackingId}
Name: {$name}
Email: {$email}
Phone: {$phone}
Source: {$context}
Received At: {$receivedAt}

Message:
{$message}

AI Reply:
{$reply}
BODY;

        $this->sendMail($subject, $body, $this->adminEmail);
    }

    /**
     * Configure PHPMailer and dispatch the message.
     *
     * @throws PHPMailerException
     */
    private function sendMail(string $subject, string $body, string $recipientEmail, string $recipientName = ''): void
    {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $this->host;
        $mail->SMTPAuth = true;
        $mail->Username = $this->user;
        $mail->Password = $this->pass;
        $mail->SMTPSecure = $this->determineEncryption();
        $mail->Port = $this->port;
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($this->fromEmail, $this->fromName);
        $mail->addAddress($recipientEmail, $recipientName);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = strip_tags($body);
        $mail->isHTML(false);
        $mail->send();
    }

    private function determineEncryption(): string
    {
        if ($this->port === 465) {
            return PHPMailer::ENCRYPTION_SMTPS;
        }

        return PHPMailer::ENCRYPTION_STARTTLS;
    }
}

