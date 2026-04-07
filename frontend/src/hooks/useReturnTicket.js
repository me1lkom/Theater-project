import { postReturnTicket } from "../api/index";
import { useState } from 'react';

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
            setError(err.message || 'Ошибка возврата билета.');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }


    return { returnTicket, loading, error };
}