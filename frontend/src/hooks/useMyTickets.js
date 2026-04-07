import { useState, useEffect } from 'react';
import { getMyTickets } from '../api/index';

export function useMyTickets() {
    const [tickets, setTickets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await getMyTickets();
            setTickets(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return { tickets, loading, error, refetch: fetchTickets }
}