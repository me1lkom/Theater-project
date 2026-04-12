import { login, getMe } from "../api/index";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const setUser  = useAuthStore(state => state.setUser);


    const loginUser = async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await login({ username, password });

            if(response.success) {
                const response = await getMe();
                setUser(response);
                navigate('/');
                return { success: true };
            } else {
                setError('Неверный логин или пароль');
                return { success: false };
            }
        }  catch (err) {
            setError(err.message || 'Ошибка соединения с сервером, err');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }

    return { loginUser, loading, error };
}