
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [loggingOut, setLoggingOut] = useState(false);
    const [error, setError] = useState('');

    // Generate initials from the user's name
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .filter(Boolean)
            .map((word) => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'U';
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        setError('');

        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (err) {
            setError('Logout failed. Please try again.');
            setLoggingOut(false);
        }
    };

    return (
        <nav className="top-navbar">

            <div>
                <h5 className="mb-0">Dashboard</h5>
                <small className="text-muted">
                    Welcome back! Here's your overview.
                </small>
            </div>

            <div className="navbar-user">

                <span>🔔</span>

                <div className="user-avatar">
                    {getInitials(user?.name)}
                </div>

                <div>
                    <strong>{user?.name || 'User'}</strong>
                    <small className="d-block text-muted">
                        User
                    </small>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-danger btn-sm ms-3"
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    {loggingOut ? 'Logging out...' : 'Logout'}
                </button>

            </div>

            {error && (
                <div className="text-danger small ms-2">
                    {error}
                </div>
            )}

        </nav>
    );
}

export default Navbar;
