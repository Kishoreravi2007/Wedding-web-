# WeddingWeb Gemini Auto-Reply (PHP)

## Overview

- `api/index.php` routes `/api/contact` and `/api/contact/submit` calls to the PHP handler.
- `api/contact.php` validates the payload, filters spam, enforces rate limiting, invokes Gemini, sends customer/admin emails via PHPMailer, and persists every enquiry under `storage/enquiries/`.
- `services/AiResponder.php` speaks to Gemini Pro with the strict WeddingWeb prompt and extracts the reply from `response.candidates[0].content.parts[0].text`.
- `services/MailService.php` builds the email body that **always includes a friendly greeting**, the AI-assisted wedding content, and the professional closing mandated by the style guide.

## Auto-Reply Style Rules

Gemini replies must follow this structure:

1. Friendly greeting: `Hi {name}, thank you for contacting WeddingWeb!`
2. Helpful wedding-related guidance (packages, venues, pricing, photography, decorations, planners, etc.).
3. Professional closing:
   ```
   Best regards,
   Team WeddingWeb
   https://weddingweb.co.in
   ```

The MailService wraps the Gemini output inside this structure before it reaches the customer.

## Safety & Rate Limiting

- Simple spam keyword filter inspects the name + message for terms like `free money`, `earn cash`, `viagra`, and others; flagged submissions are rejected with `422`.
- Invalid emails are rejected immediately with a logged security note.
- Rate limiting: only one auto-reply per email every 5 minutes. Each submission writes `storage/rate_limits/{md5(email)}.json` to track the last send time. Violations return `429` with `retryAfterSeconds`.
- Security events (invalid email, spam, rate limit hits) are logged to `storage/logs/auto_responder.log`.

## Storage

Every enquiry is persisted as `storage/enquiries/YYYY-MM-DD-HHMMSS.json`. If two records share the same second, a short random suffix is appended so files stay unique. Each file contains the submitted payload, the generated AI reply, the tracking ID, and the UTC timestamp.

## Environment Variables (`config/env.example`)

Copy `config/env.example` to `.env` and fill in real values:

```
GEMINI_API_KEY=…
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@weddingweb.co.in
SMTP_PASS=app-password
SMTP_FROM=WeddingWeb Support <no-reply@weddingweb.co.in>
SMTP_FROM_NAME=WeddingWeb Concierge
ADMIN_EMAIL=help@weddingweb.co.in
FRONTEND_URL=https://weddingweb.co.in
```

## Setup Steps

1. **Install Composer dependencies:** run `composer install` at the project root so `PHPMailer` and the autoloader are available to the services.
2. **Configure `.env`:** use the keys above (and any additional ones you already have). The PHP handler automatically loads `.env`.
3. **Enable SMTP:** ensure the SMTP account (Gmail, SendGrid, etc.) allows third-party apps (Gmail requires an app password). Double-check SMTP host/port/security settings.
4. **Generate Gemini API key:** create a key in [Google AI Studio](https://aistudio.google.com/) and paste it into `GEMINI_API_KEY`.
5. **Start the PHP server:** from the project root run `php -S localhost:8000 -t api api/index.php` so `/api/contact` is available on port `8000`. Adjust the port as needed for your frontend.
6. **Point the frontend:** set `VITE_API_BASE_URL` (or equivalent) to the PHP server URL so the contact form posts to `http://localhost:8000/api/contact`.

## Connecting the Frontend

- The frontend should send `POST` requests to `/api/contact` with `name`, `email`, `phone`, `message`, and optionally `context` or `form`.
- Include `Content-Type: application/json`.
- Example payload:
  ```json
  {
    "name": "Sanchita & Rahul",
    "email": "couple@example.com",
    "phone": "+91 90000 11111",
    "message": "We need our wedding website plus photography for February.",
    "context": "contact form"
  }
  ```

## Example CURL Test

```bash
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sreedevi Vaishag",
    "email": "sreedevi@weddingweb.co.in",
    "phone": "+91 90000 12345",
    "message": "Looking for a premium photography + venue package for January 2026.",
    "context": "contact form"
  }'
```

Expected success response:

```json
{
  "success": true,
  "reply": "Hi Sreedevi, thank you for contacting WeddingWeb!...",
  "trackingId": "enquiry_..."
}
```

## Folder Summary

- `api/index.php` – router entry point for `/api/contact`.
- `api/contact.php` – validation, Gemini call, spam/rate-limit/safety, mail flow, storage.
- `services/AiResponder.php` – Gemini wrapper with WeddingWeb prompt and `response.candidates[0].content.parts[0].text` parsing.
- `services/MailService.php` – PHPMailer helper that sends the customer auto-reply and admin alert.
- `storage/enquiries/` – JSON files per enquiry.
- `storage/rate_limits/` and `storage/logs/` – rate limiting markers and opt-in logs (tracked with `.gitkeep` files so Git keeps the folders).

## Notes

- The handler enforces the requested auto-reply structure even if Gemini varies—the MailService wraps Gemini’s core content with the greeting and closing.
- Always keep the PHP server running in the background while testing, and stop it before running other suite commands.

