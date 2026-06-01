import { useState, useEffect } from 'react';
import { useSeats } from '../../../hooks/useSeats'

import { useAvailableSeats } from '../../../hooks/useAvailableSeats';
import useAuthStore from '../../../store/useAuthStore';
import BookingPanel from './BookingPanel';
import SeatLegend from './SeatLegend';
import SeatMap from './SeatMap';
import styles from './PlayAvailableSeatsV2.module.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';

export default function PlayAvailableSeatsV2({ sessionId }) {
    console.log(sessionId);
    const { seats, loading, error } = useSeats();
    const { availableSeats } = useAvailableSeats(sessionId);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [price, setPrice] = useState(0);
    const [sectorPrices, setSectorPrices] = useState({});
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

        navigate('/cashier-payment', {
            state: {
                sessionId: sessionId,
                selectedSeats: selectedSeats,
                price: price,
            },
        });
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