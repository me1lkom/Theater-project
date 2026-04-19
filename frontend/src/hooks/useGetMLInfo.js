import { useState, useEffect } from 'react';
import { getMLInfo } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetMLInfo() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                setLoading(true);
                const data = await getMLInfo();
                setInfo(data);
                setError(null);
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, []);

    return { info, loading, error };
}