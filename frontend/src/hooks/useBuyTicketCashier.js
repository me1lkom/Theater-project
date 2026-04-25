import { buyTicketCashier } from "../api/index";
import { useState } from "react";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useBuyTicketCashier() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const buyTickets = async (session_id, seat_ids, phone) => {
        setLoading(true);
        setError(null);

        try {
            await buyTicketCashier(session_id, seat_ids, phone);
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

    return { buyTickets, loading, error };
}