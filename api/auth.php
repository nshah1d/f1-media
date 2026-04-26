<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

require_once __DIR__ . '/../includes/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$passcode = $input['passcode'] ?? '';
$timezone = $input['timezone'] ?? 'UTC';
$fingerprint = $input['fingerprint'] ?? '';

$ip = $_SERVER['REMOTE_ADDR'];

$hashedIp = hash_hmac('sha256', $ip, TOKEN_SALT);

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT failed_attempts, locked_until FROM users_meta WHERE ip_address = ?");
    $stmt->execute([$hashedIp]);
    $meta = $stmt->fetch();

    if ($meta && $meta['locked_until'] && strtotime($meta['locked_until']) > time()) {
        http_response_code(423);
        exit(json_encode(['error' => 'locked', 'until' => $meta['locked_until']]));
    }

    try {
        $clientTz = new DateTimeZone($timezone);
    } catch (Exception $e) {
        $clientTz = new DateTimeZone('UTC');
    }

    $now = new DateTime('now', $clientTz);
    $nowMinus1h = clone $now;
    $nowMinus1h->modify('-1 hour');

    $validCodes = [
        $now->format('dmY'),
        $nowMinus1h->format('dmY')
    ];

    if (in_array($passcode, $validCodes)) {
        $stmt = $db->prepare("INSERT INTO users_meta (ip_address, failed_attempts, locked_until, last_attempt)
                              VALUES (?, 0, NULL, NOW())
                              ON DUPLICATE KEY UPDATE failed_attempts = 0, locked_until = NULL, last_attempt = NOW()");
        $stmt->execute([$hashedIp]);

        $tokenDate = new DateTime('now', new DateTimeZone('UTC'));
        $serverDate = $tokenDate->format('dmY');
        $token = hash_hmac('sha256', $fingerprint . $serverDate, TOKEN_SALT);

        exit(json_encode(['status' => 'ok', 'token' => $token]));

    } else {
        $stmt = $db->prepare("INSERT INTO users_meta (ip_address, failed_attempts, last_attempt)
                              VALUES (?, 1, NOW())
                              ON DUPLICATE KEY UPDATE failed_attempts = failed_attempts + 1, last_attempt = NOW()");
        $stmt->execute([$hashedIp]);

        $stmt = $db->prepare("SELECT failed_attempts FROM users_meta WHERE ip_address = ?");
        $stmt->execute([$hashedIp]);
        $attempts = $stmt->fetchColumn();

        if ($attempts >= 3) {
            $lockedUntil = (new DateTime('+24 hours', new DateTimeZone('UTC')))->format('Y-m-d H:i:s');
            $stmt = $db->prepare("UPDATE users_meta SET locked_until = ? WHERE ip_address = ?");
            $stmt->execute([$lockedUntil, $hashedIp]);
            http_response_code(423);
            exit(json_encode(['error' => 'locked', 'until' => $lockedUntil]));
        }

        http_response_code(401);
        exit(json_encode(['error' => 'invalid']));
    }
} catch (PDOException $e) {
    http_response_code(500);
    error_log('Entertainment-Bunker auth DB error: ' . $e->getMessage());
    exit(json_encode(['error' => 'database_error']));
}
