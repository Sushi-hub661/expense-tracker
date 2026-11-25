import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout';
import SummaryCard from '../components/SummaryCard';
import TransactionModal from '../components/TransactionModal';
import formatMoney from '../utils/formatMoney';

import {
    getTransactions,
    createTransaction
} from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { useCurrency } from '../context/CurrencyContext';

function Dashboard() {

    const { currency } = useCurrency();

    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('current');


    const handleSaveTransaction = async (newTransaction) => {
        try {
            const transactionData = {
                category_id: newTransaction.category_id,
                title: newTransaction.title,
                amount: Number(newTransaction.amount),
                type: newTransaction.type,
                description: newTransaction.description || null,
                transaction_date: newTransaction.date,
            };

            await createTransaction(transactionData);

            const response = await getTransactions();

            const formattedTransactions = response.data.map(transaction => ({
                id: transaction.id,
                title: transaction.title,
                category: transaction.category?.name || 'Uncategorized',
                category_id: transaction.category_id,
                type: transaction.type,
                amount: Number(transaction.amount),
                date: transaction.transaction_date?.slice(0, 10),
            }));

            setTransactions(formattedTransactions);

            return true;

        } catch (error) {
            console.error('Error saving transaction:', error);

            alert('Failed to save transaction. Please try again.');

            return false;
        }
    };


    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getTransactions();

            const formattedTransactions = response.data.map((transaction) => ({
                id: transaction.id,
                title: transaction.title,
                category: transaction.category?.name || 'Uncategorized',
                type: transaction.type,
                amount: Number(transaction.amount),
                date: transaction.transaction_date?.slice(0, 10),
            }));

            setTransactions(formattedTransactions);
        } catch (error) {
            console.error('Error fetching dashboard transactions:', error);

            setError(
                'Unable to load your transactions. Please check your connection and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();

                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const currentDate = new Date();

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
        );
    });

    const totalIncome = transactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const totalExpenses = transactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const balance = totalIncome - totalExpenses;

    const income = monthlyTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const expenses = monthlyTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const chartDate = new Date();

    if (selectedMonth === 'last') {
        chartDate.setMonth(chartDate.getMonth() - 1);
    }

    const chartYear = chartDate.getFullYear();
    const chartMonth = chartDate.getMonth();

    const daysInMonth = new Date(
        chartYear,
        chartMonth + 1,
        0
    ).getDate();

    const weeklyExpenses = [];

    for (let week = 0; week < 5; week++) {
        const startDay = week * 7 + 1;
        const endDay = Math.min(startDay + 6, daysInMonth);

        const weeklyTotal = transactions
            .filter((transaction) => {
                const transactionDate = new Date(
                    `${transaction.date}T00:00:00`
                );

                return (
                    transactionDate.getFullYear() === chartYear &&
                    transactionDate.getMonth() === chartMonth &&
                    transactionDate.getDate() >= startDay &&
                    transactionDate.getDate() <= endDay &&
                    transaction.type === 'expense'
                );
            })
            .reduce((total, transaction) => total + transaction.amount, 0);

        weeklyExpenses.push({
            day: `Week ${week + 1}`,
            amount: weeklyTotal
        });
    }

    const maxWeeklyExpense = Math.max(
        ...weeklyExpenses.map((item) => item.amount),
        1
    );

    return (

        <DashboardLayout>

            {loading && (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <span className="ms-3 text-muted">
                        Loading your dashboard...
                    </span>
                </div>
            )}

            {error && (
                <div className="alert alert-danger text-center my-3">
                    <p className="mb-2">{error}</p>

                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={fetchTransactions}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Dashboard Header */}
            <div className="dashboard-header">

                <div>
                    <h3>Good morning 👋</h3>

                    <p className="text-muted">
                        Here's your financial overview.
                    </p>
                </div>

                <button
                    className="btn btn-success"
                    onClick={() => setShowModal(true)}
                >
                    + Add Transaction
                </button>

            </div>


            {/* Financial Summary */}
            <div className="summary-grid">

                <SummaryCard
                    title="Total Balance"
                    amount={`${formatMoney(balance, currency)} `}
                    icon="💰"
                    color="purple"
                    subtitle="All-time balance"
                />

                <SummaryCard
                    title="Income"
                    amount={`${formatMoney(income, currency)} `}
                    icon="↙"
                    color="green"
                    subtitle="This month"
                />

                <SummaryCard
                    title="Expenses"
                    amount={`${formatMoney(expenses, currency)} `}
                    icon="↗"
                    color="red"
                    subtitle="This month"
                />

            </div>


            {/* Expense Overview */}
            <div className="content-card">

                <div className="section-header">
                    <h5>Expense Overview</h5>

                    <select
                        className="form-select month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="current">This month</option>
                        <option value="last">Last month</option>
                    </select>
                </div>

                <div className="chart-placeholder">
                    {weeklyExpenses.every(item => item.amount === 0) ? (
                        <div className="text-center text-muted w-100 my-auto">
                            <p className="mb-1">No expenses found.</p>
                            <small>
                                Add an expense to see your chart.
                            </small>
                        </div>
                    ) : (
                        weeklyExpenses.map((item, index) => (
                            <div className="chart-bar" key={index}>
                                <div
                                    title={`${formatMoney(item.amount)} `}
                                    style={{
                                        height: `${(item.amount / maxWeeklyExpense) * 100}%`
                                    }}
                                ></div>
                                <span>{item.day}</span>
                            </div>
                        ))
                    )}
                </div>

            </div>


            {/* Recent Transactions */}
            <div className="content-card">

                <div className="section-header">
                    <h5>Recent Transactions</h5>

                    <button
                        className="btn btn-link"
                        onClick={() => navigate('/transactions')}
                    >
                        View all →
                    </button>
                </div>

                <div className="table-responsive">

                    <table className="table align-middle">

                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th className="text-end">Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">
                                        No transactions yet.
                                        <br />
                                        <small>
                                            Add your first transaction to see it here.
                                        </small>
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.title}</td>
                                        <td>{transaction.category}</td>
                                        <td>
                                            <span
                                                className={`badge ${transaction.type === 'income'
                                                    ? 'bg-success'
                                                    : 'bg-danger'
                                                    }`}
                                            >
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td>
                                            {formatMoney(transaction.amount, currency)} 
                                        </td>
                                        <td>{transaction.date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>

                </div>

            </div>


            {/* Add Transaction Modal */}
            <TransactionModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveTransaction}
                categories={categories}
            />

        </DashboardLayout>

    );
}

export default Dashboard;
