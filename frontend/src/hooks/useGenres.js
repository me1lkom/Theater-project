import { useState, useEffect } from 'react';
import { getGenres } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGenres() {
    const [genres, setGenres] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const data = await getGenres();
            setGenres(data);
            setError(null);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGenres();
    }, [])

    return { genres, loading, error, refetch: fetchGenres };
}