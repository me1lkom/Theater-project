import { useState, useEffect } from 'react';
import { getLogTypes } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useLogTypes() {
    const [logTypes, setLogTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const data = await getLogTypes();
                setLogTypes(data);
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchTypes();
    }, []);

    return { logTypes, loading, error };
}