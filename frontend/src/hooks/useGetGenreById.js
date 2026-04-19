
import { useState, useEffect } from 'react';
import { getGenreById } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

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
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }

        fetchGenre();
    }, [genre_id])

    return { genre, loading, error }
}