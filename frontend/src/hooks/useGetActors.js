import { useState, useEffect } from 'react';
import { getActors } from '../api/index';

export function useGetActors() {
    const [actors, setActors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActors = async () => {
        try {
            setLoading(true);
            const response = await getActors();
            setActors(response);
            setError(null);
        } catch (err) {
            setError(err.message || 'Ошибка при получении актеров.')
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchActors();
    }, [])

    return { actors, loading, error, refetch: fetchActors }
}