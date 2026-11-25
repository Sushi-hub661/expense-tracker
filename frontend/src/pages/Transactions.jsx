import { getCategories } from '../services/categoryService';
import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from '../services/transactionService';
import formatMoney from '../utils/formatMoney';
import { useCurrency } from '../context/CurrencyContext';

function Transactions() {

    const { currency } = useCurrency();

    const [categories, setCategories] = useState([]);

    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');

    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [showModal, setShowModal] = useState(false);

    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category_id: '',
        type: 'expense',
        amount: '',
        date: new Date().toLocaleDateString('en-CA')
    });

    const filteredTransactions = transactions.filter((transaction) => {

        const matchesSearch = transaction.title
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesType =
            typeFilter === 'all' ||
            transaction.type === typeFilter;

        const matchesCategory =
            categoryFilter === 'all' ||
            transaction.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAdd = () => {

        setEditId(null);

        setFormData({
            title: '',
            category_id: '',
            type: 'expense',
            amount: '',
            date: new Date().toLocaleDateString('en-CA')
        });

        setShowModal(true);
    };

    const handleEdit = (transaction) => {

        setEditId(transaction.id);

        setFormData({
            title: transaction.title,
            category_id: transaction.category_id || '',
            type: transaction.type,
            amount: transaction.amount,
            date: transaction.date
        });

        setEditId(transaction.id);
        setShowModal(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(formData.amount) <= 0) {
            alert('Amount must be greater than zero.');
            return;
        }

        try {
            console.log("Form Data:", formData);

            const transactionData = {
                category_id: formData.category_id || null,
                title: formData.title,
                amount: Number(formData.amount),
                type: formData.type,
                description: null,
                transaction_date: formData.date,
            };

            if (editId !== null) {
                await updateTransaction(editId, transactionData);
            } else {
                await createTransaction(transactionData);
            }

            // Get the latest data from Laravel
            const response = await getTransactions();

            const formattedTransactions = response.data.map((transaction) => ({
                id: transaction.id,
                category_id: transaction.category_id || '',
                title: transaction.title,
                category: transaction.category?.name || 'Uncategorized',
                type: transaction.type,
                amount: Number(transaction.amount),
                date: transaction.transaction_date,
            }));

            setTransactions(formattedTransactions);

            setShowModal(false);
            setEditId(null);

        } catch (error) {
            console.error('Error saving transaction:', error);

            alert('Failed to save transaction. Please try again.');
        }
    };

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            'Are you sure you want to delete this transaction?'
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteTransaction(id);

            const response = await getTransactions();

            const formattedTransactions = response.data.map((transaction) => ({
                id: transaction.id,
                category_id: transaction.category_id || '',
                title: transaction.title,
                category: transaction.category?.name || 'Uncategorized',
                type: transaction.type,
                amount: Number(transaction.amount),
                date: transaction.transaction_date,
            }));

            setTransactions(formattedTransactions);

            alert('Transaction deleted successfully!');

        } catch (error) {

            console.error('Error deleting transaction:', error);

            alert('Failed to delete transaction. Please try again.');

        }
    };


    useEffect(() => {

        const fetchTransactions = async () => {

            try {
                setLoading(true);

                const response = await getTransactions();

                const formattedTransactions = response.data.map((transaction) => ({
                    id: transaction.id,
                    category_id: transaction.category_id || '',
                    title: transaction.title,
                    category: transaction.category?.name || 'Uncategorized',
                    type: transaction.type,
                    amount: Number(transaction.amount),
                    date: transaction.transaction_date,
                }));

                setTransactions(formattedTransactions);

            } catch (error) {

                console.error('Error fetching transactions:', error);

                setError('Failed to load transactions.');

            } finally {

                setLoading(false);

            }
        };

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

    useEffect(() => {
        const selectedCategory = categories.find(
            (category) => category.id === Number(formData.category_id)
        );

        if (
            selectedCategory &&
            selectedCategory.type !== formData.type &&
            selectedCategory.type !== 'both'
        ) {
            setFormData((previousData) => ({
                ...previousData,
                category_id: '',
            }));
        }
    }, [formData.type, formData.category_id, categories]);

    return (

        <DashboardLayout>

            <div className="dashboard-header">

                <div>
                    <h3>Transactions</h3>

                    <p className="text-muted">
                        Manage your income and expenses.
                    </p>
                </div>

                <button
                    className="btn btn-success"
                    onClick={handleAdd}
                >
                    + Add Transaction
                </button>

            </div>


            <div className="content-card">

                <div className="row g-3">

                    <div className="col-md-4">

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                    </div>

                    <div className="col-md-4">

                        <select
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(e.target.value)
                            }
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>

                    </div>

                    <div className="col-md-4">

                        <select
                            className="form-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                    </div>

                </div>

            </div>

            {loading && (
                <div className="text-center py-4">
                    <div className="spinner-border text-success"></div>
                    <p className="mt-2">Loading transactions...</p>
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Transaction Table */}
            <div className="content-card">

                <div className="section-header">
                    <h5>All Transactions</h5>

                    <span className="text-muted">
                        {filteredTransactions.length} records
                    </span>
                </div>

                <div className="table-responsive">

                    <table className="table align-middle">

                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredTransactions.length > 0 ? (

                                filteredTransactions.map((transaction) => (

                                    <tr key={transaction.id}>

                                        <td>
                                            <strong>
                                                {transaction.title}
                                            </strong>
                                        </td>

                                        <td>{transaction.category}</td>

                                        <td>{transaction.date}</td>

                                        <td>
                                            <span className={
                                                transaction.type === 'income'
                                                    ? 'badge text-bg-success'
                                                    : 'badge text-bg-danger'
                                            }>
                                                {transaction.type}
                                            </span>
                                        </td>

                                        <td className={
                                            transaction.type === 'income'
                                                ? 'text-success fw-bold'
                                                : 'text-danger fw-bold'
                                        }>
                                            {transaction.type === 'income'
                                                ? '+'
                                                : '-'
                                            }
                                            {formatMoney(transaction.amount, currency)}
                                        </td>

                                        <td>

                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() =>
                                                    handleEdit(transaction)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    handleDelete(transaction.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        No transactions found.
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {showModal && (

                <div className="modal-overlay">

                    <div className="transaction-modal">

                        <div className="modal-header">

                            <h4>
                                {editId !== null
                                    ? 'Edit Transaction'
                                    : 'Add Transaction'
                                }
                            </h4>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                            ></button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="mb-3">

                                <label className="form-label">
                                    Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Amount ({currency})
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    className="form-control"
                                    min="0.01"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Type
                                </label>

                                <select
                                    name="type"
                                    className="form-select"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Category
                                </label>

                                <select
                                    name="category_id"
                                    className="form-select"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>

                                    {categories
                                        .filter((category) =>
                                            category.type === formData.type ||
                                            category.type === 'both'
                                        )
                                        .map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                </select>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    name="date"
                                    className="form-control"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                            >
                                {editId !== null
                                    ? 'Update Transaction'
                                    : 'Save Transaction'
                                }
                            </button>

                        </form>

                    </div>

                </div>

            )}

        </DashboardLayout>
    );
}

export default Transactions;
