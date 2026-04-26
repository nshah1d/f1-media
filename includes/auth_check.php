<?php
require_once __DIR__ . '/../api/config.php';

function validateToken() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    $fingerprint = $_SERVER['HTTP_X_FINGERPRINT'] ?? '';

    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    }

    if (empty($token) || empty($fingerprint)) {
        http_response_code(401);
        header('Content-Type: application/json');
        exit(json_encode(['error' => 'invalid']));
    }

    $tz = new DateTimeZone('UTC');
    $now = new DateTime('now', $tz);

    $todayDate     = $now->format('dmY');
    $yesterdayDate = (clone $now)->modify('-1 day')->format('dmY');

    $expectedToday     = hash_hmac('sha256', $fingerprint . $todayDate,     TOKEN_SALT);
    $expectedYesterday = hash_hmac('sha256', $fingerprint . $yesterdayDate, TOKEN_SALT);

    if (!hash_equals($expectedToday, $token) && !hash_equals($expectedYesterday, $token)) {
        http_response_code(401);
        header('Content-Type: application/json');
        exit(json_encode(['error' => 'invalid']));
    }
}
