import { useState, useEffect } from 'react';
import { getSessions } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useSessions() {
    const [sessions, setSessions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await getSessions();
            setSessions(data);
            setError(null);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {

        fetchSessions();
    }, [])

    return { sessions, loading, error, refetch: fetchSessions }
}