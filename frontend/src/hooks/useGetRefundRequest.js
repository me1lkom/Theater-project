import { useState, useEffect } from "react";
import { getRefundRequest } from "../api/index";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetRefundRequest() {
    const [requests, setRequests] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const data = await getRefundRequest();
            setRequests(data);
            setError(null);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRequest();
    }, []);

    return { requests, loading, error, refetch: fetchRequest };
}