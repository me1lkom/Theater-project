import { useHistoryPredictions } from '../../hooks/useHistoryPredictions';
import styles from './HistoryPredictions.module.css';

export default function HistoryPredictions() {
    const { data, loading, error } = useHistoryPredictions();

    let historeData = data?.results;

    if (loading) return <div>Загрузка...</div>
    if (error) return <div>Ошибка: {error}.</div>

    return (
        <div className={styles.HistoryPredictions}>
            <h3 className={styles.historyTitle}>История прогнозов</h3>
            <table className={styles.historyTable}>
                <thead>
                    <tr>
                        <th>ID прогноза</th>
                        <th>ID сеанса</th>
                        <th>Дата - время</th>
                        <th>Название спектакля</th>
                        <th>Прогноз</th>
                        <th>Дата прогноза</th>
                    </tr>
                </thead>
                <tbody>
                    {historeData?.map(prediction => {
                        return (
                            <tr key={prediction.prediction_id}>
                                <td>{prediction.prediction_id}</td>
                                <td>{prediction.session.id}</td>
                                <td>{prediction.session.date} - {prediction.session.time}</td>
                                <td>{prediction.play.title}</td>
                                <td>{prediction.prediction.predicted_tickets}/300</td>
                                <td>{prediction.prediction.prediction_date}</td>
                            </tr>

                        )

                    })}
                </tbody>
            </table>
        </div>
    )
}