import { login, getMe } from "../api/index";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const setUser = useAuthStore(state => state.setUser);


    const loginUser = async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await login({ username, password });

            if (response.success) {
                // getMe костыль - в респонсе не лежит роль
                const response = await getMe();
                setUser(response);
                navigate('/');
                return { success: true };
            } else {
                const errorMsg = getErrorMessage({ response: { data: response } });
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }

    return { loginUser, loading, error };
}