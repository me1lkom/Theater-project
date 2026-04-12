import { useState, useEffect } from "react";
import { getPlayById } from "../api/index";

export function usePlay(id) {
    const [play, setPlay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        const fetchPlay = async () => {
            try {
                setLoading(true);
                const data = await getPlayById(id);
                setPlay(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка загрузки спектаклся по id.');
            } finally {
                setLoading(false);
            }
        }
        fetchPlay();

    }, [id]);

    return { play, loading, error };
}