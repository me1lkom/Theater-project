import { useState, useEffect } from "react";
import { getMe } from "../api/index"; 

export function useGetMe() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                setLoading(true);
                const response = await getMe();
                setMe(response);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка получение данных о себе');
            } finally {
                setLoading(false);
            }
        }
        fetchMe();
    }, [])

    return { me, loading, error };
}

// хочется поставить зависимость от чего-то, для смены данных