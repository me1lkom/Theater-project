import { useState, useEffect } from 'react';
import { getMLInfo } from '../api/index';

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
                setError(err.message || 'Ошибка загрузки данных.');
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, []);

    return { info, loading, error };
}