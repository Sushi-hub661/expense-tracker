<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::whereNull('user_id')
            ->orWhere('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved successfully',
            'data' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense,both',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:50',
        ]);

        $category = Category::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    public function show(Request $request, Category $category): JsonResponse
    {
        abort_unless(
            $category->user_id === null ||
            $category->user_id === $request->user()->id,
            404
        );

        return response()->json([
            'success' => true,
            'message' => 'Category retrieved successfully',
            'data' => $category,
        ]);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        abort_unless(
            $category->user_id === $request->user()->id,
            404
        );

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:income,expense,both',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:50',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        abort_unless(
            $category->user_id === $request->user()->id,
            404
        );

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}
