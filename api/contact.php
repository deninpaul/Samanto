<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['message' => $message], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function cleanSingleLine($value): string
{
    if (!is_string($value)) {
        return '';
    }
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    return trim(preg_replace('/\s+/u', ' ', $value) ?? '');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'Please submit the contact form to send a message.');
}

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    respond(415, 'Unsupported request format. Please use the contact form.');
}

$rawBody = file_get_contents('php://input', false, null, 0, 12001);
if ($rawBody === false || strlen($rawBody) > 12000) {
    respond(413, 'Your message is too large. Please shorten it and try again.');
}

$input = json_decode($rawBody, true);
if (!is_array($input)) {
    respond(400, 'The form data could not be read. Please try again.');
}

// Silently discard submissions that fill the hidden anti-bot field.
if (cleanSingleLine($input['website'] ?? '') !== '') {
    respond(200, 'Thanks for reaching out. We will be in touch soon.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$requestHost = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '') ?? '');
if ($origin !== '') {
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    if ($originHost === '' || $requestHost === '' || !hash_equals($requestHost, $originHost)) {
        respond(403, 'This form submission could not be verified. Please reload the page and try again.');
    }
}

$name = cleanSingleLine($input['name'] ?? '');
$phone = cleanSingleLine($input['phone'] ?? '');
$email = cleanSingleLine($input['email'] ?? '');
$subject = cleanSingleLine($input['subject'] ?? '');
$message = $input['message'] ?? '';

if (strlen($name) < 2 || strlen($name) > 100) {
    respond(422, 'Please enter your name (up to 100 characters).');
}
if (strlen($phone) > 30 || ($phone !== '' && !preg_match('/^[0-9+().\s-]+$/', $phone))) {
    respond(422, 'Please enter a valid phone number.');
}
if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, 'Please enter a valid email address.');
}
if ($subject === '' || strlen($subject) > 120) {
    respond(422, 'Please enter a subject (up to 120 characters).');
}
if (!is_string($message)) {
    respond(422, 'Please enter a message.');
}
$message = str_replace(["\r\n", "\r"], "\n", $message);
$message = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $message) ?? '';
$message = trim($message);
if ($message === '' || strlen($message) > 5000) {
    respond(422, 'Please enter a message of up to 5,000 characters.');
}

// Limit each source IP to five accepted submissions per hour. Store only a hash of the IP.
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR
    . 'samanto-contact-' . hash('sha256', __DIR__ . '|' . $clientIp) . '.json';
$rateHandle = @fopen($rateFile, 'c+');
if ($rateHandle === false || !flock($rateHandle, LOCK_EX)) {
    if (is_resource($rateHandle)) {
        fclose($rateHandle);
    }
    respond(503, 'The form is temporarily unavailable. Please try again later.');
}

$now = time();
$stored = stream_get_contents($rateHandle);
$timestamps = json_decode($stored ?: '[]', true);
$timestamps = is_array($timestamps) ? $timestamps : [];
$timestamps = array_values(array_filter($timestamps, static function ($timestamp) use ($now): bool {
    return is_int($timestamp) && $timestamp > $now - 3600;
}));
if (count($timestamps) >= 5) {
    flock($rateHandle, LOCK_UN);
    fclose($rateHandle);
    respond(429, 'Too many messages were sent from this connection. Please try again later.');
}
$timestamps[] = $now;
rewind($rateHandle);
ftruncate($rateHandle, 0);
fwrite($rateHandle, json_encode($timestamps));
fflush($rateHandle);
@chmod($rateFile, 0600);
flock($rateHandle, LOCK_UN);
fclose($rateHandle);

$recipient = 'deninpaulv@gmail.com';
$fromAddress = 'info@samanto.in';
$subjectText = 'Samanto Website: ' . $subject;
$encodedSubject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
$emailBody = "Name: {$name}\n"
    . 'Phone: ' . ($phone !== '' ? $phone : 'Not provided') . "\n"
    . "Email: {$email}\n\n"
    . $message . "\n";
$headers = [
    'From: Samanto Website <' . $fromAddress . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

if (!@mail($recipient, $encodedSubject, $emailBody, implode("\r\n", $headers))) {
    error_log('Samanto contact form: mail delivery failed.');
    respond(503, 'Your message could not be sent right now. Please contact us by email instead.');
}

respond(200, 'Thanks for reaching out. We will be in touch soon.');
