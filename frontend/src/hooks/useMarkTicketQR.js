import { useState } from "react";
import { MarkTicketQR } from "../api/index";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useMarkTicketQR() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const response = async (ticket_id) => {
        try {
            setLoading(true);
            await MarkTicketQR(ticket_id);
            setError(null);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return { response, loading, error };
}