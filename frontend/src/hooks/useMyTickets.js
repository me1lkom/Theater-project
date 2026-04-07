import { useState, useEffect } from 'react';
import { getMyTickets } from '../api/index';

export function useMyTickets() {
    const [tickets, setTickets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try{
                setLoading(true);
                const response = await getMyTickets();
                setTickets(response);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка загрузки билетов.')
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, [])
    return { tickets, loading, error }
}