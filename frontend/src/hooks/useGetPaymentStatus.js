import { useState, useEffect } from "react";
import { getPaymentStatus } from "../api/index";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetPaymentStatus(payment_id) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    console.log(`Вход в запрос проверки оплаты, ${payment_id}`);

    useEffect(() => {
        if (!payment_id) return;

        let isMounted = true;
        let intervalId = null;

        const checkStatus = async () => {
            try {
                const response = await getPaymentStatus(payment_id);
                // const data = response?.data;

                console.log(`запрос отправлен ${response}`);

                if (!isMounted) return;

                if (response.status === 'succeeded') {
                    setStatus('succeeded');
                    setLoading(false);
                    if (intervalId) clearInterval(intervalId);
                    return;
                } else if (response.status === 'fail') {
                    setStatus('fail');
                    setLoading(false);
                    if (intervalId) clearInterval(intervalId);
                    return;
                }

                setLoading(true);

            } catch (err) {
                if (isMounted) {
                    const errorMessage = getErrorMessage(err);
                    setError(errorMessage);
                }
            }
        }

        checkStatus();
        intervalId = setInterval(checkStatus, 5000);

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        }
    }, [payment_id])

    return { status, loading, error };
}