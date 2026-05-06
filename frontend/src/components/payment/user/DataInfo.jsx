import { useSession } from '../../../hooks/useSession';
import { usePlay } from '../../../hooks/usePlay';
import { useSeats } from '../../../hooks/useSeats';
import UserForm from './UserForm';
import { useBuyTicket } from '../../../hooks/useBuyTicket';
import { useNavigate } from 'react-router-dom';
import styles from './DataInfo.module.css';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


export default function DataInfo({ sessionId, selectedSeats, price }) {
    const { session, loading, error } = useSession(sessionId);
    const { play, loading: playLoading, error: playError } = usePlay(session?.play);
    const { seats } = useSeats();
    const { buyTickets } = useBuyTicket();
    const navigate = useNavigate();

    const MySwal = withReactContent(Swal)

    const neededSeats = seats?.filter(seat => selectedSeats.includes(seat.seat_id));

    console.log(`цена билетов ${price}`)

    if (!session || !play) {
        return (
            <div>
                <div>Данные о спектакле не найдены</div>
                <button onClick={() => navigate('/')}>Вернуться на главную</button>
            </div>
        );
    }



    // const countTickets = selectedSeats.length;

    const handleFormSubmit = async ({ user_data }) => {
        console.log(`user_data: ${user_data}`);

        const payload = {
            session_id: Number(sessionId),
            seat_ids: selectedSeats.map(id => Number(id)),
        };
        
        console.log('Отправка на сервер:', payload.user_id, payload.session_id, payload.seat_ids);

        const result = await buyTickets(payload.session_id, payload.seat_ids);

        if (result.success) {

            MySwal.fire({
                icon: "success",
                title: <p>Билеты успешно куплены</p>,
                showConfirmButton: false,
                timer: 1000
            })

            navigate('/profile')

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

            <div className={styles.price}>К Оплате: {price}</div>

            <UserForm onSubmit={handleFormSubmit} />
        </div>
    )
}