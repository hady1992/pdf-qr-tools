<?php
declare(strict_types=1);

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$base = rtrim($scheme . '://' . $host, '/');
$routes = ['/', '/editor', '/qr', '/image-qr-code', '/privacy', '/contact'];

header('Content-Type: application/xml; charset=UTF-8');
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
foreach ($routes as $route) {
    $loc = htmlspecialchars($base . $route, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    echo "  <url><loc>{$loc}</loc></url>\n";
}
echo "</urlset>\n";
