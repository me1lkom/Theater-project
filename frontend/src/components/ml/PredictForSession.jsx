import { useState } from 'react';
import { useGetPredictForSession } from '../../hooks/useGetPredictForSession';
import GraphPredict from './GraphPredict';
import styles from './PredictForSession.module.css';
import { useSessions } from "../../hooks/useSessions";
import PastSessionsStatistic from './PastSessionsStatistic';
import { useHistoryPredictions } from '../../hooks/useHistoryPredictions';

export default function PredictForSession() {
    const { predict, prediction, loading, error } = useGetPredictForSession();
    const { refetch } = useHistoryPredictions();
    const { sessions } = useSessions();
    const [selectedSession, setSelectedSession] = useState(null);

    const handlePredict = async () => {
        if (!selectedSession) return;
        await prediction(selectedSession.session_id);
        refetch();
    }

    return (
        <div className={styles.PredictForSession}>
            <div className={styles.leftColumn}>
                <div className={styles.sessionsList}>
                    {sessions?.map(session => (
                        <div
                            key={session.session_id}
                            className={`${styles.sessionCard} ${selectedSession?.session_id === session.session_id ? styles.selected : ''}`}
                            onClick={() => setSelectedSession(session)}
                        >
                            <div className={styles.sessionTitle}>{session.play_title}</div>
                            <div className={styles.sessionDateTime}>
                                {session.date} {session.time}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className={styles.predictButton}
                    onClick={handlePredict}
                    disabled={!selectedSession || loading}
                >
                    {loading ? 'Загрузка...' : 'Прогноз'}
                </button>
            </div>

            <div className={styles.rightColumn}>
                {loading && <div>Загрузка прогноза...</div>}
                {error && <div className={styles.error}>Ошибка: {error}</div>}

                {predict && (
                    <>
                        <div className={styles.result}>
                            <h3>Результат прогноза:</h3>
                            <p>ID сеанса: {predict.session_id}</p>
                            <p>Спектакль: {predict.play}</p>
                            <p>Дата: {predict.date}</p>
                            <p>Время: {predict.time}</p>
                            <p>Прогноз продаж: {predict.prediction?.predicted_tickets} / 300</p>
                            {/* <p>Заполняемость: {predict.prediction?.predicted_occupancy}%</p> */}
                        </div>
                        <GraphPredict dataSet={predict} />

                        <PastSessionsStatistic play_id={predict.play_id} />
                    </>
                )}
            </div>
        </div>
    )
}