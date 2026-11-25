
import { createContext, useContext, useEffect, useState } from 'react';
import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check whether a user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await getCurrentUser();
                setUser(response.user);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = async (credentials) => {
        const response = await loginUser(credentials);
        setUser(response.user);
        return response;
    };

    const register = async (userData) => {
        const response = await registerUser(userData);
        setUser(response.user);
        return response;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
