import { useState, useEffect } from "react";
import { QRverification } from "../api/index";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useQRverification(ticket_id) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setLoading(true);
                const data = await QRverification(ticket_id);
                setStatus(data);
                setError(null);
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchStatus();
    }, [ticket_id]);

    return { status, loading, error };
}