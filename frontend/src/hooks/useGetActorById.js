
import { useState, useEffect } from 'react';
import { getActorById } from '../api/index';

export function useGetActorById(actor_id) {
    const [actor, setActors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchActors = async () => {
            try {
                setLoading(true);
                const response = await getActorById(actor_id);
                setActors(response);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка при получении актеров.')
            } finally {
                setLoading(false);
            }
        }

        fetchActors();
    }, [actor_id])

    return { actor, loading, error }
}