import { useSession } from '../../hooks/useSession';
import { usePlay } from '../../hooks/usePlay';
import UserForm from './UserForm';
import { useBuyTicket } from '../../hooks/useBuyTicket';
import { useNavigate } from 'react-router-dom';

export default function DataInfo({ sessionId, selectedSeats }) {
    const { session, loading, error } = useSession(sessionId);
    const { play, loading: playLoading, error: playError } = usePlay(session?.play);
    const { buyTickets } = useBuyTicket();
    const navigate = useNavigate();

    if (!session || !play) {
        return (
            <div>
                <div>Данные о спектакле не найдены</div>
                <button onClick={() => navigate('/')}>Вернуться на главную</button>
            </div>
        );
    }



    const countTickets = selectedSeats.length;

    const handleFormSubmit = async ({ user_data }) => {
        console.log(`user_data: ${user_data}`);

        const payload = {
            session_id: Number(sessionId),
            seat_ids: selectedSeats.map(id => Number(id))
        };

        console.log('Отправка на сервер:', payload.user_id, payload.session_id, payload.seat_ids);

        const result = await buyTickets(payload.session_id, payload.seat_ids);

        if (result.success) {
            alert('Билеты куплены!');
            navigate('/profile')

        } else {
            alert(`Ошибка: ${result.error}`);
        }
    };

    if (loading || playLoading) return <div>Загрузка...</div>;
    if (error || playError) return <div>Ошибка: {error}</div>;


    return (
        <div>
            <div>Название: {session.play_title}</div>
            <div>Дата: {session.date}</div>
            <div>Время начала и длительность: {session.time} + {play.duration}</div>
            <div>Места: {selectedSeats.map((seat) => (
                <p key={seat}>{seat}</p>
            ))}</div>

            <div>К Оплате: {countTickets * play.price}</div>

            <UserForm onSubmit={handleFormSubmit} />
        </div>
    )
}