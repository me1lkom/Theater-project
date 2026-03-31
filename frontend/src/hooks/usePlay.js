import { useState, useEffect } from 'react';
import { getPlayById, getSessionsByPlay } from '../api/index';

export function usePlay(playId) {
    const [play, setPlay] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!playId) return;

        const fetchPlay = async () => {
            try {
                setLoading(true);

                const [playData, sessionData] = await Promise.all([
                    getPlayById(playId),
                    getSessionsByPlay(playId)
                ]);
                
                setPlay(playData);
                setSessions(sessionData);
                setError(null);
            } catch (err) {
                setError(err.message || 'Ошибка загрузки спектакля');
            } finally {
                setLoading(false);
            }
        };

        fetchPlay();
    }, [playId]);

    return { play, sessions, loading, error };
}