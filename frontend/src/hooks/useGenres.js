import { useState, useEffect } from 'react';
import { getGenres } from '../api/index';

export function useGenres() {
    const [genres, setGenres] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                setLoading(true);
                const data = await getGenres();
                setGenres(data);
                setError(null);
            } catch (err) {
                setError(err.massage || 'Ошибка загрузки жанров.')
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, [])

    return { genres, loading, error };
}