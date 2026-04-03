import { useState, useEffect } from "react";
import { getAvailableSeats } from "../api/index";

export function useAvailableSeats(sessionId) {
    const [availableSeats, setAvailableSeats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sessionId) {
            setLoading(false);
            return;
        }

        const fetchPlay = async () => {
            try {
                setLoading(true);
                const data = await getAvailableSeats(sessionId);
                setAvailableSeats(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка загрузки спектаклся по id.');
            } finally {
                setLoading(false);
            }
        }
        fetchPlay();

    }, [sessionId]);

    return { availableSeats, loading, error };
}