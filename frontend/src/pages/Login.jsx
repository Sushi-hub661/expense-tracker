
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Login failed. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container min-vh-100 d-flex justify-content-center align-items-center">
            <div className="card shadow-sm border-0 p-4" style={{ maxWidth: '420px', width: '100%' }}>
                <h3 className="text-center mb-2">Welcome Back</h3>
                <p className="text-muted text-center mb-4">
                    Sign in to your Expense Tracker
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={submitting}
                    >
                        {submitting ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <p className="text-center mt-4 mb-0">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
