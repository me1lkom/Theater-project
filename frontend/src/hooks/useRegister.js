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

    return { registerUser, loading, error };
}