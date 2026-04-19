import { useState } from "react";
import { getPredictForSession } from "../api/index";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetPredictForSession() {
    const [predict, setPredict] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const prediction = async (session_id) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getPredictForSession(session_id);
            setPredict(data);
            return { success: true, data: data };
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }

    return { predict, prediction, loading, error };
}