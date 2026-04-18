import { useState, useEffect } from 'react';
import { getLogs, getLogByFilter } from '../api/index';

export function useLogs(limit) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            console.log(limit);
            const data = filter === 'all' 
                ? await getLogs(limit) 
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
    }, [filter, limit]);

    return { logs, loading, error, filter, setFilter, refetch: fetchLogs };
}