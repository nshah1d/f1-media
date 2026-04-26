# Configuration Reference

This document covers all environment variables, the database schema, the YouTube API setup, the channel registry, and the steps required to configure a forked deployment.

---

## Environment Variables

All runtime configuration is loaded from `.env` by `api/config.php`. Copy `.env.example` to `.env` before the first deployment. The file must never be committed or made web-accessible.

```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
TOKEN_SALT=your_random_salt_minimum_32_chars
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
```

| Variable | Required | Description |
|---|---|---|
| `DB_HOST` | Yes | MySQL hostname. Use `localhost` for same-server databases. |
| `DB_USER` | Yes | MySQL username with SELECT, INSERT, and UPDATE privileges on the target database. |
| `DB_PASS` | Yes | MySQL password for the above user. |
| `DB_NAME` | Yes | Name of the target MySQL database. |
| `TOKEN_SALT` | Yes | A random string of at least 32 characters. Signs all HMAC tokens and IP hashes. See note below. |
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key. Required for the primary channel feed. Absent or invalid keys fall back to the Atom XML endpoint automatically. |

`config.php` validates all required variables at load time and throws a `RuntimeException` if any are missing or empty. A misconfigured `.env` surfaces as a PHP 500 error on the first API request.

### TOKEN_SALT

`TOKEN_SALT` is the secret shared across three distinct operations:

1. Hashing IP addresses before storage: `hash_hmac('sha256', ip, TOKEN_SALT)`
2. Generating HMAC tokens on authentication: `hash_hmac('sha256', fingerprint + date, TOKEN_SALT)`
3. Validating tokens on every authenticated request: same derivation in `auth_check.php`

Changing `TOKEN_SALT` on a live deployment has three consequences: all active sessions become invalid immediately, all IP lockout records become unresolvable (the stored hashes no longer match incoming IPs), and the passcode → token mapping changes. Plan accordingly if rotating this value.

Generate a suitable value with:

```bash
# Linux / macOS
openssl rand -hex 32

# Windows (PowerShell)
$b = New-Object byte[] 32; [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($b); [System.BitConverter]::ToString($b).Replace('-','').ToLower()
```

---

## Database Setup

Run `schema.sql` against the target database before the first deployment:

```bash
mysql -u <user> -p <database> < schema.sql
```

The script is idempotent (`CREATE TABLE IF NOT EXISTS`) and safe to run on an existing database.

### Schema

```sql
CREATE TABLE IF NOT EXISTS users_meta (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address      VARCHAR(64) NOT NULL,
  failed_attempts TINYINT UNSIGNED DEFAULT 0,
  locked_until    DATETIME DEFAULT NULL,
  last_attempt    DATETIME DEFAULT NULL,
  UNIQUE INDEX idx_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

The `UNIQUE INDEX` on `ip_address` is critical. The `ON DUPLICATE KEY UPDATE` clause in `auth.php` relies on it for atomic upsert behaviour. A regular (non-unique) index silently disables the upsert, making the lockout counter non-functional.

### Required MySQL Privileges

The database user needs `SELECT`, `INSERT`, and `UPDATE` on `users_meta`. No `DELETE` or `DROP` privileges are required.

---

## YouTube Data API v3

### Obtaining a Key

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project, or select an existing one.
3. Navigate to APIs and Services, enable **YouTube Data API v3**.
4. Create an API key under Credentials.
5. Restrict the key to the YouTube Data API v3 and, optionally, to the server's IP address.

Set the key as `YOUTUBE_API_KEY` in `.env`.

### Quota Usage

The primary endpoint (`youtube_videos.php`) uses the `playlistItems` endpoint, which costs **1 quota unit** per channel fetch. The default daily quota is 10,000 units.

Responses are cached server-side for 24 hours. A given channel is fetched from the API at most once per day, regardless of how many users request it. The effective daily capacity is 10,000 unique channel fetches before quota exhaustion.

When the API key is absent, invalid, or quota-exhausted, the application falls back to the Atom XML endpoint (`youtube_feed.php`) automatically. The Atom feed requires no key, returns the 15 most recent uploads per channel, and is cached for 1 hour.

---

## Channel Registry

Both PHP feed endpoints (`youtube_videos.php` and `youtube_feed.php`) maintain an identical `$CHANNELS` associative array mapping channel slugs to YouTube channel IDs:

```php
$CHANNELS = [
    'formula1' => 'UCd8iY-kEHtaB8qt8MH--zGw',
    'driver61' => 'UCtbLA0YM6EpwUQhFUyPQU9Q',
    // ...
];
```

The React configuration in `src/config/categories.js` references channels by the same slug keys:

```javascript
export const F1_CATEGORIES = [
  { id: 'for-you', label: 'Everything', channels: ['formula1', 'driver61', ...] },
  ...
];
```

All three files must be kept in sync. Adding a channel requires: updating `$CHANNELS` in `youtube_videos.php`, updating `$CHANNELS` in `youtube_feed.php`, and adding the slug to the appropriate category array in `categories.js`. Omitting the entry from either PHP file causes the fallback chain to return HTTP 400 for that channel.

The current registry contains **113 channels** across the following content areas: Formula 1 and motorsport, automotive, technology, food, science, gaming, comedy, travel, news, and entertainment.

---

## Fork Configuration

A forked deployment needs the following changes to be fully functional.

### 1. Replace the Channel Registry

The default channel list reflects a specific curation. Replace the contents of `$CHANNELS` in both `youtube_videos.php` and `youtube_feed.php`, and update `F1_CATEGORIES` and `HUB_CATEGORIES` in `src/config/categories.js` to match.

Category structure:

```javascript
export const F1_CATEGORIES = [
  {
    id: 'unique-id',
    label: 'Display Label',
    channels: ['slug1', 'slug2'],  // must exist in $CHANNELS
  },
];
```

### 2. Configure the Environment

Set all six values in `.env` as described above. The database table must be created before the first login attempt.

### 3. Build and Deploy

```bash
npm install
npm run build
```

Upload `dist/` contents to the server web root. Upload `api/`, `includes/`, `.htaccess`, and `.env` to the same root. Ensure the PHP process has read access to `.env` and write access to the system temp directory (used for response caches).

### 4. Verify Apache Configuration

The `.htaccess` file requires `mod_rewrite` and `mod_headers` to be enabled on the Apache server. On Debian/Ubuntu:

```bash
sudo a2enmod rewrite headers
sudo systemctl restart apache2
```

### 5. PWA Metadata

Update `public/manifest.json` and `index.html` with appropriate names, descriptions, and icon paths for the deployment.

---

<div align="center">
<br>

**_Architected by Nauman Shahid_**

<br>

[![Portfolio](https://img.shields.io/badge/Portfolio-nauman.cc-000000?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.nauman.cc)
[![GitHub](https://img.shields.io/badge/GitHub-nshah1d-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nshah1d)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nshah1d/)

</div>
<br>

Licensed under the [MIT Licence](LICENSE).
