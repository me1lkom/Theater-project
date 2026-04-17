import { useState, useEffect } from 'react';
import { PastSessions } from '../api/index';

export function usePastSessions(play_id) {
    const [data, setSessions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!play_id) return;
        const fetchSessions = async() => {
            try {
                // console.log('Запрос к PastSessions начат')
                setLoading(true);
                const data = await PastSessions(play_id);
                setSessions(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка загрузки сессий.');
            } finally {
                setLoading(false);
            }
        }

        fetchSessions();
    }, [play_id])

    // console.log('Запрос к PastSessions выполнен', {data})
    return { data, loading, error };
}