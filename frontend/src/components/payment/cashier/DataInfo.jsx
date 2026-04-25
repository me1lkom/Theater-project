import { useSession } from '../../../hooks/useSession';
import { usePlay } from '../../../hooks/usePlay';
import { useSeats } from '../../../hooks/useSeats';
import UserForm from './UserForm';
import { useBuyTicketCashier } from '../../../hooks/useBuyTicketCashier';
import { useBuyTicket } from '../../../hooks/useBuyTicket';
import { useNavigate } from 'react-router-dom';
import styles from './DataInfo.module.css';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


export default function DataInfo({ sessionId, selectedSeats }) {
    const { session, loading, error } = useSession(sessionId);
    const { play, loading: playLoading, error: playError } = usePlay(session?.play);
    const { seats } = useSeats();
    const { buyTickets } = useBuyTicketCashier();
    const { buyTickets: buyTicketsOnCashier } = useBuyTicket();
    const navigate = useNavigate();

    const MySwal = withReactContent(Swal)

    const neededSeats = seats?.filter(seat => selectedSeats.includes(seat.seat_id));


    if (!session || !play) {
        return (
            <div>
                <div>Данные о спектакле не найдены</div>
                <button onClick={() => navigate('/')}>Вернуться на главную</button>
            </div>
        );
    }



    const countTickets = selectedSeats.length;

    const handleByOnCashier = async () => {

        const payload = {
            session_id: Number(sessionId),
            seat_ids: selectedSeats.map(id => Number(id)),
        };

        console.log('Отправка на сервер:', payload.session_id, payload.seat_ids);

        const result = await buyTicketsOnCashier(payload.session_id, payload.seat_ids);

        if (result.success) {

            MySwal.fire({
                icon: "success",
                title: <p>Билеты успешно куплены</p>,
                showConfirmButton: false,
                timer: 1000
            })

            navigate('/cashier')

        } else {
            alert(`Ошибка: ${result.error}`);
        }
    }

    const handleFormSubmit = async ({ user_data }) => {
        console.log(`user_data: ${user_data}`);

        const payload = {
            session_id: Number(sessionId),
            seat_ids: selectedSeats.map(id => Number(id)),
            phone: user_data.phone
        };

        console.log('Отправка на сервер:', payload.phone, payload.session_id, payload.seat_ids);

        const result = await buyTickets(payload.session_id, payload.seat_ids, payload.phone);

        if (result.success) {

            MySwal.fire({
                icon: "success",
                title: <p>Билеты успешно куплены</p>,
                showConfirmButton: false,
                timer: 1000
            })

            navigate('/cashier-payment')

        } else {
            alert(`Ошибка: ${result.error}`);
        }
    };

    const hours = Math.floor(play.duration / 60);
    let minutes = play.duration % 60;

    if (minutes == 0) {
        minutes = "00";
    }

    const reversed = session.date?.split('-').reverse().join('-');



    if (loading || playLoading) return <div>Загрузка...</div>;
    if (error || playError) return <div>Ошибка: {error}</div>;


    return (
        <div className={styles.DataInfo}>
            <div className={styles.title}>Название: {session.play_title}</div>
            <div className={styles.date}>Дата: {reversed}</div>
            <div className={styles.TimeDuration}>Время начала и длительность: {session.time} + {hours}ч {minutes}мин</div>
            <div className={styles.seats}>Места: {neededSeats?.map((seat) => (

                <p key={seat.seat_id} className={styles.seat}>{seat.sector_name}: ряд {seat.row_number} / место {seat.seat_number}</p>

            ))}
            </div>

            <div className={styles.price}>К Оплате: {countTickets * play.price}</div>

            <UserForm onSubmit={handleFormSubmit} OnCashier={handleByOnCashier} />
        </div>
    )
}