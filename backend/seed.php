<?php
$dbPath = __DIR__ . '/database/database.sqlite';

try {
    $db = new PDO("sqlite:$dbPath");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create products table
    $db->exec("CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT,
        in_stock INTEGER NOT NULL DEFAULT 1,
        category TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Clear existing products
    $db->exec("DELETE FROM products");

    // Insert sample products
    $products = [
        [
            'name' => 'Sleek Smartwatch X-100',
            'price' => 120.00,
            'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
            'in_stock' => 1,
            'category' => 'Electronics',
            'description' => 'A elegant smartwatch with 24/7 heart rate monitoring, active fitness tracking, sleep insights, and up to 7 days of battery life.',
        ],
        [
            'name' => 'Wireless Noise-Cancelling Headphones',
            'price' => 199.99,
            'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
            'in_stock' => 1,
            'category' => 'Electronics',
            'description' => 'Experience premium sound with industry-leading Active Noise Cancellation, comfort earcups, and crystal-clear calls.',
        ],
        [
            'name' => 'Mechanical Gaming Keyboard',
            'price' => 75.00,
            'image_url' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
            'in_stock' => 1,
            'category' => 'Electronics',
            'description' => 'Tactile, responsive blue-switch mechanical keyboard with customizable RGB backlit keys and premium aluminum chassis.',
        ],
        [
            'name' => 'Minimalist Leather Backpack',
            'price' => 85.00,
            'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
            'in_stock' => 1,
            'category' => 'Fashion',
            'description' => 'Handcrafted water-resistant leather backpack featuring a 15-inch laptop sleeve and sleek pockets for absolute organization.',
        ],
        [
            'name' => 'Designer Sunglasses',
            'price' => 150.00,
            'image_url' => 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60',
            'in_stock' => 0,
            'category' => 'Fashion',
            'description' => 'Ultra-stylish UV protection designer sunglasses featuring a lightweight, durable titanium frame and polarized lenses.',
        ],
        [
            'name' => 'Ergonomic Office Chair',
            'price' => 250.00,
            'image_url' => 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&auto=format&fit=crop&q=60',
            'in_stock' => 0,
            'category' => 'Furniture',
            'description' => 'High-back ergonomic mesh office chair offering premium lumbar support, adjustable 3D armrests, and dynamic reclining.',
        ],
        [
            'name' => 'Minimalist Table Lamp',
            'price' => 45.00,
            'image_url' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
            'in_stock' => 1,
            'category' => 'Furniture',
            'description' => 'Elegant wood-base table lamp with textured fabric drum shade, ideal for modern bedroom nightstands or study desks.',
        ],
        [
            'name' => 'Premium Ceramic Coffee Mug',
            'price' => 18.50,
            'image_url' => 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&auto=format&fit=crop&q=60',
            'in_stock' => 1,
            'category' => 'Kitchen',
            'description' => 'Durable stoneware double-insulated ceramic mug, keeping your coffee hot or cold, featuring a stunning matte-speckled glaze finish.',
        ],
    ];

    $stmt = $db->prepare("INSERT INTO products (name, price, image_url, in_stock, category, description) VALUES (:name, :price, :image_url, :in_stock, :category, :description)");

    foreach ($products as $p) {
        $stmt->execute([
            ':name' => $p['name'],
            ':price' => $p['price'],
            ':image_url' => $p['image_url'],
            ':in_stock' => $p['in_stock'],
            ':category' => $p['category'],
            ':description' => $p['description']
        ]);
    }

    echo "Database successfully initialized and seeded with premium products!\n";

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
