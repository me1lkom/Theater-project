import { useState, useEffect } from 'react';
import { getSessionById } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useSession(id) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                setLoading(true);
                const data = await getSessionById(id);
                setSession(data);
                setError(null);
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }

        fetchSession();
    }, [id]);

    return { session, loading, error }
}