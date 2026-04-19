import { useState, useEffect } from "react";
import { getSeats } from "../api/index";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useSeats() {
    const [seats, setSeats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlay = async () => {
            try {
                setLoading(true);
                const data = await getSeats();
                setSeats(data);
                setError(null);
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchPlay();

    }, []);

    return { seats, loading, error };
}