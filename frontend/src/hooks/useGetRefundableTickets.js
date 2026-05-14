import { getRefundableTickets } from '../api/index';
import { useState } from "react";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetRefundableTickets() {
    const [tickets, setTickets] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTickets = async (filter) => {
        try {
            setLoading(true);
            const data = await getRefundableTickets(filter);
            setTickets(data);
            setError(null);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return { tickets, loading, error, fetchTickets }
}