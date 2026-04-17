import { useState, useEffect } from 'react';
import { getPlays } from '../api/index';

export function usePlays() {
    const [plays, setPlays] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Выносим функцию загрузки наружу
    const fetchPlays = async () => {
        try {
            setLoading(true);
            const data = await getPlays();
            setPlays(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Ошибка загрузки данных.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlays();
    }, []);

    return { plays, loading, error, refetch: fetchPlays };
}