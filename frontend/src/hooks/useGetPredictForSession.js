import { useState } from "react";
import { getPredictForSession } from "../api/index";

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
            setError(err.message || 'Ошибка загрузки прогноза.');
        } finally {
            setLoading(false);
        }
    }

    return { predict, prediction, loading, error };
}