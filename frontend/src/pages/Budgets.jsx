import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

import {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget
} from '../services/budgetService';
import { getCategories } from '../services/categoryService';
import { getTransactions } from '../services/transactionService';
import formatMoney from '../utils/formatMoney';
import { useCurrency } from '../context/CurrencyContext';

function Budgets() {

    const { currency } = useCurrency();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        category_id: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );

    const [selectedYear, setSelectedYear] = useState(
        new Date().getFullYear()
    );

    const getSpentAmount = (budget) => {
        return transactions
            .filter((transaction) => {
                const transactionDate = new Date(
                    `${String(transaction.transaction_date).slice(0, 10)}T00:00:00`
                );

                return (
                    Number(transaction.category_id) === Number(budget.category_id) &&
                    transaction.type === 'expense' &&
                    transactionDate.getMonth() + 1 === Number(budget.month) &&
                    transactionDate.getFullYear() === Number(budget.year)
                );
            })
            .reduce((total, transaction) => {
                return total + Math.abs(Number(transaction.amount));
            }, 0);
    };

    const filteredBudgets = budgets.filter((budget) => {
        return (
            Number(budget.month) === Number(selectedMonth) &&
            Number(budget.year) === Number(selectedYear)
        );
    });

    // Calculate total budget
    const totalBudget = filteredBudgets.reduce(
        (total, budget) => total + budget.limit,
        0
    );

    // Calculate total spending
    const totalSpent = filteredBudgets.reduce(
        (total, budget) => total + getSpentAmount(budget),
        0
    );

    // Calculate remaining budget
    const remainingBudget = totalBudget - totalSpent;

    // Calculate percentage spent
    const percentageSpent = totalBudget > 0
        ? Math.min((totalSpent / totalBudget) * 100, 100)
        : 0;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Open Add Budget modal
    const handleAdd = () => {
        setFormData({
            category_id: '',
            amount: '',
            month: selectedMonth,
            year: selectedYear
        });

        setEditId(null);
        setShowModal(true);
    };

    // Open Edit Budget modal
    const handleEdit = (budget) => {
        setFormData({
            category_id: budget.category_id,
            amount: budget.limit,
            month: budget.month,
            year: budget.year
        });

        setEditId(budget.id);
        setShowModal(true);
    };

    // Save or Update Budget
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category_id || !formData.amount) {
            alert('Please select a category and enter a budget amount.');
            return;
        }

        try {
            const budgetData = {
                category_id: Number(formData.category_id),
                amount: Number(formData.amount),
                month: Number(formData.month),
                year: Number(formData.year),
            };

            if (editId) {
                await updateBudget(editId, budgetData);
                alert('Budget updated successfully!');
            } else {
                await createBudget(budgetData);
                alert('Budget added successfully!');
            }

            // Reload budgets from Laravel
            const response = await getBudgets();

            const formattedBudgets = response.data.map((budget) => ({
                id: budget.id,
                category: budget.category?.name || 'Overall Budget',
                limit: Number(budget.amount),
                spent: 0,
                category_id: budget.category_id,
                month: budget.month,
                year: budget.year,
            }));

            setBudgets(formattedBudgets);

            setFormData({
                category_id: '',
                amount: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });

            setEditId(null);
            setShowModal(false);

        } catch (error) {
            console.error('Error saving budget:', error);

            alert(
                error.response?.data?.message ||
                'Failed to save budget. Please try again.'
            );
        }
    };

    // Delete Budget
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this budget?'
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteBudget(id);

            setBudgets((previousBudgets) =>
                previousBudgets.filter((budget) => budget.id !== id)
            );

            alert('Budget deleted successfully!');

        } catch (error) {
            console.error('Error deleting budget:', error);

            alert(
                error.response?.data?.message ||
                'Failed to delete budget. Please try again.'
            );
        }
    };

    // Calculate spending percentage
    const getPercentage = (spent, limit) => {
        if (limit <= 0) return 0;

        return Math.min((spent / limit) * 100, 100);
    };

    // Determine progress bar color
    const getProgressColor = (spent, limit) => {
        const percentage = (spent / limit) * 100;

        if (percentage >= 100) {
            return 'bg-danger';
        }

        if (percentage >= 80) {
            return 'bg-warning';
        }

        return 'bg-success';
    };

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getBudgets();

                const formattedBudgets = response.data.map((budget) => ({
                    id: budget.id,
                    category: budget.category?.name || 'Overall Budget',
                    limit: Number(budget.amount),
                    spent: 0,
                    category_id: budget.category_id,
                    month: budget.month,
                    year: budget.year,
                }));

                setBudgets(formattedBudgets);

            } catch (error) {
                console.error('Error fetching budgets:', error);
                setError('Failed to load budgets.');
            } finally {
                setLoading(false);
            }
        };

        fetchBudgets();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();

                const categoryList = Array.isArray(response)
                    ? response
                    : response.data || [];

                setCategories(categoryList);

            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await getTransactions();

                setTransactions(response.data);

            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <DashboardLayout>

            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading budgets...</p>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="budgets-page">

                {/* Page Header */}
                <div className="dashboard-header">
                    <div>
                        <h2>Budgets</h2>
                        <p>Manage your monthly spending limits.</p>
                    </div>

                    <button
                        className="btn btn-success"
                        onClick={handleAdd}
                    >
                        + Add Budget
                    </button>
                </div>

                <div className="row g-3 mb-4">
                    {/* Month Filter */}
                    <div className="col-md-4">
                        <label className="form-label">Select Month</label>
                        <select
                            className="form-select"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div className="col-md-4">
                        <label className="form-label">Select Year</label>
                        <input
                            type="number"
                            className="form-control"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            min="2000"
                            max="2100"
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="summary-grid">

                    <div className="summary-card">
                        <div className="summary-card-header">
                            <span>Total Budget</span>
                            <span className="summary-icon purple">💰</span>
                        </div>

                        <h3>{formatMoney(totalBudget, currency)}</h3>
                        <small>Monthly spending limit</small>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-header">
                            <span>Total Spent</span>
                            <span className="summary-icon red">💸</span>
                        </div>

                        <h3>{formatMoney(totalSpent, currency)}</h3>
                        <small>Money spent this month</small>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-header">
                            <span>Remaining</span>
                            <span className="summary-icon green">💵</span>
                        </div>

                        <h3>{formatMoney(remainingBudget, currency)}</h3>
                        <small>Available budget</small>
                    </div>
                </div>

                {/* Overall Budget Progress */}
                <div className="content-card budget-overview">
                    <div className="section-header">
                        <h5>Overall Budget Usage</h5>
                        <span>
                            {percentageSpent.toFixed(1)}%
                        </span>
                    </div>

                    <div className="progress" style={{ height: '12px' }}>
                        <div
                            className={`progress-bar ${percentageSpent >= 100
                                ? 'bg-danger'
                                : percentageSpent >= 80
                                    ? 'bg-warning'
                                    : 'bg-success'
                                }`}
                            style={{
                                width: `${Math.min(percentageSpent, 100)}%`,
                            }}
                        ></div>
                    </div>

                    <p className="mt-2 mb-0 text-muted">
                        You have spent {formatMoney(totalSpent, currency)} out of
                        {' '}{formatMoney(totalBudget, currency)}.
                    </p>
                </div>

                {/* Budget List */}
                {!loading && !error && (
                    <div className="content-card">
                        <div className="section-header">
                            <h5>Category Budgets</h5>
                            <span>{budgets.length} budgets</span>
                        </div>

                        <div className="budget-list">

                            {filteredBudgets.map((budget) => {
                                const spent = getSpentAmount(budget);

                                const percentage = Math.min(
                                    getPercentage(spent, budget.limit),
                                    100
                                );

                                const remaining = budget.limit - spent;

                                return (
                                    <div
                                        className="budget-item"
                                        key={budget.id}
                                    >
                                        <div className="budget-item-header">

                                            <div>
                                                <h6>{budget.category}</h6>

                                                <p className="text-muted small mb-2">
                                                    {new Date(
                                                        budget.year,
                                                        budget.month - 1
                                                    ).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>

                                                <small>
                                                    {formatMoney(spent, currency)}
                                                    {' / '}
                                                    {formatMoney(budget.limit, currency)}
                                                </small>
                                            </div>

                                            <div className="budget-actions">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleEdit(budget)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(budget.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div className="progress budget-progress">
                                            <div
                                                className={`progress-bar ${getProgressColor(
                                                    spent,
                                                    budget.limit
                                                )}`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            ></div>
                                        </div>

                                        <div className="budget-item-footer">
                                            <span>
                                                {percentage.toFixed(1)}% used
                                            </span>

                                            <span className={
                                                remaining < 0
                                                    ? 'text-danger'
                                                    : 'text-success'
                                            }>
                                                {remaining < 0
                                                    ? `${formatMoney(Math.abs(remaining), currency)} over budget`
                                                    : `${formatMoney(remaining, currency)} remaining`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredBudgets.length === 0 && (
                                <div className="text-center py-4">
                                    <h5>No budgets found</h5>
                                    <p className="text-muted">
                                        You haven't created any budgets for this month yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Add/Edit Budget Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="transaction-modal">

                            <div className="modal-header">
                                <h5>
                                    {editId !== null
                                        ? 'Edit Budget'
                                        : 'Add Budget'}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">
                                    <label className="form-label">Category</label>

                                    <select
                                        className="form-select"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>

                                        {categories
                                            .filter(category =>
                                                category.type === 'expense' || category.type === 'both'
                                            )
                                            .map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.icon} {category.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Monthly Budget Amount ({currency})
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                {/* Month */}
                                <div className="mb-3">
                                    <label className="form-label">Month</label>
                                    <select
                                        className="form-select"
                                        name="month"
                                        value={formData.month}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                </div>

                                {/* Year */}
                                <div className="mb-3">
                                    <label className="form-label">Year</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        min="2000"
                                        max="2100"
                                        required
                                    />
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                    >
                                        {editId !== null
                                            ? 'Update Budget'
                                            : 'Add Budget'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}

export default Budgets;