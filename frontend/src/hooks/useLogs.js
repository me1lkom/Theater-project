import { useState, useEffect } from 'react';
import { getLogs, getLogByFilter } from '../api/index';

export function useLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    // Функция загрузки логов
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = filter === 'all' 
                ? await getLogs() 
                : await getLogByFilter(filter);
            setLogs(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Ошибка загрузки логов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    return { logs, loading, error, filter, setFilter, refetch: fetchLogs };
}