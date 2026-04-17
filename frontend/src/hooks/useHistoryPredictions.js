import { useState, useEffect } from "react";
import { HistoryPredictions } from "../api/index";

export function useHistoryPredictions() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchHistory = async () => {
        try {
            console.log('Запрос направлен');
            setLoading(true);
            const data = await HistoryPredictions();
            setData(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Ошибка загрузки спектаклся по id.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHistory();
    }, []);

    return { data, loading, error, refetch: fetchHistory };
}