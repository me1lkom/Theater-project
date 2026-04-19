import { useState, useEffect } from 'react';
import { PastSessions } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function usePastSessions(play_id) {
    const [data, setSessions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!play_id) return;
        const fetchSessions = async () => {
            try {
                // console.log('Запрос к PastSessions начат')
                setLoading(true);
                const data = await PastSessions(play_id);
                setSessions(data);
                setError(null);
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }

        fetchSessions();
    }, [play_id])

    // console.log('Запрос к PastSessions выполнен', {data})
    return { data, loading, error };
}