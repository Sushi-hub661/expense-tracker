import { useState, useEffect } from 'react';

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

import DashboardLayout from '../layouts/DashboardLayout';
import { getTransactions } from '../services/transactionService';
import formatMoney from '../utils/formatMoney';
import { useCurrency } from '../context/CurrencyContext';


function Reports() {

    const { currency } = useCurrency();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('last6');

    // Calculate income and expenses for the last 6 months
    // Calculate monthly income and expenses based on selected period
    const monthlyData = [];

    const today = new Date();

    let startDate;
    let numberOfMonths;

    if (selectedPeriod === 'last6') {
        startDate = new Date(
            today.getFullYear(),
            today.getMonth() - 5,
            1
        );

        numberOfMonths = 6;

    } else if (selectedPeriod === 'thisYear') {
        startDate = new Date(today.getFullYear(), 0, 1);

        numberOfMonths = 12;

    } else {
        startDate = new Date(today.getFullYear() - 1, 0, 1);

        numberOfMonths = 12;
    }

    for (let i = 0; i < numberOfMonths; i++) {
        const date = new Date(
            startDate.getFullYear(),
            startDate.getMonth() + i,
            1
        );

        const month = date.getMonth();
        const year = date.getFullYear();

        const monthlyTransactions = transactions.filter((transaction) => {
            const transactionDate = new Date(
                `${transaction.date}T00:00:00`
            );

            return (
                transactionDate.getMonth() === month &&
                transactionDate.getFullYear() === year
            );
        });

        const income = monthlyTransactions
            .filter((transaction) => transaction.type === 'income')
            .reduce((total, transaction) => total + transaction.amount, 0);

        const expenses = monthlyTransactions
            .filter((transaction) => transaction.type === 'expense')
            .reduce((total, transaction) => total + transaction.amount, 0);

        monthlyData.push({
            month: date.toLocaleDateString('en-US', {
                month: 'short'
            }),
            income,
            expenses
        });
    }

    // Calculate expense totals by category
    // Get the ending date of the selected period
    const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + numberOfMonths,
        1
    );

    // Filter transactions within the selected period
    const periodTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(
            `${transaction.date}T00:00:00`
        );

        return transactionDate >= startDate &&
            transactionDate < endDate;
    });

    // Calculate expenses for each category
    const categoryTotals = periodTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((totals, transaction) => {
            const categoryName = transaction.category || 'Uncategorized';

            totals[categoryName] =
                (totals[categoryName] || 0) + transaction.amount;

            return totals;
        }, {});

    // Convert category totals into chart data
    const categoryData = Object.entries(categoryTotals).map(
        ([name, value]) => ({
            name,
            value
        })
    );

    // Chart colors
    const COLORS = [
        '#256d49',
        '#4caf50',
        '#81c784',
        '#ffc107',
        '#ff7043',
    ];

    const periodLabel =
        selectedPeriod === 'last6'
            ? 'Last 6 Months'
            : selectedPeriod === 'thisYear'
                ? 'This Year'
                : 'Last Year';

    // Calculate total income
    const totalIncome = monthlyData.reduce(
        (total, item) => total + item.income,
        0
    );

    // Calculate total expenses
    const totalExpenses = monthlyData.reduce(
        (total, item) => total + item.expenses,
        0
    );

    // Calculate savings
    const totalSavings = totalIncome - totalExpenses;

    // Calculate total category spending
    const totalCategoryExpenses = categoryData.reduce(
        (total, item) => total + item.value,
        0
    );


    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getTransactions();

                const formattedTransactions = response.data.map((transaction) => ({
                    id: transaction.id,
                    title: transaction.title,
                    category: transaction.category?.name || 'Uncategorized',
                    category_id: transaction.category_id,
                    type: transaction.type,
                    amount: Math.abs(Number(transaction.amount)),
                    date: transaction.transaction_date?.slice(0, 10),
                }));

                setTransactions(formattedTransactions);

            } catch (error) {
                console.error('Error fetching report transactions:', error);
                setError('Failed to load report data.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <DashboardLayout>

            {loading ? (
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-success"
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>

                    <p className="text-muted mt-3">
                        Loading reports...
                    </p>
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            ) : (
                <div className="reports-page">

                    {/* Page Header */}
                    <div className="dashboard-header">
                        <div>
                            <h2>Reports & Analytics</h2>
                            <p>Analyze your financial activities.</p>
                        </div>

                        <select
                            className="form-select report-filter"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option value="last6">Last 6 Months</option>
                            <option value="thisYear">This Year</option>
                            <option value="lastYear">Last Year</option>
                        </select>
                    </div>

                    {/* Summary Cards */}
                    <div className="summary-grid">

                        <div className="summary-card">
                            <div className="summary-card-header">
                                <span>Total Income</span>
                                <span className="summary-icon green">
                                    💰
                                </span>
                            </div>

                            <h3>{formatMoney(totalIncome, currency)}</h3>
                            <small>{`Income — ${periodLabel}`}</small>
                        </div>

                        <div className="summary-card">
                            <div className="summary-card-header">
                                <span>Total Expenses</span>
                                <span className="summary-icon red">
                                    💸
                                </span>
                            </div>

                            <h3>{formatMoney(totalExpenses, currency)}</h3>
                            <small>{`Expenses — ${periodLabel}`}</small>
                        </div>

                        <div className="summary-card">
                            <div className="summary-card-header">
                                <span>Net Savings</span>
                                <span className="summary-icon purple">
                                    💵
                                </span>
                            </div>

                            <h3>{formatMoney(totalSavings, currency)}</h3>
                            <small>{`Savings — ${periodLabel}`}</small>
                        </div>

                    </div>

                    {/* Income vs Expenses Chart */}
                    <div className="content-card report-chart-card">

                        <div className="section-header">
                            <h5>Income vs Expenses</h5>
                        </div>

                        <div className="report-chart">
                            {monthlyData.some(
                                (item) => item.income > 0 || item.expenses > 0
                            ) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData}>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis dataKey="month" />

                                        <YAxis
                                            tickFormatter={(value) => formatMoney(value, currency)}
                                        />

                                        <Tooltip
                                            formatter={(value) =>
                                                formatMoney(value, currency)
                                            }
                                        />

                                        <Legend />

                                        <Bar
                                            dataKey="income"
                                            name="Income"
                                            fill="#256d49"
                                            radius={[5, 5, 0, 0]}
                                        />

                                        <Bar
                                            dataKey="expenses"
                                            name="Expenses"
                                            fill="#e57373"
                                            radius={[5, 5, 0, 0]}
                                        />

                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted mb-1">
                                        No financial data available.
                                    </p>

                                    <small className="text-muted">
                                        Add income or expense transactions to see your monthly report.
                                    </small>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Expense Breakdown */}
                    <div className="content-card report-chart-card">

                        <div className="section-header">
                            <h5>Expense Breakdown</h5>
                        </div>

                        <div className="expense-breakdown">

                            <div className="pie-chart-container">

                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip formatter={(value) => formatMoney(value, currency)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted mb-1">
                                            No expense data available.
                                        </p>
                                        <small className="text-muted">
                                            Add some expense transactions to see your breakdown.
                                        </small>
                                    </div>
                                )}

                            </div>

                            {/* Category Details */}
                            <div className="category-breakdown-list">

                                {categoryData.map((category, index) => {

                                    const percentage =
                                        totalCategoryExpenses > 0
                                            ? (category.value / totalCategoryExpenses) * 100
                                            : 0;

                                    return (
                                        <div
                                            className="category-breakdown-item"
                                            key={category.name}
                                        >

                                            <div className="category-breakdown-header">

                                                <div className="category-breakdown-name">

                                                    <span
                                                        className="category-color-dot"
                                                        style={{
                                                            backgroundColor:
                                                                COLORS[index % COLORS.length],
                                                        }}
                                                    ></span>

                                                    <span>
                                                        {category.name}
                                                    </span>

                                                </div>

                                                <strong>
                                                    {formatMoney(category.value, currency)}
                                                </strong>

                                            </div>

                                            <div className="category-breakdown-progress">

                                                <div
                                                    className="category-breakdown-bar"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor:
                                                            COLORS[index % COLORS.length],
                                                    }}
                                                ></div>

                                            </div>

                                            <small>
                                                {percentage.toFixed(1)}% of expenses
                                            </small>

                                        </div>
                                    );
                                })}

                            </div>

                        </div>

                    </div>

                </div>
            )}



        </DashboardLayout>
    );
}

export default Reports;