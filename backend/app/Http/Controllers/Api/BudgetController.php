<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $budgets = Budget::with('category')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Budgets retrieved successfully',
            'data' => $budgets,
        ]);
    }

    public function store(Request $request)
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
            'amount' => 'required|numeric|min:0.01',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $budget = Budget::create([
            ...$validated,
            'user_id' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Budget created successfully',
            'data' => $budget->load('category'),
        ], 201);
    }

    public function show(Request $request, Budget $budget)
    {
        abort_unless(
            $budget->user_id === $request->user()->id,
            404
        );

        return response()->json([
            'success' => true,
            'data' => $budget->load('category'),
        ]);
    }

    public function update(Request $request, Budget $budget)
    {
        abort_unless(
            $budget->user_id === $request->user()->id,
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
            'amount' => 'sometimes|required|numeric|min:0.01',
            'month' => 'sometimes|required|integer|min:1|max:12',
            'year' => 'sometimes|required|integer|min:2000|max:2100',
        ]);

        $budget->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Budget updated successfully',
            'data' => $budget->load('category'),
        ]);
    }

    public function destroy(Request $request, Budget $budget)
    {
        abort_unless(
            $budget->user_id === $request->user()->id,
            404
        );

        $budget->delete();

        return response()->json([
            'success' => true,
            'message' => 'Budget deleted successfully',
        ]);
    }
}
