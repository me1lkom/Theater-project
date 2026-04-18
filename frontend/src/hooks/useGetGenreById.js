
import { useState, useEffect } from 'react';
import { getGenreById } from '../api/index';

export function useGetGenreById(genre_id) {
    const [genre, setGenre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchGenre = async () => {
            try {
                setLoading(true);
                const response = await getGenreById(genre_id);
                setGenre(response);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка при получении жанра.')
            } finally {
                setLoading(false);
            }
        }

        fetchGenre();
    }, [genre_id])

    return { genre, loading, error }
}