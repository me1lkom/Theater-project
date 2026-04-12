import { useState } from 'react';
import { useGetPredictForSession } from '../../hooks/useGetPredictForSession';
import  GraphPredict  from './GraphPredict';


export default function PredictForSession() {
    const [sessionId, setSessionId] = useState('');
    const { predict, prediction, loading, error } = useGetPredictForSession();
    


    const handlePredict = async (e) => {
        e.preventDefault();
        if (!sessionId) return;
        await prediction(sessionId);
    }



    return (

        <div>
            <form onSubmit={handlePredict}>
                <input type='number' placeholder='session_id' value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
                <button type='submit'> {loading ? 'Загрузка...' : 'Прогноз'}</button>
            </form>

            {loading && <div>Загрузка прогноза...</div>}

            {error && <div>Ошибка: {error}</div>}

            {predict && (
                <div>
                    <h3>Результат прогноза:</h3>
                    <p>Успех: {predict.success ? 'Да' : 'Нет'}</p>
                    <p>ID сеанса: {predict.session_id}</p>
                    <p>Спектакль: {predict.play?.title}</p>
                    <p>Дата: {predict.date}</p>
                    <p>Время: {predict.time}</p>
                    <p>Прогноз продаж: {predict.prediction?.predicted_tickets} / {predict.prediction?.total_seats}</p>
                    <p>Заполняемость: {predict.prediction?.predicted_occupancy}%</p>
                </div>
            )}

            <GraphPredict dataSet={predict} />
        </div>
    )
}