<?php
require_once __DIR__ . '/../includes/auth_check.php';
validateToken();
require __DIR__ . '/youtube_feed.php';
