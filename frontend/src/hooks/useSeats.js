import { useState, useEffect } from 'react';
import { getAvailableSeats } from '../api/index';

export function useSeats(sessionId) {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sessionId) return;

        const fetchSeats = async () => {
            try {
                setLoading(true);
                const data = await getAvailableSeats();
                setSeats(data);
                setError(null)
            } catch (err) {
                setError(err.message || 'Ошибка загрузки схемы зала');
            } finally {
                setLoading(false);
            }
        }
        fetchSeats();
    }, [sessionId]);

    // Группировка мест 
    const seatsByRow = seats.reduce((acc, seat) => {
        const row = seat.row_number;
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    return { seats, seatsByRow, loading, error };
};