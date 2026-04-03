import { useAvailableSeats } from '../../../hooks/useAvailableSeats';
import { useSeats } from '../../../hooks/useSeats';

export default function PlayAvailableSeats({ sessionId }) {
    const { seats, loading, error } = useSeats();
    const { availableSeats } = useAvailableSeats(sessionId);

    if (!sessionId) return (
        <div className="seatsInfo">
            <div>Сначала выберите дату и время, чтобы увидеть занятые места</div>
            <pre>{JSON.stringify(seats, null, 2)}</pre>
        </div>
    )


    if (loading) return <div>Загрузка схемы зала...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className="seatsInfo">
            {/* Здесь будет схема мест, как отдельнй компонент скорее всего */}
            <pre>{JSON.stringify(seats, null, 2)}</pre>
            <pre>{JSON.stringify(availableSeats, null, 2)}</pre>
        </div>
    );
}