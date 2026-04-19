import { useState, useEffect } from 'react';
import { getActors } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

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
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchActors();
    }, [])

    return { actors, loading, error, refetch: fetchActors }
}