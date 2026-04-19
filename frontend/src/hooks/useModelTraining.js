import { useState } from 'react';
import { modelTraining } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useModelTraining() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const train = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await modelTraining();
            setData(response);
            console.log(`MLINFTraining, ответ ${response}`)
            return { success: true, data: response };
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { train, data, loading, error, };
}