import { useState, useEffect } from "react";
import { getAvailableSeats } from "../api/index";
import { getErrorMessage } from '../utils/getErrorMessage';

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
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchPlay();

    }, [sessionId]);

    return { availableSeats, loading, error };
}