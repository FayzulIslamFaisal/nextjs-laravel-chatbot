<?php
// CORS Headers for seamless Next.js local fetches
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$dbPath = __DIR__ . '/database/products.json';

// Load products database
$products = [];
if (file_exists($dbPath)) {
    $products = json_decode(file_get_contents($dbPath), true);
}

// 0. All Products Route: /api/products
if ($uri === '/api/products') {
    echo json_encode(array_values($products));
    exit();
}

// 1. Search Route: /api/products/search
if ($uri === '/api/products/search') {
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';

    if (empty($q)) {
        http_response_code(400);
        echo json_encode([
            'found' => false,
            'message' => 'Please provide a product name.'
        ]);
        exit();
    }

    $foundProduct = null;
    foreach ($products as $product) {
        // Case-insensitive sub-string match
        if (stripos($product['name'], $q) !== false) {
            $foundProduct = $product;
            break;
        }
    }

    if ($foundProduct) {
        echo json_encode([
            'found' => true,
            'product' => $foundProduct
        ]);
    } else {
        echo json_encode([
            'found' => false
        ]);
    }
    exit();
}

// 2. Related Route: /api/products/related
if ($uri === '/api/products/related') {
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 4;

    // Filter by in-stock products
    $inStockProducts = array_filter($products, function($p) {
        return $p['in_stock'] === true;
    });

    // Optionally filter by category if specified
    if ($category) {
        $filtered = array_filter($inStockProducts, function($p) use ($category) {
            return strcasecmp($p['category'], $category) === 0;
        });
        if (!empty($filtered)) {
            $inStockProducts = $filtered;
        }
    }

    // Shuffle and slice
    shuffle($inStockProducts);
    $result = array_slice($inStockProducts, 0, $limit);

    echo json_encode(array_values($result));
    exit();
}

// 404 Route Fallback
http_response_code(404);
echo json_encode([
    'error' => 'Endpoint not found. Valid endpoints are /api/products/search and /api/products/related'
]);
