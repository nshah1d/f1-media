# Security Reference

This document describes the security model for F1 Media: what it protects, how each mechanism works, and what it does not cover.

---

## Threat Model

This application is a private, single-user deployment. It is not a multi-tenant service, and it does not handle financial data, medical records, or regulated personal information. The primary concern is restricting access to the authenticated content layer from casual and automated discovery.

The design goal is defence-in-depth across a small attack surface. The public layer is intentionally indistinguishable from a standard F1 content feed. The authenticated layer is unreachable without knowing the current passcode, and the passcode itself is never transmitted or stored: it is re-derived from the date on every request.

---

## Passcode: Date-Based TOTP

The passcode is the current date formatted as `ddmmyyyy` in the user's local timezone (e.g., `26042026`). It is derived from public information and requires no storage or synchronisation. The user carries the passcode in their head.

`auth.php` accepts two valid codes on every request:

```php
$validCodes = [
    $now->format('dmY'),
    $nowMinus1h->format('dmY'),
];
```

The one-hour grace window handles the midnight transition cleanly. A user who enters the old code at 00:03 is not locked out.

The passcode never travels across the network in a reusable form. It is submitted once, validated server-side, and immediately discarded. No session state persists the passcode itself.

---

## Device Fingerprint

Before submitting the passcode, the browser computes a SHA-256 hash of the device profile:

```javascript
const dims = [screen.width, screen.height].sort((a, b) => a - b);
const rawFp = navigator.userAgent + dims[0] + 'x' + dims[1] + screen.colorDepth;
const hash = Array.from(
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawFp)))
).map(b => b.toString(16).padStart(2, '0')).join('');
```

This fingerprint is submitted to `auth.php` alongside the passcode and becomes an input to the HMAC token. A token issued to device A will not validate on device B, because the fingerprint embedded in the HMAC derivation will differ.

The fingerprint is not a strong identifier: `userAgent`, screen resolution, and colour depth are all observable. Its purpose is to raise the bar on token replay. Capturing a valid token does not yield access unless the attacker can also replicate the originating device profile.

---

## HMAC Token

On successful authentication, `auth.php` issues a token:

```php
$tokenDate = new DateTime('now', new DateTimeZone('UTC'));
$serverDate = $tokenDate->format('dmY');
$token = hash_hmac('sha256', $fingerprint . $serverDate, TOKEN_SALT);
```

The token is a 64-character hexadecimal string. It is deterministic: the same fingerprint, date, and salt always produce the same token. There is no stored token table and no revocation list. A token expires naturally when the UTC date advances past the validation window.

`validateToken()` in `includes/auth_check.php` checks the token against today and yesterday in UTC:

```php
if (!hash_equals($expectedToday, $token) && !hash_equals($expectedYesterday, $token)) {
    http_response_code(401);
    exit(json_encode(['error' => 'invalid']));
}
```

`hash_equals` performs constant-time comparison throughout. This prevents timing oracle attacks where an attacker could infer partial token matches from response latency differences.

---

## Token Storage: Service Worker Only

The token and fingerprint are held in plain module-scope variables inside the Service Worker:

```javascript
let _token = null;
let _fp    = null;
```

They are never written to `localStorage`, `IndexedDB`, cookies, or any other persistent browser storage. Closing the tab clears `sessionStorage` (where the values are also held for SW recovery after a worker restart), and the Service Worker variables are lost when the browser kills the idle worker.

This is a deliberate constraint. Persistent storage would survive browser restarts and could be extracted via developer tools or XSS. The session model accepts a short-lived credential window as the tradeoff for a smaller attack surface.

---

## IP-Based Lockout

Repeated failed passcode attempts trigger a 24-hour lockout at the IP level.

IP addresses are hashed with HMAC-SHA256 before storage:

```php
$hashedIp = hash_hmac('sha256', $ip, TOKEN_SALT);
```

Raw IPs never persist. The `users_meta` table stores only hashed values. A database breach does not expose client IPs directly.

The lockout threshold is three attempts:

```php
if ($attempts >= 3) {
    $lockedUntil = (new DateTime('+24 hours', new DateTimeZone('UTC')))->format('Y-m-d H:i:s');
    $stmt = $db->prepare("UPDATE users_meta SET locked_until = ? WHERE ip_address = ?");
    $stmt->execute([$lockedUntil, $hashedIp]);
    http_response_code(423);
}
```

The React application renders a lockout indicator (a red dot in the header) when HTTP 423 is received. The numpad is hidden. No further submission attempts are possible until the user clears the browser session and revisits after the lockout window expires.

**Known limitation (PR-012):** `auth.php` reads the client IP from `$_SERVER['REMOTE_ADDR']` directly. If the server is placed behind a reverse proxy or CDN, all requests will present the proxy IP, and three failed attempts from any source will lock out all subsequent users. This is not an issue for a direct server deployment but must be addressed before introducing any proxy layer.

---

## Auto-Logout on Visibility Change

`EntertainmentPage` registers a `visibilitychange` listener on mount:

```javascript
useEffect(() => {
  const onHide = () => {
    if (document.visibilityState === 'hidden') doLogout();
  };
  document.addEventListener('visibilitychange', onHide);
  return () => document.removeEventListener('visibilitychange', onHide);
}, [doLogout]);
```

`doLogout` posts `CLEAR_AUTH` to the Service Worker, clears `sessionStorage`, and transitions the view back to `'f1'`. The authenticated layer is fully terminated the moment the tab is backgrounded, the device is locked, or another application is foregrounded.

This is intentional. The authenticated layer is not designed for long-running background sessions.

---

## Apache Security Headers

`.htaccess` sets three response headers on all requests:

```apache
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer"
```

- `X-Frame-Options: SAMEORIGIN` prevents the application from being embedded in a third-party iframe, mitigating clickjacking.
- `X-Content-Type-Options: nosniff` instructs browsers not to MIME-sniff responses, preventing content-type confusion attacks.
- `Referrer-Policy: no-referrer` suppresses the `Referer` header on all outbound requests, preventing the deployment URL from leaking to third-party origins.

---

## Robots and Indexing

`robots.txt` disallows all crawlers:

```
User-agent: *
Disallow: /
```

`index.html` carries matching meta tags:

```html
<meta name="robots" content="noindex, nofollow" />
```

Both are in place. A correctly configured crawler will not index the application or follow any links from it.

---

## Known Limitations

| ID | Severity | Description |
|---|---|---|
| PR-003 | Security (deferred) | No `Content-Security-Policy` header. The application loads scripts from `youtube.com`, renders iframes from `youtube.com`, and loads images from `ytimg.com`. Without a CSP, there is no browser-enforced whitelist of permitted sources. Accepted risk for the current private deployment. |
| PR-005 | Minor (deferred) | Service Worker restart clears `_token` and `_fp`. A mid-session SW restart followed by an API call before `EntertainmentPage` remounts will produce HTTP 401 errors. Accepted for single-user use where this scenario is highly unlikely in practice. |
| PR-012 | Minor (conditional) | `REMOTE_ADDR` is read directly in `auth.php`. Breaks IP lockout behind a reverse proxy or CDN. Not relevant for the current direct server deployment. Must be addressed before introducing any proxy layer. |

---

## Reporting

This is a personal project with no public user base. Security findings can be reported directly via [GitHub Issues](https://github.com/nshah1d/f1-media/issues).

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
