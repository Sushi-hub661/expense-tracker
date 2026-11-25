<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::with('category')
            ->where('user_id', $request->user()->id)
            ->latest('transaction_date')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved successfully',
            'data' => $transactions,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(
                    fn ($query) => $query->where(function ($query) use ($userId) {
                        $query->whereNull('user_id')
                            ->orWhere('user_id', $userId);
                    })
                ),
            ],
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $transaction = Transaction::create([
            ...$validated,
            'user_id' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'data' => $transaction->load('category'),
        ], 201);
    }

    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        abort_unless(
            $transaction->user_id === $request->user()->id,
            404
        );

        return response()->json([
            'success' => true,
            'message' => 'Transaction retrieved successfully',
            'data' => $transaction->load('category'),
        ]);
    }

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        abort_unless(
            $transaction->user_id === $request->user()->id,
            404
        );

        $userId = $request->user()->id;

        $validated = $request->validate([
            'category_id' => [
                'sometimes',
                'nullable',
                Rule::exists('categories', 'id')->where(
                    fn ($query) => $query->where(function ($query) use ($userId) {
                        $query->whereNull('user_id')
                            ->orWhere('user_id', $userId);
                    })
                ),
            ],
            'title' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'type' => 'sometimes|required|in:income,expense',
            'description' => 'sometimes|nullable|string',
            'transaction_date' => 'sometimes|required|date',
        ]);

        $transaction->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Transaction updated successfully',
            'data' => $transaction->load('category'),
        ]);
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        abort_unless(
            $transaction->user_id === $request->user()->id,
            404
        );

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully',
        ]);
    }
}
