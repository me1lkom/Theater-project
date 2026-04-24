import { useState, useEffect } from "react";
import { getMe } from "../api/index";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useGetMe() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMe = async () => {
        try {
            setLoading(true);
            const response = await getMe();
            setMe(response);
            setError(null);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMe();
    }, [])

    return { me, loading, error, refetch: fetchMe };
}

