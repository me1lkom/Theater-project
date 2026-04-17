import { useState, useEffect } from 'react';
import { useLogs } from '../../hooks/useLogs';
import { useLogTypes } from '../../hooks/useLogTypes';
import styles from "./LoggingPage.module.css";

export default function LoggingPage() {
    const [limit, setLimit] = useState(50);
    const { logs, loading, error, filter, setFilter, refetch } = useLogs(limit);
    const { logTypes, loading: typesLoading } = useLogTypes();
    const [autoRefresh, setAutoRefresh] = useState(false);

    const uniqueLogTypes = logTypes ? [...new Set(logTypes)] : [];



    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            refetch();
        }, 5000);

        return () => clearInterval(interval);
    }, [autoRefresh, refetch]);

    const getTypeClass = (actionType) => {
        if (actionType.startsWith('DELETE')) return styles.typeDelete;
        if (actionType.startsWith('CREATE')) return styles.typeCreate;
        if (actionType.startsWith('UPDATE')) return styles.typeUpdate;
        if (actionType.startsWith('BUY')) return styles.typeBuy;
        if (actionType.startsWith('SESSION_PREDICT')) return styles.typePredict;
        if (actionType.startsWith('ADD')) return styles.typeBuy;
        return '';
    };

    const handleMoreLogs = () => {
        setLimit(prev => prev + 50);  // увеличиваем лимит на 50
    };



    return (
        <div className={styles.loggingContainer}>
            <h2 className={styles.title}>Журнал событий</h2>

            <div className={styles.controls}>
                <select
                    className={styles.select}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">Все типы</option>
                    {!typesLoading && uniqueLogTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <button className={styles.refreshButton} onClick={refetch}>
                    Обновить
                </button>

                <button
                    className={`${styles.autoRefreshButton} ${autoRefresh ? styles.active : ''}`}
                    onClick={() => setAutoRefresh(prev => !prev)}
                >
                    Авто {autoRefresh ? 'ON' : 'OFF'}
                </button>
            </div>

            {loading && <div className={styles.loading}>Загрузка логов...</div>}
            {error && <div className={styles.error}>Ошибка: {error}</div>}

            {!loading && !error && (
                <>
                    <table className={styles.logTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Пользователь</th>
                                <th>Тип</th>
                                <th>Описание</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.log_id}>
                                    <td>{log.log_id}</td>
                                    <td>{log.user}</td>
                                    <td className={getTypeClass(log.action_type)}>
                                        {log.action_type}
                                    </td>
                                    <td>{log.description}</td>
                                    <td>{new Date(log.action_date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length >= limit && (
                        <button
                            className={styles.moreButton}
                            onClick={handleMoreLogs}
                        >
                            Показать ещё (+50)
                        </button>
                    )}
                </>
            )}

            {logs.length === 0 && !loading && !error && (
                <div className={styles.empty}>Логов не найдено</div>
            )}
        </div>
    );
}