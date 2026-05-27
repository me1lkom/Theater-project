import { useState, useEffect } from 'react';
import { useSeats } from '../../../../hooks/useSeats';
import { useAvailableSeats } from '../../../../hooks/useAvailableSeats';
import { useAddToBasket } from '../../../../hooks/useAddToBasket';
import useAuthStore from '../../../../store/useAuthStore';
import BookingPanel from './BookingPanel';
import SeatLegend from './SeatLegend';
import SeatMap from './SeatMap';
import styles from './PlayAvailableSeatsV2.module.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';

export default function PlayAvailableSeats({ sessionId }) {
    console.log(sessionId);
    const { seats, loading, error } = useSeats();
    const { availableSeats } = useAvailableSeats(sessionId);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [price, setPrice] = useState(0);
    const [sectorPrices, setSectorPrices] = useState({});
    const { addTicketToBasket } = useAddToBasket();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const MySwal = withReactContent(Swal);

    useEffect(() => {
        if (availableSeats?.seats) {
            const prices = {};
            availableSeats.seats.forEach(seat => {
                if (!prices[seat.sector]) {
                    prices[seat.sector] = seat.price;
                }
            });
            setSectorPrices(prices);
        }
    }, [availableSeats]);

    const handleSeatToggle = (seatId, seatPrice) => {
        setSelectedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId]
        );
        setPrice(prev =>
            selectedSeats.includes(seatId)
                ? prev - seatPrice
                : prev + seatPrice
        );
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            MySwal.fire({
                icon: 'error',
                title: '<p>Необходимо войти в аккаунт</p>',
                showConfirmButton: true,
                showDenyButton: true,
                denyButtonText: 'Ок',
                confirmButtonText: 'Войти',
            }).then(result => {
                if (result.isConfirmed) navigate('/auth');
            });
            return;
        }

        if (selectedSeats.length === 0) {
            MySwal.fire({
                icon: 'error',
                title: '<p>Выберите места</p>',
                showConfirmButton: false,
                timer: 1000,
            });
            return;
        }

        if (selectedSeats.length > 5) {
            MySwal.fire({
                icon: 'error',
                title: '<p>Нельзя забронировать более 5 мест за раз</p>',
                showConfirmButton: false,
                timer: 1000,
            });
            return;
        }

        const result = await addTicketToBasket(sessionId, selectedSeats);

        if (result.success) {
            navigate('/payment', {
                state: {
                    sessionId: sessionId,
                    selectedSeats: selectedSeats,
                    price: price,
                },
            });
        } else {
            MySwal.fire({
                icon: 'error',
                title: '<p>Ошибка бронирования</p>',
                text: result.error,
                showConfirmButton: true,
            });
        }
    };

    if (!sessionId) {
        return <div className={styles.message}>Сначала выберите дату и время, чтобы увидеть занятые места</div>;
    }

    if (loading) return <div>Загрузка схемы зала...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.seatsInfo}>
            <SeatLegend sectorPrices={sectorPrices} />

            <SeatMap
                seats={seats}
                availableSeats={availableSeats}
                selectedSeats={selectedSeats}
                onSeatToggle={handleSeatToggle}
                sessionId={sessionId}
                sectorPrices={sectorPrices}
            />
            <BookingPanel
                selectedSeatsCount={selectedSeats.length}
                onBooking={handleBooking}
                price={price}
            />
        </div>
    );
}