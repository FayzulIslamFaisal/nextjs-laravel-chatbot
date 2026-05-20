<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * Get all products.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }

    /**
     * Search for a product by name.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $query = $request->query('q');

        if (empty($query)) {
            return response()->json([
                'found' => false,
                'message' => 'Please provide a product name.'
            ], 400);
        }

        // Case-insensitive search on the product name
        $product = Product::where('name', 'LIKE', '%' . $query . '%')->first();

        if ($product) {
            return response()->json([
                'found' => true,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'image_url' => $product->image_url,
                    'in_stock' => $product->in_stock,
                    'category' => $product->category,
                    'description' => $product->description,
                ]
            ]);
        }

        return response()->json([
            'found' => false
        ]);
    }

    /**
     * Get related products based on category or fallback to in-stock items.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function related(Request $request)
    {
        $category = $request->query('category');
        $limit = $request->query('limit', 4);

        $query = Product::where('in_stock', true);

        if ($category) {
            $query->where('category', $category);
        }

        $products = $query->inRandomOrder()->take($limit)->get();

        // Fallback in case no in-stock products are found in the category
        if ($products->isEmpty()) {
            $products = Product::where('in_stock', true)->inRandomOrder()->take($limit)->get();
        }

        return response()->json($products);
    }
}
