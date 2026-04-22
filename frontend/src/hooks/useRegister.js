import { register, getMe } from '../api/index';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { getErrorMessage } from '../utils/getErrorMessage';

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
                // getMe костыль - в респонсе не лежит роль
                const response = await getMe();
                setUser(response);
                navigate('/');
                return { success: true };
            } else {
                const errorMessage = getErrorMessage({ response: { data: response } });
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }

    return { registerUser, loading, error };
}