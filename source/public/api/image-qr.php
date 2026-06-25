<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TOKEN_TTL = 900;
const ALLOWED_MIMES = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

$root = dirname(__DIR__);
$legacyStorageDir = $root . '/storage';
$storageDir = chooseStorageDirectory($root, $legacyStorageDir);
$imageDir = $storageDir . '/images';

try {
    ensureStorage($storageDir, $imageDir);
    migrateLegacyStorage($legacyStorageDir, $storageDir);
    $db = database($storageDir . '/image-qr.sqlite');
    cleanupExpired($db, $imageDir);

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
        createImage($db, $imageDir);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get') {
        getImageMetadata($db);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'unlock') {
        unlockImage($db);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'image') {
        streamImage($db, $imageDir);
    } else {
        respond(['error' => 'Not found'], 404);
    }
} catch (Throwable $error) {
    error_log('Image QR error: ' . $error->getMessage());
    respond(['error' => 'The image service is temporarily unavailable.'], 500);
}

function ensureStorage(string $storageDir, string $imageDir): void {
    foreach ([$storageDir, $imageDir] as $dir) {
        if (!is_dir($dir) && !mkdir($dir, 0750, true) && !is_dir($dir)) {
            throw new RuntimeException('Cannot create storage directory.');
        }
    }
}

function chooseStorageDirectory(string $root, string $fallback): string {
    $configured = trim((string)getenv('IMAGE_QR_STORAGE_PATH'));
    if ($configured !== '') {
        return rtrim($configured, '/\\');
    }
    $persistent = dirname($root) . '/pdfqr-storage';
    if ((is_dir($persistent) || @mkdir($persistent, 0750, true)) && is_writable($persistent)) {
        return $persistent;
    }
    return $fallback;
}

function migrateLegacyStorage(string $legacy, string $target): void {
    if ($legacy === $target || !is_dir($legacy)) {
        return;
    }
    $legacyDb = $legacy . '/image-qr.sqlite';
    $targetDb = $target . '/image-qr.sqlite';
    if (is_file($legacyDb) && !is_file($targetDb)) {
        @copy($legacyDb, $targetDb);
    }
    $legacyImages = $legacy . '/images';
    $targetImages = $target . '/images';
    if (is_dir($legacyImages)) {
        foreach (glob($legacyImages . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE) ?: [] as $file) {
            $destination = $targetImages . '/' . basename($file);
            if (!is_file($destination)) {
                @copy($file, $destination);
            }
        }
    }
}

function database(string $path): PDO {
    $db = new PDO('sqlite:' . $path, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $db->exec('CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        imageUrl TEXT NOT NULL,
        title TEXT,
        description TEXT,
        passwordHash TEXT,
        expiresAt TEXT,
        createdAt TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        fileName TEXT NOT NULL
    )');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_images_expiresAt ON images(expiresAt)');
    return $db;
}

function cleanupExpired(PDO $db, string $imageDir): void {
    $now = gmdate('c');
    $query = $db->prepare('SELECT fileName FROM images WHERE expiresAt IS NOT NULL AND expiresAt <= :now');
    $query->execute(['now' => $now]);
    foreach ($query->fetchAll() as $row) {
        $path = $imageDir . '/' . basename((string)$row['fileName']);
        if (is_file($path)) {
            @unlink($path);
        }
    }
    $delete = $db->prepare('DELETE FROM images WHERE expiresAt IS NOT NULL AND expiresAt <= :now');
    $delete->execute(['now' => $now]);
}

function createImage(PDO $db, string $imageDir): never {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        respond(['error' => 'No valid image was uploaded.'], 422);
    }
    $file = $_FILES['image'];
    if ((int)$file['size'] < 1 || (int)$file['size'] > MAX_IMAGE_BYTES) {
        respond(['error' => 'Image must be smaller than 5 MB.'], 422);
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset(ALLOWED_MIMES[$mime])) {
        respond(['error' => 'Only JPG, PNG and WebP images are allowed.'], 415);
    }
    if (@getimagesize($file['tmp_name']) === false) {
        respond(['error' => 'The uploaded file is not a valid image.'], 415);
    }

    $id = bin2hex(random_bytes(16));
    $extension = ALLOWED_MIMES[$mime];
    $fileName = $id . '.' . $extension;
    $destination = $imageDir . '/' . $fileName;
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new RuntimeException('Could not save uploaded image.');
    }
    chmod($destination, 0640);

    $title = cleanText($_POST['title'] ?? '', 120);
    $description = cleanText($_POST['description'] ?? '', 1000);
    $password = (string)($_POST['password'] ?? '');
    if ($password !== '' && textLength($password) < 6) {
        @unlink($destination);
        respond(['error' => 'Password must contain at least 6 characters.'], 422);
    }
    $expiryDays = (int)($_POST['expiryDays'] ?? 7);
    if (!in_array($expiryDays, [0, 7, 30], true)) {
        $expiryDays = 7;
    }
    $createdAt = gmdate('c');
    $expiresAt = $expiryDays > 0 ? gmdate('c', time() + ($expiryDays * 86400)) : null;
    $passwordHash = $password !== '' ? password_hash($password, PASSWORD_DEFAULT) : null;

    $insert = $db->prepare('INSERT INTO images
        (id, imageUrl, title, description, passwordHash, expiresAt, createdAt, mimeType, fileName)
        VALUES (:id, :imageUrl, :title, :description, :passwordHash, :expiresAt, :createdAt, :mimeType, :fileName)');
    $insert->execute([
        'id' => $id,
        'imageUrl' => '/api/image-qr.php?action=image&id=' . $id,
        'title' => $title ?: null,
        'description' => $description ?: null,
        'passwordHash' => $passwordHash,
        'expiresAt' => $expiresAt,
        'createdAt' => $createdAt,
        'mimeType' => $mime,
        'fileName' => $fileName,
    ]);

    $baseUrl = requestOrigin();
    respond([
        'id' => $id,
        'viewUrl' => $baseUrl . '/view/image/' . $id,
        'expiresAt' => $expiresAt,
        'protected' => $passwordHash !== null,
    ], 201);
}

function getImageMetadata(PDO $db): never {
    $row = findImage($db, validId($_GET['id'] ?? ''));
    respond([
        'id' => $row['id'],
        'title' => $row['title'],
        'description' => $row['description'],
        'expiresAt' => $row['expiresAt'],
        'createdAt' => $row['createdAt'],
        'protected' => $row['passwordHash'] !== null,
        'imageUrl' => $row['passwordHash'] === null ? '/api/image-qr.php?action=image&id=' . $row['id'] : null,
        'downloadUrl' => $row['passwordHash'] === null ? '/api/image-qr.php?action=image&download=1&id=' . $row['id'] : null,
    ]);
}

function unlockImage(PDO $db): never {
    $id = validId($_POST['id'] ?? '');
    $row = findImage($db, $id);
    if ($row['passwordHash'] === null) {
        respond([
            'imageUrl' => '/api/image-qr.php?action=image&id=' . $id,
            'downloadUrl' => '/api/image-qr.php?action=image&download=1&id=' . $id,
        ]);
    }
    $password = (string)($_POST['password'] ?? '');
    if (!password_verify($password, $row['passwordHash'])) {
        respond(['error' => 'Incorrect password.'], 401);
    }
    $expires = time() + TOKEN_TTL;
    $token = signToken($id, $expires);
    $securedUrl = '/api/image-qr.php?action=image&id=' . $id . '&expires=' . $expires . '&token=' . rawurlencode($token);
    respond(['imageUrl' => $securedUrl, 'downloadUrl' => $securedUrl . '&download=1']);
}

function streamImage(PDO $db, string $imageDir): never {
    $id = validId($_GET['id'] ?? '');
    $row = findImage($db, $id);
    if ($row['passwordHash'] !== null) {
        $expires = (int)($_GET['expires'] ?? 0);
        $token = (string)($_GET['token'] ?? '');
        if ($expires < time() || !hash_equals(signToken($id, $expires), $token)) {
            respond(['error' => 'Authorization required.'], 403);
        }
    }
    $path = $imageDir . '/' . basename((string)$row['fileName']);
    if (!is_file($path)) {
        respond(['error' => 'Image not found.'], 404);
    }
    header_remove('Content-Type');
    header('Content-Type: ' . $row['mimeType']);
    header('Content-Length: ' . filesize($path));
    $disposition = isset($_GET['download']) && $_GET['download'] === '1' ? 'attachment' : 'inline';
    header('Content-Disposition: ' . $disposition . '; filename="shared-image-' . $id . '.' . ALLOWED_MIMES[$row['mimeType']] . '"');
    header('Cache-Control: private, max-age=300');
    readfile($path);
    exit;
}

function findImage(PDO $db, string $id): array {
    $query = $db->prepare('SELECT * FROM images WHERE id = :id LIMIT 1');
    $query->execute(['id' => $id]);
    $row = $query->fetch();
    if (!$row || ($row['expiresAt'] !== null && strtotime($row['expiresAt']) <= time())) {
        respond(['error' => 'Image not found or expired.'], 404);
    }
    return $row;
}

function validId(mixed $id): string {
    $id = (string)$id;
    if (!preg_match('/^[a-f0-9]{32}$/', $id)) {
        respond(['error' => 'Invalid image ID.'], 400);
    }
    return $id;
}

function signToken(string $id, int $expires): string {
    $secretPath = dirname(__DIR__) . '/storage/.token-secret';
    if (!is_file($secretPath)) {
        file_put_contents($secretPath, bin2hex(random_bytes(32)), LOCK_EX);
        chmod($secretPath, 0600);
    }
    $secret = trim((string)file_get_contents($secretPath));
    return hash_hmac('sha256', $id . '|' . $expires, $secret);
}

function cleanText(mixed $value, int $max): string {
    $text = trim(strip_tags((string)$value));
    return function_exists('mb_substr') ? mb_substr($text, 0, $max) : substr($text, 0, $max);
}

function textLength(string $value): int {
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

function requestOrigin(): string {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    $scheme = $https ? 'https' : 'http';
    $host = preg_replace('/[^a-z0-9.:\-\[\]]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
    return $scheme . '://' . $host;
}

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
