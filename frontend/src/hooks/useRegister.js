import { register, getMe } from '../api/index';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';

export function useRegister() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const setUser = useAuthStore(state => state.setUser);

    const registerUser = async (username, password, password2, email, first_name, last_name, phone) => {
        console.log(username, password, password2, email, first_name, last_name, phone);

        setLoading(true);
        setError(null);

        try {
            const response = await register({ username, password, password2, email, first_name, last_name, phone })
            console.log(response);
            if (response.success) {
                const response = await getMe();
                setUser(response);
                navigate('/');
                return { success: true };
            } else {
                setError(response.message || 'Ошибка регистрации');
            }
        } catch (err) {
            setError(err.message || 'Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    }

    return { registerUser, loading, error };
}