import { useState, useEffect } from 'react';
import { getPlays } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function usePlays() {
    const [plays, setPlays] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPlays = async () => {
        try {
            setLoading(true);
            const data = await getPlays();
            setPlays(data);
            setError(null);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlays();
    }, []);

    return { plays, loading, error, refetch: fetchPlays };
}