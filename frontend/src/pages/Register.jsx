
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
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

        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors
                ? Object.values(errors)[0]?.[0]
                : null;

            setError(firstError || err.response?.data?.message || 'Registration failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container min-vh-100 d-flex justify-content-center align-items-center">
            <div className="card shadow-sm border-0 p-4" style={{ maxWidth: '450px', width: '100%' }}>
                <h3 className="text-center mb-2">Create Account</h3>
                <p className="text-muted text-center mb-4">
                    Start managing your money today
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

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
                            placeholder="At least 8 characters"
                            minLength="8"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            className="form-control"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="text-center mt-4 mb-0">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
