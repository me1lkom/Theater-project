import { useState, useEffect } from 'react';
import { getAllPanoramas } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetAllPanoramas() {
    const [panoramas, setGenres] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                setLoading(true);
                const data = await getAllPanoramas();
                setGenres(data);
                setError(null);
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, []);



    return { panoramas, loading, error };
}