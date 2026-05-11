import { useState } from 'react';
import { getTicketPDF } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetTicketPDF(ticket_id) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const downloadTicket = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getTicketPDF(ticket_id);
            
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ticket.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { downloadTicket, loading, error };
}