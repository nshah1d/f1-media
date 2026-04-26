CREATE TABLE IF NOT EXISTS users_meta (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address      VARCHAR(64) NOT NULL,
  failed_attempts TINYINT UNSIGNED DEFAULT 0,
  locked_until    DATETIME DEFAULT NULL,
  last_attempt    DATETIME DEFAULT NULL,
  UNIQUE INDEX idx_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
