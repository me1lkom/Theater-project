import { useState } from 'react';
import { getBulkTicketPDF } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetBulkTicketPDF() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const downloadTickets = async (payment_id) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getBulkTicketPDF(payment_id);
            
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tickets.zip');
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

    return { downloadTickets, loading, error };
}