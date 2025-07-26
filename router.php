<?php
// Router for PHP built-in development server
// Usage: php -S localhost:3000 router.php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static files directly
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false; // Serve the requested resource as-is
}

// Route API requests to server.php
if (preg_match('/^\/(signup|login|profile|order|orders|debug|admin)/', $uri)) {
    include 'server.php';
    return true;
}

// For all other requests, serve static files or return 404
if (file_exists(__DIR__ . $uri)) {
    return false;
}

// Default to index.html for root
if ($uri === '/') {
    if (file_exists(__DIR__ . '/index.html')) {
        include __DIR__ . '/index.html';
        return true;
    }
}

// 404 for everything else
http_response_code(404);
echo "404 Not Found";
return true;
?>
