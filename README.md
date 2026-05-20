# Custom E-commerce Chatbot (Next.js + Laravel + AntD)

This is a premium, custom e-commerce chatbot built using **Next.js 14 (Frontend with Ant Design)** and **Laravel 11 (Backend API)**. 

The chatbot handles product searches, displays rich product cards for in-stock and out-of-stock items, provides interactive Yes/No feedback options in Bengali when queries aren't found in stock, and falls back to a related product carousel suggestions carousel automatically if the user clicks "No" or remains idle for 10 seconds.

---

## Folder Structure

```
ecommerce-chatbot/
├── backend/                  # Laravel Backend API
│   ├── app/
│   │   ├── Http/Controllers/ProductController.php
│   │   └── Models/Product.php
│   ├── database/
│   │   ├── database.sqlite   # SQLite Database File
│   │   ├── migrations/2026_05_20_000000_create_products_table.php
│   │   └── seeders/ProductSeeder.php
│   ├── routes/api.php
│   └── .env
└── frontend/                 # Next.js Frontend
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   └── page.tsx      # Landing Dashboard UI
    │   └── components/
    │       ├── ChatWindow.tsx
    │       ├── ProductCard.tsx
    │       └── RelatedProductsCarousel.tsx
    ├── package.json
    ├── tsconfig.json
    └── next.config.js
```

---

## Getting Started

### 1. Backend Setup (Laravel)

Navigate to the `backend/` directory in your terminal:

```bash
cd backend
```

#### Install dependencies:
```bash
composer install
```

#### Run Database Migrations and Seed Database:
We've set up Laravel to use an SQLite database (`database.sqlite`) which is already created. Run the following command to migrate the tables and seed our premium sample products (smartwatches, headphones, backpacks, designer sunglasses):

```bash
php artisan migrate --seed
```

#### Start Laravel Development Server:
By default, the backend will run on port `8000`:
```bash
php artisan serve
```
*Note: Make sure your Laravel server is active at `http://localhost:8000` as the frontend is pre-configured to communicate with it.*

---

### 2. Frontend Setup (Next.js + Ant Design)

Navigate to the `frontend/` directory in a new terminal window:

```bash
cd frontend
```

#### Install dependencies:
```bash
npm install
```

#### Start Next.js Development Server:
Start the server on port `3000`:
```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to experience the premium dark-themed chatbot workspace!

---

## Interaction Flows & Scenarios to Test

The chatbot is configured with realistic Bengali conversations. Here are the core testing flows:

### Flow A: Product Found in Stock
1. Type `Watch` in the chat input and hit send.
2. The chatbot shows a **thinking/typing** indicator.
3. The chatbot responds in Bengali that the product is found and displays a gorgeous **Product Card** showing:
   - Product Name: *Sleek Smartwatch X-100*
   - Price: *$120.00*
   - Image & Category Tag
   - Stock Tag: **স্টকে আছে** (In Stock, Green Tag)
   - Action Button: **কিনুন** (Buy Now)

### Flow B: Product Found but Out of Stock
1. Type `Sunglasses` in the chat input and hit send.
2. The chatbot returns the *Designer Sunglasses* details.
3. The card displays a red stock tag: **স্টক আউট** (Out of Stock, Red Tag) and disables the buy action.

### Flow C: Product Not in Stock / Not Found (Yes/No Flow)
1. Type `Laptop` in the chat input and hit send.
2. The chatbot replies: *"দুঃখিত, এই প্রোডাক্টটি এখন আমাদের স্টকে নেই। আপনি কি অন্য কোনো প্রোডাক্ট সম্পর্কে জানতে চান?"*
3. Two elegant AntD Buttons appear: **[হ্যাঁ] (Yes)** and **[না] (No)**.
   - **Clicking [হ্যাঁ]**: Bot replies *"ঠিক আছে, প্রোডাক্টের নাম বলুন।"* and focuses the input bar to let you search again.
   - **Clicking [না]**: Bot replies *"কোনো সমস্যা নেই!..."*, fetches related products from the Laravel API, and displays them in a gorgeous slider carousel.

### Flow D: Idle Response Auto-Fallback (10s Timeout)
1. Search for `Mobile` (which is not in the database).
2. The bot asks the YES/NO question and shows the buttons.
3. Do not click anything and wait for **10 seconds**.
4. The chatbot will automatically:
   - Hide the YES/NO buttons.
   - Print a message: *"আপনি কোনো সাড়া দেননি। আমাদের স্টকে থাকা কিছু জনপ্রিয় সম্পর্কিত প্রোডাক্ট নিচে দেখুন:"*
   - Fetch related products from the Laravel API and render them inside the **Carousel**.
