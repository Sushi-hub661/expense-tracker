
import axios from 'axios';
import api from './api';

const getCsrfCookie = async () => {
    await axios.get(
        'http://localhost:8000/sanctum/csrf-cookie',
        {
            withCredentials: true,
        }
    );
};

export const registerUser = async (userData) => {
    await getCsrfCookie();
    const response = await api.post('/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    await getCsrfCookie();
    const response = await api.post('/login', credentials);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/user');
    return response.data;
};

export const logoutUser = async () => {
    const response = await api.post('/logout');
    return response.data;
};
