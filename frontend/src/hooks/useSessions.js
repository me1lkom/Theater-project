import { useState, useEffect } from 'react';
import { getSessions } from '../api/index';

export function useSessions() {
    const [sessions, setSessions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                const data = await getSessions();
                setSessions(data);
                setError(null);
            } catch (err) {
                setError(err.massage || 'Ошибка загрузки сессий');
            } finally {
                setLoading(false);
            }
        }
        fetchSessions();
    }, [])

    return { sessions, loading, error }
}