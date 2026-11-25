import { useCurrency } from '../context/CurrencyContext';
import { useState } from 'react';

function TransactionModal({ show, onClose, onSave, categories = [] }) {

    const { currency } = useCurrency();

    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        title: '',
        category_id: '',
        date: new Date().toLocaleDateString('en-CA'),
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success = await onSave({
            ...formData,
            amount: Number(formData.amount),
            category_id: formData.category_id
                ? Number(formData.category_id)
                : null
        });

        if (!success) {
            return;
        }

        setFormData({
            type: 'expense',
            amount: '',
            title: '',
            category_id: '',
            date: new Date().toLocaleDateString('en-CA'),
            description: ''
        });

        onClose();
    };

    const resetForm = () => {
        setFormData({
            type: 'expense',
            amount: '',
            title: '',
            category_id: '',
            date: new Date().toLocaleDateString('en-CA'),
            description: ''
        });
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">

            <div className="transaction-modal">

                <div className="modal-header">
                    <h4>Add Transaction</h4>

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                    ></button>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="type-selector">

                        <button
                            type="button"
                            className={
                                formData.type === 'expense'
                                    ? 'type-btn active-expense'
                                    : 'type-btn'
                            }
                            onClick={() =>
                                setFormData({
                                    ...formData,
                                    type: 'expense',
                                    category_id: ''
                                })
                            }
                        >
                            Expense
                        </button>

                        <button
                            type="button"
                            className={
                                formData.type === 'income'
                                    ? 'type-btn active-income'
                                    : 'type-btn'
                            }
                            onClick={() =>
                                setFormData({
                                    ...formData,
                                    type: 'income',
                                    category_id: ''
                                })
                            }
                        >
                            Income
                        </button>

                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Amount ({currency})
                        </label>

                        <input
                            type="number"
                            name="amount"
                            className="form-control"
                            placeholder="Enter amount"
                            min="0.01"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            className="form-control"
                            placeholder="e.g. Lunch"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Category</label>

                        <select
                            className="form-select"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Category</option>

                            {categories
                                .filter(category =>
                                    category.type === formData.type ||
                                    category.type === 'both'
                                )
                                .map(category => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Date */}
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

                    {/* Note */}
                    <div className="mb-3">
                        <label className="form-label">
                            Note (Optional)
                        </label>

                        <textarea
                            name="description"
                            className="form-control"
                            placeholder="Add a note..."
                            rows="2"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-success w-100"
                    >
                        Save Transaction
                    </button>

                </form>

            </div>

        </div>
    );
}

export default TransactionModal;
