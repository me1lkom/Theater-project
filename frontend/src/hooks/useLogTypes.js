import { useState, useEffect } from 'react';
import { getLogTypes } from '../api/index';

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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTypes();
    }, []);

    return { logTypes, loading, error };
}