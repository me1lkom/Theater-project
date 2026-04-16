import { useState, useEffect } from 'react';
import { getActorsBySession } from '../api/index';

export function useGetActorsBySession(session_id) {
    const [data, setActors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActors = async () => {
            try {
                setLoading(true);
                const response = await getActorsBySession(session_id);
                setActors(response);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка загрузки данных.');
            } finally {
                setLoading(false);
            }

        };
        fetchActors();
    }, [session_id])

    return { data, loading, error }
}