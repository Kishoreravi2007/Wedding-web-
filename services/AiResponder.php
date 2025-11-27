<?php
declare(strict_types=1);

/**
 * Lightweight wrapper around Google Gemini Content API for WeddingWeb auto-replies.
 */
class AiResponder
{
    private const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    private string $apiKey;

    public function __construct(string $apiKey)
    {
        $apiKey = trim($apiKey);

        if ($apiKey === '') {
            throw new InvalidArgumentException('Gemini API key is required for AI responses.');
        }

        $this->apiKey = $apiKey;
    }

    /**
     * Generate a warm, WeddingWeb-branded reply for a customer enquiry.
     */
    public function generateReply(string $customerName, string $customerMessage, string $context = ''): string
    {
        $customerName = trim($customerName);
        $customerMessage = trim($customerMessage);
        $context = trim($context);

        if ($customerName === '' || $customerMessage === '') {
            throw new InvalidArgumentException('Both customer name and message are required to craft an AI reply.');
        }

        $systemInstructions = <<<TEXT
You are the auto-reply assistant for WeddingWeb. Always begin with "Hi {$customerName}, thank you for contacting WeddingWeb!" followed by helpful wedding-related guidance mentioning packages, venues, pricing, photography, decorations, or planners that answers the customer's request. Close the reply with:

Best regards,
Team WeddingWeb
https://weddingweb.co.in

Keep the tone warm, friendly, and informative, and stay within WeddingWeb services.
TEXT;

        $contextualReminder = $context !== '' ? "This enquiry came through the {$context} form.\n\n" : '';
        $userMessage = $contextualReminder . "Customer {$customerName} wrote:\n\"{$customerMessage}\"";

        $payload = [
            'prompt' => [
                'messages' => [
                    [
                        'author' => 'system',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => $systemInstructions,
                            ],
                        ],
                    ],
                    [
                        'author' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => $userMessage,
                            ],
                        ],
                    ],
                ],
            ],
            'temperature' => 0.55,
            'topP' => 0.9,
            'maxOutputTokens' => 330,
        ];

        $response = $this->callGemini($payload);

        return $this->extractText($response);
    }

    /**
     * Perform the HTTP request to Google Gemini.
     *
     * @return array<string, mixed>
     */
    private function callGemini(array $payload): array
    {
        $endpoint = self::ENDPOINT . '?key=' . rawurlencode($this->apiKey);

        $ch = curl_init($endpoint);

        if ($ch === false) {
            throw new RuntimeException('Failed to initialize cURL for Gemini request.');
        }

        $jsonPayload = json_encode($payload);

        if ($jsonPayload === false) {
            throw new RuntimeException('Failed to encode Gemini payload: ' . json_last_error_msg());
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);

        $rawResponse = curl_exec($ch);

        if ($rawResponse === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new RuntimeException('Gemini request failed: ' . $error);
        }

        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $decoded = json_decode($rawResponse, true);

        if ($status >= 400) {
            $message = $decoded['error']['message'] ?? 'Gemini returned an error';
            throw new RuntimeException("Gemini HTTP {$status}: {$message}");
        }

        if (!is_array($decoded)) {
            throw new RuntimeException('Invalid JSON response from Gemini.');
        }

        return $decoded;
    }

    /**
     * Normalize the Gemini response into a single text string.
     */
    private function extractText(array $response): string
    {
        $candidateText = $this->getCandidatePartsText($response);
        if ($candidateText !== null) {
            $candidateText = trim(preg_replace('/\s+/', ' ', $candidateText));
            if ($candidateText !== '') {
                return $candidateText;
            }
        }

        $chunks = [];

        if (isset($response['candidates']) && is_array($response['candidates'])) {
            foreach ($response['candidates'] as $candidate) {
                $this->gatherText($candidate['content'] ?? [], $chunks);
                if (!empty($chunks)) {
                    break;
                }
            }
        }

        if (empty($chunks) && isset($response['output']) && is_array($response['output'])) {
            foreach ($response['output'] as $outBlock) {
                $this->gatherText($outBlock['content'] ?? [], $chunks);
            }
        }

        if (empty($chunks)) {
            throw new RuntimeException('Gemini returned no readable text.');
        }

        $reply = implode("\n", $chunks);
        $reply = trim(preg_replace('/\s+/', ' ', $reply));

        if ($reply === '') {
            throw new RuntimeException('Gemini reply was empty after cleanup.');
        }

        return $reply;
    }

    private function getCandidatePartsText(array $response): ?string
    {
        if (
            isset($response['candidates'][0]['content']['parts'][0]['text'])
            && is_string($response['candidates'][0]['content']['parts'][0]['text'])
        ) {
            return $response['candidates'][0]['content']['parts'][0]['text'];
        }

        return null;
    }

    /**
     * Recursively collect text fragments from the Gemini structure.
     *
     * @param array<int|string, mixed> $content
     * @param array<int, string> $collector
     */
    private function gatherText(array $content, array &$collector): void
    {
        foreach ($content as $item) {
            if (is_string($item)) {
                $collector[] = trim($item);
                continue;
            }

            if (is_array($item)) {
                if (isset($item['text']) && is_string($item['text'])) {
                    $collector[] = trim($item['text']);
                }

                if (isset($item['content']) && is_array($item['content'])) {
                    $this->gatherText($item['content'], $collector);
                }
            }
        }
    }
}

