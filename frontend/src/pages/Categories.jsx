import DashboardLayout from '../layouts/DashboardLayout';

import { useEffect, useState } from "react";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../services/categoryService";

function Categories() {

    const [deletingId, setDeletingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        icon: '📁',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAdd = () => {
        setEditId(null);
        setFormData({ name: '', type: 'expense', icon: '📁' });
        setShowModal(true);
    };

    const handleEdit = (category) => {
        setEditId(category.id);
        setFormData({
            name: category.name,
            type: category.type,
            icon: category.icon,
        });
        setShowModal(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (saving) {
            return;
        }

        const categoryName = formData.name.trim();

        if (categoryName.length < 2) {
            setToast({
                message: 'Category name must contain at least 2 characters.',
                type: 'danger',
            });
            return;
        }

        const duplicateCategory = categories.some((category) => {
            return (
                category.name.toLowerCase() === categoryName.toLowerCase() &&
                category.type === formData.type &&
                category.id !== editId
            );
        });

        if (duplicateCategory) {
            setToast({
                message: 'This category already exists.',
                type: 'danger',
            });
            return;
        }

        try {
            setSaving(true);

            const categoryData = {
                ...formData,
                name: categoryName,
            };

            if (editId !== null) {
                await updateCategory(editId, categoryData);

                setToast({
                    message: 'Category updated successfully!',
                    type: 'success',
                });
            } else {
                await createCategory(categoryData);

                setToast({
                    message: 'Category created successfully!',
                    type: 'success',
                });
            }

            const response = await getCategories();
            setCategories(response.data);

            setShowModal(false);
            setEditId(null);

            setFormData({
                name: '',
                type: 'expense',
                icon: '📁',
            });

        } catch (error) {
            console.error('Error saving category:', error);

            setToast({
                message: error.response?.data?.message ||
                    'Failed to save category.',
                type: 'danger',
            });

        } finally {
            setSaving(false);
        }
    };



    const handleDelete = async (id) => {
        if (deletingId !== null) {
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete this category?'
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);

            await deleteCategory(id);

            const response = await getCategories();
            setCategories(response.data);

            setToast({
                message: 'Category deleted successfully!',
                type: 'success',
            });

        } catch (error) {
            console.error('Error deleting category:', error);

            setToast({
                message: error.response?.data?.message ||
                    'Failed to delete category.',
                type: 'danger',
            });

        } finally {
            setDeletingId(null);
        }
    };


    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getCategories();
            setCategories(response.data);

        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timer = setTimeout(() => {
            setToast(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast]);

    return (

        <DashboardLayout>

            {toast && (
                <div
                    className={`alert alert-${toast.type} alert-dismissible fade show position-fixed top-0 end-0 m-3 shadow`}
                    role="alert"
                    style={{ zIndex: 1100, minWidth: '280px' }}
                >
                    {toast.message}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setToast(null)}
                        aria-label="Close"
                    ></button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>

                    <p className="text-muted mt-3">
                        Loading categories...
                    </p>
                </div>
            ) : error ? (
                <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                    <span>{error}</span>

                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={fetchCategories}
                    >
                        Try Again
                    </button>
                </div>
            ) : (

                <div className="categories-page">
                    <div className="dashboard-header">
                        <div>
                            <h2>Categories</h2>
                            <p>Manage your income and expense categories.</p>
                        </div>

                        <button className="btn btn-success" onClick={handleAdd}>
                            + Add Category
                        </button>
                    </div>

                    <div className="content-card">
                        <div className="section-header">
                            <h5>All Categories</h5>
                            <span>{categories.length} categories</span>
                        </div>

                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Type</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id}>
                                            <td>
                                                <span className="category-icon">
                                                    {category.icon}
                                                </span>
                                                <strong>{category.name}</strong>
                                            </td>

                                            <td>
                                                <span className={`badge ${category.type === 'income'
                                                    ? 'bg-success'
                                                    : 'bg-danger'
                                                    }`}>
                                                    {category.type}
                                                </span>
                                            </td>

                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(category.id)}
                                                    disabled={deletingId !== null}
                                                >
                                                    {deletingId === category.id ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        'Delete'
                                                    )}
                                                </button>

                                            </td>
                                        </tr>
                                    ))}

                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4">
                                                No categories found.
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
                                    <h5>
                                        {editId !== null
                                            ? 'Edit Category'
                                            : 'Add Category'}
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Category Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="e.g. Education"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Category Type
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
                                            Icon (emoji)
                                        </label>
                                        <input
                                            type="text"
                                            name="icon"
                                            className="form-control"
                                            value={formData.icon}
                                            onChange={handleChange}
                                            placeholder="e.g. 📚"
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
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                editId !== null ? 'Update' : 'Save'
                                            )}
                                        </button>

                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

            )}

        </DashboardLayout>

    );
}

export default Categories;