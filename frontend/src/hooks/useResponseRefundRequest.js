import { useState } from 'react';
import { responseRefundRequest } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function useResponseRefundRequest() {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);


    const sendResponse = async (request_id, response) => {
        try {
            if (response === 'approve') {
                const comment = 'Одобрено'
                await responseRefundRequest(request_id, response, comment)
            } else if (response === 'reject') {
                const comment = 'Не одобрено'
                await responseRefundRequest(request_id, response, comment)
                console.log(`Отпрвелно решение ${request_id} ${response} ${comment}`)
            }

            setLoading(true);
            setError(null);
            return { success: true }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return { success: false }

        } finally {
            setLoading(false);
        }
    }



    return { sendResponse, loading, error };

}