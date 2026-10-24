import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api'
});

// Función para iniciar sesión
export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
};

// Función para registrar usuario
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
};

export default api;