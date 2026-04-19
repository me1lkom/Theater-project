import { postReturnTicket } from "../api/index";
import { useState } from 'react';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useReturnTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const returnTicket = async (ticket_id, reason) => {
        setLoading(true);
        setError(null);

        try {
            await postReturnTicket(ticket_id, { reason });
            setLoading(false);
            setError(null);
            return { success: true };
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }


    return { returnTicket, loading, error };
}