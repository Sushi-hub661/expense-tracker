import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useCurrency } from '../context/CurrencyContext';

function Settings() {

    const { setCurrency } = useCurrency();

    const [profile, setProfile] = useState(() => {
        const savedProfile = localStorage.getItem('expenseTrackerProfile');

        return savedProfile
            ? JSON.parse(savedProfile)
            : {
                name: 'Win Phyo',
                email: 'winphyo@example.com',
            };
    });

    const [preferences, setPreferences] = useState(() => {
        const savedPreferences = localStorage.getItem('expenseTrackerPreferences');

        return savedPreferences
            ? JSON.parse(savedPreferences)
            : {
                currency: 'MMK',
                theme: 'light',
            };
    });

    useEffect(() => {
        document.documentElement.setAttribute(
            'data-bs-theme',
            preferences.theme
        );
    }, [preferences.theme]);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Handle profile inputs
    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    // Handle preference inputs
    const handlePreferenceChange = (e) => {
        setPreferences({
            ...preferences,
            [e.target.name]: e.target.value,
        });
    };

    // Handle password inputs
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    // Save profile
    const handleProfileSubmit = (e) => {
        e.preventDefault();

        localStorage.setItem(
            'expenseTrackerProfile',
            JSON.stringify(profile)
        );

        alert('Profile information updated successfully!');
    };

    // Save preferences
    const handlePreferenceSubmit = (e) => {
        e.preventDefault();

        localStorage.setItem(
            'expenseTrackerPreferences',
            JSON.stringify(preferences)
        );

        setCurrency(preferences.currency);

        alert('Preferences updated successfully!');
    };

    // Change password
    const handlePasswordSubmit = (e) => {
        e.preventDefault();

        // Check current password
        if (!passwordData.currentPassword.trim()) {
            alert('Please enter your current password.');
            return;
        }

        // Check new password length
        if (passwordData.newPassword.length < 8) {
            alert('Password must be at least 8 characters.');
            return;
        }

        // Check password confirmation
        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            alert('New passwords do not match!');
            return;
        }

        // Prevent using the same password
        if (passwordData.currentPassword === passwordData.newPassword) {
            alert('Your new password must be different from your current password.');
            return;
        }

        alert('Password validation passed! Backend integration will come later.');

        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    // Logout
    const handleLogout = () => {
        const confirmed = window.confirm(
            'Are you sure you want to log out?'
        );

        if (confirmed) {
            alert('Logout functionality will be implemented later.');
        }
    };

    return (
        <DashboardLayout>

            <div className="settings-page">

                {/* Page Header */}
                <div className="dashboard-header">
                    <div>
                        <h2>Settings</h2>
                        <p>Manage your account and application preferences.</p>
                    </div>
                </div>

                {/* Profile Settings */}
                <div className="content-card settings-card">

                    <div className="settings-section-header">
                        <div className="settings-icon">
                            👤
                        </div>

                        <div>
                            <h5>Profile Information</h5>
                            <p>Update your personal information.</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={profile.name}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-success"
                        >
                            Save Profile
                        </button>

                    </form>

                </div>

                {/* Preferences */}
                <div className="content-card settings-card">

                    <div className="settings-section-header">
                        <div className="settings-icon">
                            ⚙️
                        </div>

                        <div>
                            <h5>Preferences</h5>
                            <p>Customize your application experience.</p>
                        </div>
                    </div>

                    <form onSubmit={handlePreferenceSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Currency
                                </label>

                                <select
                                    name="currency"
                                    className="form-select"
                                    value={preferences.currency}
                                    onChange={handlePreferenceChange}
                                >
                                    <option value="MMK">
                                        Myanmar Kyat (MMK)
                                    </option>

                                    <option value="USD">
                                        US Dollar (USD)
                                    </option>

                                    <option value="THB">
                                        Thai Baht (THB)
                                    </option>

                                    <option value="SGD">
                                        Singapore Dollar (SGD)
                                    </option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Theme
                                </label>

                                <select
                                    name="theme"
                                    className="form-select"
                                    value={preferences.theme}
                                    onChange={handlePreferenceChange}
                                >
                                    <option value="light">
                                        Light
                                    </option>

                                    <option value="dark">
                                        Dark
                                    </option>
                                </select>
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-success"
                        >
                            Save Preferences
                        </button>

                    </form>

                </div>

                {/* Password Settings */}
                <div className="content-card settings-card">

                    <div className="settings-section-header">
                        <div className="settings-icon">
                            🔒
                        </div>

                        <div>
                            <h5>Change Password</h5>
                            <p>Update your account password.</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit}>

                        <div className="mb-3">
                            <label className="form-label">
                                Current Password
                            </label>

                            <input
                                type="password"
                                name="currentPassword"
                                className="form-control"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                New Password
                            </label>

                            <input
                                type="password"
                                name="newPassword"
                                className="form-control"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                minLength="8"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                minLength="8"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success"
                        >
                            Change Password
                        </button>

                    </form>

                </div>

                {/* Logout */}
                <div className="content-card settings-card logout-card">

                    <div>
                        <h5>Logout</h5>
                        <p>Log out from your current account.</p>
                    </div>

                    <button
                        className="btn btn-outline-danger"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </div>

        </DashboardLayout>
    );
}

export default Settings;