import { useAvailableSeats } from '../../../hooks/useAvailableSeats';
import { useSeats } from '../../../hooks/useSeats';
import { useAddToBasket } from '../../../hooks/useAddToBasket';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PlayAvailableSeats.module.css';
import useAuthStore from '../../../store/useAuthStore';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function PlayAvailableSeats({ sessionId }) {
    const { seats, loading, error } = useSeats();
    const { availableSeats } = useAvailableSeats(sessionId);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [price, setPrice] = useState(0);
    const { addTicketToBasket } = useAddToBasket();
    const [sectorPrices, setSectorPrices] = useState({});


    const { isAuthenticated } = useAuthStore();

    const svgRef = useRef(null);
    const initialized = useRef(false);
    const navigate = useNavigate();

    const MySwal = withReactContent(Swal)

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

    const resetSeats = () => {
        if (!svgRef.current) return;

        const svg = svgRef.current;
        const rectangles = svg.querySelectorAll('rect');

        rectangles.forEach(rect => {
            rect.classList.remove('seat', 'selected', 'taken');

            rect.removeAttribute('data-seat-id');
            rect.removeAttribute('data-sector');
            rect.removeAttribute('data-row');
            rect.removeAttribute('data-seat');

            rect.removeAttribute('fill');
            rect.removeAttribute('opacity');
            rect.style.fill = '';
            rect.style.opacity = '';

            rect.onclick = null;
        });

        const numbers = svg.querySelectorAll('.seat-number');
        numbers.forEach(num => num.remove());
    };

    const initSeatMap = () => {
        if (!seats || !availableSeats) return;
        if (!svgRef.current) return;

        const svg = svgRef.current;
        const rectangles = svg.querySelectorAll('rect');

        const seatRects = Array.from(rectangles).filter(rect => {
            const y = parseFloat(rect.getAttribute('y'));
            return y >= 154 && y <= 914 && rect.getAttribute('width') === '30';
        });

        console.log(`Найдено мест:', ${seatRects.length}`);
        console.log(availableSeats.seats);

        const freeSeatIds = new Set(availableSeats.seats.map(s => s.seat_id));

        seatRects.forEach((rect, index) => {
            const seatData = seats[index];
            if (!seatData) return;

            rect.setAttribute('data-seat-id', seatData.seat_id);
            rect.setAttribute('data-sector', seatData.sector_name);
            rect.setAttribute('data-row', seatData.row_number);
            rect.setAttribute('data-seat', seatData.seat_number);
            rect.classList.add('seat');

            if (!freeSeatIds.has(seatData.seat_id)) {
                rect.classList.add('taken');
                rect.setAttribute('fill', '#666');
                rect.setAttribute('opacity', '0.5');
                rect.setAttribute('cursor', 'default')

            } else {
                if (seatData.sector_name === 'Партер') rect.setAttribute('fill', '#2ecc71');
                else if (seatData.sector_name === 'Амфитеатр') rect.setAttribute('fill', '#3498db');
                else if (seatData.sector_name === 'Балкон') rect.setAttribute('fill', '#e67e22');
                rect.setAttribute('cursor', 'pointer')
                rect.removeAttribute('opacity');
            }

            if (!rect.parentNode.querySelector(`.seat-number-${seatData.seat_id}`)) {
                const x = parseFloat(rect.getAttribute('x'));
                const y = parseFloat(rect.getAttribute('y'));
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

                text.setAttribute('x', x + 15);
                text.setAttribute('y', y + 19);
                text.setAttribute('class', `seat-number seat-number-${seatData.seat_id}`);
                text.setAttribute('font-size', '8');
                text.setAttribute('fill', 'white');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('pointer-events', 'none');
                text.textContent = seatData.seat_number;
                rect.parentNode.appendChild(text);
            }

            rect.onclick = () => {


                const seatId = parseInt(rect.getAttribute('data-seat-id'));
                const isTaken = rect.classList.contains('taken');

                if (isTaken) {
                    MySwal.fire({
                        icon: "error",
                        title: <p>Это место занято</p>,
                        showConfirmButton: false,
                        timer: 1000,
                    });
                    return;
                }

                const isSelected = rect.classList.contains('selected');

                const priceSelectedSeat = availableSeats.seats?.find(seat => seat.seat_id === seatId).price || 5;
                console.log(priceSelectedSeat);

                if (isSelected) {
                    rect.classList.remove('selected');

                    const sector = rect.getAttribute('data-sector');
                    if (sector === 'Партер') rect.setAttribute('fill', '#2ecc71');
                    else if (sector === 'Амфитеатр') rect.setAttribute('fill', '#3498db');
                    else if (sector === 'Балкон') rect.setAttribute('fill', '#e67e22');
                    setSelectedSeats(prev => prev.filter(id => id !== seatId));
                    setPrice(prev => prev - priceSelectedSeat);

                } else {
                    console.log(selectedSeats.length)
                    rect.classList.add('selected');
                    rect.setAttribute('fill', '#f1c40f');
                    setSelectedSeats(prev => [...prev, seatId]);
                    setPrice(prev => prev + priceSelectedSeat);
                }
            };
        });
    };

    useEffect(() => {
        if (!sessionId) return;

        resetSeats();
        setSelectedSeats([]);
        setPrice(0);
        initialized.current = false;

    }, [sessionId]);

    useEffect(() => {
        if (!seats || !availableSeats) return;
        if (!svgRef.current) return;
        if (initialized.current) return;

        initSeatMap();
        initialized.current = true;

    }, [seats, availableSeats]);

    const handleBooking = async () => {
        if (!isAuthenticated) {
            MySwal.fire({
                icon: "error",
                title: <p>Необходимо войти в аккаунт</p>,
                showConfirmButton: true,
                showDenyButton: true,
                denyButtonText: `Ок`,
                confirmButtonText: `Войти`,
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/auth')
                }
            })
            return;
        }

        if (selectedSeats.length > 5) {
            MySwal.fire({
                icon: "error",
                title: <p>Выбрано слишком много мест</p>,
                showConfirmButton: false,
                timer: 1000,
            });
            return;
        }



        console.log(`Попытка отправить sessionId: ${sessionId}, seatIds: ${selectedSeats}, с итоговой ценой ${price}`);

        const result = await addTicketToBasket(sessionId, selectedSeats);

        if (result.success) {
            navigate('/payment', {
                state: {
                    sessionId: sessionId,
                    selectedSeats: selectedSeats,
                    price: price
                }
            });
        } else {
            alert(`Ошибка бронирования: ${result.error}`);
        }
    }


    if (!sessionId) return (
        <div className={styles.seatsInfo}>
            <div>Сначала выберите дату и время, чтобы увидеть занятые места</div>
        </div>
    )

    if (loading) return <div>Загрузка схемы зала...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.seatsInfo}>
            <div className={styles.svgContainer}>
                <svg
                    ref={svgRef}
                    width="800"
                    height="1000"
                    viewBox="0 0 800 1000"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ background: '#ffffff', borderRadius: 8 }}
                >
                    <g clipPath="url(#clip0_245_4)">
                        <rect width="800" height="1000" fill="#ffffff" />
                        <path d="M800 0C800 23.8695 757.857 46.7613 682.843 63.6396C607.828 80.5179 506.087 90 400 90C293.913 90 192.172 80.5179 117.157 63.6396C42.1428 46.7614 1.60186e-05 23.8695 0 1.52588e-05L400 0H800Z" fill="#6d6767" />

                        <rect x="11" y="154" width="30" height="30" />
                        <rect x="49" y="154" width="30" height="30" />
                        <rect x="87" y="154" width="30" height="30" />
                        <rect x="125" y="154" width="30" height="30" />
                        <rect x="163" y="154" width="30" height="30" />
                        <rect x="201" y="154" width="30" height="30" />
                        <rect x="239" y="154" width="30" height="30" />
                        <rect x="277" y="154" width="30" height="30" />
                        <rect x="315" y="154" width="30" height="30" />
                        <rect x="353" y="154" width="30" height="30" />
                        <rect x="420" y="154" width="30" height="30" />
                        <rect x="458" y="154" width="30" height="30" />
                        <rect x="496" y="154" width="30" height="30" />
                        <rect x="534" y="154" width="30" height="30" />
                        <rect x="572" y="154" width="30" height="30" />
                        <rect x="610" y="154" width="30" height="30" />
                        <rect x="648" y="154" width="30" height="30" />
                        <rect x="686" y="154" width="30" height="30" />
                        <rect x="724" y="154" width="30" height="30" />
                        <rect x="762" y="154" width="30" height="30" />
                        <rect x="11" y="198" width="30" height="30" />
                        <rect x="49" y="198" width="30" height="30" />
                        <rect x="87" y="198" width="30" height="30" />
                        <rect x="125" y="198" width="30" height="30" />
                        <rect x="163" y="198" width="30" height="30" />
                        <rect x="201" y="198" width="30" height="30" />
                        <rect x="239" y="198" width="30" height="30" />
                        <rect x="277" y="198" width="30" height="30" />
                        <rect x="315" y="198" width="30" height="30" />
                        <rect x="353" y="198" width="30" height="30" />
                        <rect x="420" y="198" width="30" height="30" />
                        <rect x="458" y="198" width="30" height="30" />
                        <rect x="496" y="198" width="30" height="30" />
                        <rect x="534" y="198" width="30" height="30" />
                        <rect x="572" y="198" width="30" height="30" />
                        <rect x="610" y="198" width="30" height="30" />
                        <rect x="648" y="198" width="30" height="30" />
                        <rect x="686" y="198" width="30" height="30" />
                        <rect x="724" y="198" width="30" height="30" />
                        <rect x="762" y="198" width="30" height="30" />
                        <rect x="11" y="242" width="30" height="30" />
                        <rect x="49" y="242" width="30" height="30" />
                        <rect x="87" y="242" width="30" height="30" />
                        <rect x="125" y="242" width="30" height="30" />
                        <rect x="163" y="242" width="30" height="30" />
                        <rect x="201" y="242" width="30" height="30" />
                        <rect x="239" y="242" width="30" height="30" />
                        <rect x="277" y="242" width="30" height="30" />
                        <rect x="315" y="242" width="30" height="30" />
                        <rect x="353" y="242" width="30" height="30" />
                        <rect x="420" y="242" width="30" height="30" />
                        <rect x="458" y="242" width="30" height="30" />
                        <rect x="496" y="242" width="30" height="30" />
                        <rect x="534" y="242" width="30" height="30" />
                        <rect x="572" y="242" width="30" height="30" />
                        <rect x="610" y="242" width="30" height="30" />
                        <rect x="648" y="242" width="30" height="30" />
                        <rect x="686" y="242" width="30" height="30" />
                        <rect x="724" y="242" width="30" height="30" />
                        <rect x="762" y="242" width="30" height="30" />
                        <rect x="11" y="286" width="30" height="30" />
                        <rect x="49" y="286" width="30" height="30" />
                        <rect x="87" y="286" width="30" height="30" />
                        <rect x="125" y="286" width="30" height="30" />
                        <rect x="163" y="286" width="30" height="30" />
                        <rect x="201" y="286" width="30" height="30" />
                        <rect x="239" y="286" width="30" height="30" />
                        <rect x="277" y="286" width="30" height="30" />
                        <rect x="315" y="286" width="30" height="30" />
                        <rect x="353" y="286" width="30" height="30" />
                        <rect x="420" y="286" width="30" height="30" />
                        <rect x="458" y="286" width="30" height="30" />
                        <rect x="496" y="286" width="30" height="30" />
                        <rect x="534" y="286" width="30" height="30" />
                        <rect x="572" y="286" width="30" height="30" />
                        <rect x="610" y="286" width="30" height="30" />
                        <rect x="648" y="286" width="30" height="30" />
                        <rect x="686" y="286" width="30" height="30" />
                        <rect x="724" y="286" width="30" height="30" />
                        <rect x="762" y="286" width="30" height="30" />
                        <rect x="11" y="330" width="30" height="30" />
                        <rect x="49" y="330" width="30" height="30" />
                        <rect x="87" y="330" width="30" height="30" />
                        <rect x="125" y="330" width="30" height="30" />
                        <rect x="163" y="330" width="30" height="30" />
                        <rect x="201" y="330" width="30" height="30" />
                        <rect x="239" y="330" width="30" height="30" />
                        <rect x="277" y="330" width="30" height="30" />
                        <rect x="315" y="330" width="30" height="30" />
                        <rect x="353" y="330" width="30" height="30" />
                        <rect x="420" y="330" width="30" height="30" />
                        <rect x="458" y="330" width="30" height="30" />
                        <rect x="496" y="330" width="30" height="30" />
                        <rect x="534" y="330" width="30" height="30" />
                        <rect x="572" y="330" width="30" height="30" />
                        <rect x="610" y="330" width="30" height="30" />
                        <rect x="648" y="330" width="30" height="30" />
                        <rect x="686" y="330" width="30" height="30" />
                        <rect x="724" y="330" width="30" height="30" />
                        <rect x="762" y="330" width="30" height="30" />
                        <rect x="11" y="374" width="30" height="30" />
                        <rect x="49" y="374" width="30" height="30" />
                        <rect x="87" y="374" width="30" height="30" />
                        <rect x="125" y="374" width="30" height="30" />
                        <rect x="163" y="374" width="30" height="30" />
                        <rect x="201" y="374" width="30" height="30" />
                        <rect x="239" y="374" width="30" height="30" />
                        <rect x="277" y="374" width="30" height="30" />
                        <rect x="315" y="374" width="30" height="30" />
                        <rect x="353" y="374" width="30" height="30" />
                        <rect x="420" y="374" width="30" height="30" />
                        <rect x="458" y="374" width="30" height="30" />
                        <rect x="496" y="374" width="30" height="30" />
                        <rect x="534" y="374" width="30" height="30" />
                        <rect x="572" y="374" width="30" height="30" />
                        <rect x="610" y="374" width="30" height="30" />
                        <rect x="648" y="374" width="30" height="30" />
                        <rect x="686" y="374" width="30" height="30" />
                        <rect x="724" y="374" width="30" height="30" />
                        <rect x="762" y="374" width="30" height="30" />
                        <rect x="11" y="418" width="30" height="30" />
                        <rect x="49" y="418" width="30" height="30" />
                        <rect x="87" y="418" width="30" height="30" />
                        <rect x="125" y="418" width="30" height="30" />
                        <rect x="163" y="418" width="30" height="30" />
                        <rect x="201" y="418" width="30" height="30" />
                        <rect x="239" y="418" width="30" height="30" />
                        <rect x="277" y="418" width="30" height="30" />
                        <rect x="315" y="418" width="30" height="30" />
                        <rect x="353" y="418" width="30" height="30" />
                        <rect x="420" y="418" width="30" height="30" />
                        <rect x="458" y="418" width="30" height="30" />
                        <rect x="496" y="418" width="30" height="30" />
                        <rect x="534" y="418" width="30" height="30" />
                        <rect x="572" y="418" width="30" height="30" />
                        <rect x="610" y="418" width="30" height="30" />
                        <rect x="648" y="418" width="30" height="30" />
                        <rect x="686" y="418" width="30" height="30" />
                        <rect x="724" y="418" width="30" height="30" />
                        <rect x="762" y="418" width="30" height="30" />
                        <rect x="11" y="462" width="30" height="30" />
                        <rect x="49" y="462" width="30" height="30" />
                        <rect x="87" y="462" width="30" height="30" />
                        <rect x="125" y="462" width="30" height="30" />
                        <rect x="163" y="462" width="30" height="30" />
                        <rect x="201" y="462" width="30" height="30" />
                        <rect x="239" y="462" width="30" height="30" />
                        <rect x="277" y="462" width="30" height="30" />
                        <rect x="315" y="462" width="30" height="30" />
                        <rect x="353" y="462" width="30" height="30" />
                        <rect x="420" y="462" width="30" height="30" />
                        <rect x="458" y="462" width="30" height="30" />
                        <rect x="496" y="462" width="30" height="30" />
                        <rect x="534" y="462" width="30" height="30" />
                        <rect x="572" y="462" width="30" height="30" />
                        <rect x="610" y="462" width="30" height="30" />
                        <rect x="648" y="462" width="30" height="30" />
                        <rect x="686" y="462" width="30" height="30" />
                        <rect x="724" y="462" width="30" height="30" />
                        <rect x="762" y="462" width="30" height="30" />
                        <rect x="11" y="523" width="30" height="30" />
                        <rect x="49" y="523" width="30" height="30" />
                        <rect x="87" y="523" width="30" height="30" />
                        <rect x="125" y="523" width="30" height="30" />
                        <rect x="163" y="523" width="30" height="30" />
                        <rect x="201" y="523" width="30" height="30" />
                        <rect x="239" y="523" width="30" height="30" />
                        <rect x="277" y="523" width="30" height="30" />
                        <rect x="315" y="523" width="30" height="30" />
                        <rect x="353" y="523" width="30" height="30" />
                        <rect x="420" y="523" width="30" height="30" />
                        <rect x="458" y="523" width="30" height="30" />
                        <rect x="496" y="523" width="30" height="30" />
                        <rect x="534" y="523" width="30" height="30" />
                        <rect x="572" y="523" width="30" height="30" />
                        <rect x="610" y="523" width="30" height="30" />
                        <rect x="648" y="523" width="30" height="30" />
                        <rect x="686" y="523" width="30" height="30" />
                        <rect x="724" y="523" width="30" height="30" />
                        <rect x="762" y="523" width="30" height="30" />
                        <rect x="11" y="567" width="30" height="30" />
                        <rect x="49" y="567" width="30" height="30" />
                        <rect x="87" y="567" width="30" height="30" />
                        <rect x="125" y="567" width="30" height="30" />
                        <rect x="163" y="567" width="30" height="30" />
                        <rect x="201" y="567" width="30" height="30" />
                        <rect x="239" y="567" width="30" height="30" />
                        <rect x="277" y="567" width="30" height="30" />
                        <rect x="315" y="567" width="30" height="30" />
                        <rect x="353" y="567" width="30" height="30" />
                        <rect x="420" y="567" width="30" height="30" />
                        <rect x="458" y="567" width="30" height="30" />
                        <rect x="496" y="567" width="30" height="30" />
                        <rect x="534" y="567" width="30" height="30" />
                        <rect x="572" y="567" width="30" height="30" />
                        <rect x="610" y="567" width="30" height="30" />
                        <rect x="648" y="567" width="30" height="30" />
                        <rect x="686" y="567" width="30" height="30" />
                        <rect x="724" y="567" width="30" height="30" />
                        <rect x="762" y="567" width="30" height="30" />
                        <rect x="11" y="611" width="30" height="30" />
                        <rect x="49" y="611" width="30" height="30" />
                        <rect x="87" y="611" width="30" height="30" />
                        <rect x="125" y="611" width="30" height="30" />
                        <rect x="163" y="611" width="30" height="30" />
                        <rect x="201" y="611" width="30" height="30" />
                        <rect x="239" y="611" width="30" height="30" />
                        <rect x="277" y="611" width="30" height="30" />
                        <rect x="315" y="611" width="30" height="30" />
                        <rect x="353" y="611" width="30" height="30" />
                        <rect x="420" y="611" width="30" height="30" />
                        <rect x="458" y="611" width="30" height="30" />
                        <rect x="496" y="611" width="30" height="30" />
                        <rect x="534" y="611" width="30" height="30" />
                        <rect x="572" y="611" width="30" height="30" />
                        <rect x="610" y="611" width="30" height="30" />
                        <rect x="648" y="611" width="30" height="30" />
                        <rect x="686" y="611" width="30" height="30" />
                        <rect x="724" y="611" width="30" height="30" />
                        <rect x="762" y="611" width="30" height="30" />
                        <rect x="11" y="655" width="30" height="30" />
                        <rect x="49" y="655" width="30" height="30" />
                        <rect x="87" y="655" width="30" height="30" />
                        <rect x="125" y="655" width="30" height="30" />
                        <rect x="163" y="655" width="30" height="30" />
                        <rect x="201" y="655" width="30" height="30" />
                        <rect x="239" y="655" width="30" height="30" />
                        <rect x="277" y="655" width="30" height="30" />
                        <rect x="315" y="655" width="30" height="30" />
                        <rect x="353" y="655" width="30" height="30" />
                        <rect x="420" y="655" width="30" height="30" />
                        <rect x="458" y="655" width="30" height="30" />
                        <rect x="496" y="655" width="30" height="30" />
                        <rect x="534" y="655" width="30" height="30" />
                        <rect x="572" y="655" width="30" height="30" />
                        <rect x="610" y="655" width="30" height="30" />
                        <rect x="648" y="655" width="30" height="30" />
                        <rect x="686" y="655" width="30" height="30" />
                        <rect x="724" y="655" width="30" height="30" />
                        <rect x="762" y="655" width="30" height="30" />
                        <rect x="156" y="750" width="30" height="30" />
                        <rect x="194" y="750" width="30" height="30" />
                        <rect x="232" y="750" width="30" height="30" />
                        <rect x="270" y="750" width="30" height="30" />
                        <rect x="308" y="750" width="30" height="30" />
                        <rect x="346" y="750" width="30" height="30" />
                        <rect x="424" y="750" width="30" height="30" />
                        <rect x="462" y="750" width="30" height="30" />
                        <rect x="500" y="750" width="30" height="30" />
                        <rect x="538" y="750" width="30" height="30" />
                        <rect x="576" y="750" width="30" height="30" />
                        <rect x="614" y="750" width="30" height="30" />
                        <rect x="156" y="791" width="30" height="30" />
                        <rect x="194" y="791" width="30" height="30" />
                        <rect x="232" y="791" width="30" height="30" />
                        <rect x="270" y="791" width="30" height="30" />
                        <rect x="308" y="791" width="30" height="30" />
                        <rect x="346" y="791" width="30" height="30" />
                        <rect x="424" y="791" width="30" height="30" />
                        <rect x="462" y="791" width="30" height="30" />
                        <rect x="500" y="791" width="30" height="30" />
                        <rect x="538" y="791" width="30" height="30" />
                        <rect x="576" y="791" width="30" height="30" />
                        <rect x="614" y="791" width="30" height="30" />
                        <rect x="156" y="832" width="30" height="30" />
                        <rect x="194" y="832" width="30" height="30" />
                        <rect x="232" y="832" width="30" height="30" />
                        <rect x="270" y="832" width="30" height="30" />
                        <rect x="308" y="832" width="30" height="30" />
                        <rect x="346" y="832" width="30" height="30" />
                        <rect x="424" y="832" width="30" height="30" />
                        <rect x="462" y="832" width="30" height="30" />
                        <rect x="500" y="832" width="30" height="30" />
                        <rect x="538" y="832" width="30" height="30" />
                        <rect x="576" y="832" width="30" height="30" />
                        <rect x="614" y="832" width="30" height="30" />
                        <rect x="156" y="873" width="30" height="30" />
                        <rect x="194" y="873" width="30" height="30" />
                        <rect x="232" y="873" width="30" height="30" />
                        <rect x="270" y="873" width="30" height="30" />
                        <rect x="308" y="873" width="30" height="30" />
                        <rect x="346" y="873" width="30" height="30" />
                        <rect x="424" y="873" width="30" height="30" />
                        <rect x="462" y="873" width="30" height="30" />
                        <rect x="500" y="873" width="30" height="30" />
                        <rect x="538" y="873" width="30" height="30" />
                        <rect x="576" y="873" width="30" height="30" />
                        <rect x="614" y="873" width="30" height="30" />
                        <rect x="156" y="914" width="30" height="30" />
                        <rect x="194" y="914" width="30" height="30" />
                        <rect x="232" y="914" width="30" height="30" />
                        <rect x="270" y="914" width="30" height="30" />
                        <rect x="308" y="914" width="30" height="30" />
                        <rect x="346" y="914" width="30" height="30" />
                        <rect x="424" y="914" width="30" height="30" />
                        <rect x="462" y="914" width="30" height="30" />
                        <rect x="500" y="914" width="30" height="30" />
                        <rect x="538" y="914" width="30" height="30" />
                        <rect x="576" y="914" width="30" height="30" />
                        <rect x="614" y="914" width="30" height="30" />
                        <path d="M362.761 742V727.455H371.54V729.017H364.523V733.562H368.216C369.258 733.562 370.136 733.733 370.851 734.074C371.571 734.415 372.115 734.895 372.484 735.516C372.858 736.136 373.045 736.867 373.045 737.71C373.045 738.553 372.858 739.296 372.484 739.94C372.115 740.584 371.571 741.089 370.851 741.453C370.136 741.818 369.258 742 368.216 742H362.761ZM364.523 740.466H368.216C368.879 740.466 369.44 740.333 369.899 740.068C370.363 739.798 370.714 739.453 370.95 739.031C371.192 738.605 371.312 738.155 371.312 737.682C371.312 736.986 371.045 736.387 370.51 735.885C369.975 735.378 369.21 735.125 368.216 735.125H364.523V740.466ZM378.928 742.256C378.237 742.256 377.609 742.125 377.046 741.865C376.482 741.6 376.035 741.219 375.703 740.722C375.372 740.22 375.206 739.614 375.206 738.903C375.206 738.278 375.329 737.772 375.576 737.384C375.822 736.991 376.151 736.683 376.563 736.46C376.975 736.238 377.429 736.072 377.926 735.963C378.428 735.849 378.933 735.759 379.439 735.693C380.102 735.608 380.64 735.544 381.051 735.501C381.468 735.454 381.771 735.376 381.961 735.267C382.155 735.158 382.252 734.969 382.252 734.699V734.642C382.252 733.941 382.06 733.397 381.676 733.009C381.298 732.62 380.722 732.426 379.951 732.426C379.15 732.426 378.523 732.601 378.069 732.952C377.614 733.302 377.294 733.676 377.11 734.074L375.519 733.506C375.803 732.843 376.182 732.327 376.655 731.957C377.133 731.583 377.654 731.323 378.218 731.176C378.786 731.025 379.345 730.949 379.894 730.949C380.244 730.949 380.647 730.991 381.101 731.077C381.56 731.157 382.003 731.325 382.429 731.581C382.86 731.837 383.218 732.223 383.502 732.739C383.786 733.255 383.928 733.946 383.928 734.812V742H382.252V740.523H382.167C382.053 740.759 381.864 741.013 381.598 741.283C381.333 741.553 380.98 741.782 380.54 741.972C380.1 742.161 379.562 742.256 378.928 742.256ZM379.184 740.75C379.846 740.75 380.405 740.62 380.86 740.359C381.319 740.099 381.665 739.763 381.897 739.351C382.133 738.939 382.252 738.506 382.252 738.051V736.517C382.181 736.602 382.025 736.68 381.783 736.751C381.546 736.818 381.272 736.877 380.959 736.929C380.651 736.976 380.351 737.019 380.057 737.057C379.768 737.09 379.534 737.118 379.354 737.142C378.918 737.199 378.511 737.291 378.132 737.419C377.758 737.542 377.455 737.729 377.223 737.98C376.996 738.226 376.882 738.562 376.882 738.989C376.882 739.571 377.098 740.011 377.529 740.31C377.964 740.603 378.516 740.75 379.184 740.75ZM386.021 742V740.438H386.419C386.746 740.438 387.018 740.374 387.236 740.246C387.454 740.113 387.629 739.884 387.761 739.557C387.899 739.225 388.003 738.766 388.074 738.179C388.15 737.587 388.204 736.834 388.237 735.92L388.436 731.091H395.709V742H394.033V732.653H390.027L389.857 736.545C389.819 737.44 389.738 738.229 389.615 738.911C389.497 739.588 389.314 740.156 389.068 740.615C388.827 741.074 388.505 741.42 388.102 741.652C387.7 741.884 387.196 742 386.589 742H386.021ZM398.784 742V731.091H400.46V735.835H401.568L405.489 731.091H407.648L403.244 736.347L407.705 742H405.545L401.966 737.398H400.46V742H398.784ZM413.509 742.227C412.524 742.227 411.66 741.993 410.917 741.524C410.178 741.055 409.6 740.4 409.184 739.557C408.772 738.714 408.566 737.729 408.566 736.602C408.566 735.466 408.772 734.474 409.184 733.626C409.6 732.779 410.178 732.121 410.917 731.652C411.66 731.183 412.524 730.949 413.509 730.949C414.494 730.949 415.355 731.183 416.094 731.652C416.837 732.121 417.415 732.779 417.827 733.626C418.244 734.474 418.452 735.466 418.452 736.602C418.452 737.729 418.244 738.714 417.827 739.557C417.415 740.4 416.837 741.055 416.094 741.524C415.355 741.993 414.494 742.227 413.509 742.227ZM413.509 740.722C414.257 740.722 414.873 740.53 415.355 740.146C415.838 739.763 416.196 739.259 416.428 738.634C416.66 738.009 416.776 737.331 416.776 736.602C416.776 735.873 416.66 735.194 416.428 734.564C416.196 733.934 415.838 733.425 415.355 733.037C414.873 732.649 414.257 732.455 413.509 732.455C412.761 732.455 412.145 732.649 411.662 733.037C411.179 733.425 410.822 733.934 410.59 734.564C410.358 735.194 410.242 735.873 410.242 736.602C410.242 737.331 410.358 738.009 410.59 738.634C410.822 739.259 411.179 739.763 411.662 740.146C412.145 740.53 412.761 740.722 413.509 740.722ZM428.312 735.778V737.341H422.289V735.778H428.312ZM422.687 731.091V742H421.011V731.091H422.687ZM429.59 731.091V742H427.914V731.091H429.59Z" fill="black" />
                        <path d="M348.358 515H346.511L351.852 500.455H353.67L359.011 515H357.165L352.818 502.756H352.705L348.358 515ZM349.04 509.318H356.483V510.881H349.04V509.318ZM367.016 512.727L370.822 504.091H372.413L367.697 515H366.334L361.703 504.091H363.266L367.016 512.727ZM362.726 504.091V515H361.05V504.091H362.726ZM371.305 515V504.091H372.982V515H371.305ZM380.482 518.722V500.455H382.158V518.722H380.482ZM380.482 515.227C379.743 515.227 379.071 515.095 378.464 514.83C377.858 514.56 377.338 514.179 376.902 513.686C376.466 513.189 376.13 512.595 375.893 511.903C375.657 511.212 375.538 510.445 375.538 509.602C375.538 508.75 375.657 507.978 375.893 507.287C376.13 506.591 376.466 505.994 376.902 505.497C377.338 505 377.858 504.619 378.464 504.354C379.071 504.084 379.743 503.949 380.482 503.949H380.993V515.227H380.482ZM380.482 513.722H380.766V505.455H380.482C379.923 505.455 379.438 505.568 379.026 505.795C378.614 506.018 378.273 506.323 378.003 506.712C377.738 507.095 377.539 507.536 377.406 508.033C377.278 508.53 377.214 509.053 377.214 509.602C377.214 510.331 377.33 511.009 377.562 511.634C377.795 512.259 378.152 512.763 378.635 513.146C379.118 513.53 379.733 513.722 380.482 513.722ZM382.158 515.227H381.646V503.949H382.158C382.896 503.949 383.569 504.084 384.175 504.354C384.781 504.619 385.302 505 385.737 505.497C386.173 505.994 386.509 506.591 386.746 507.287C386.982 507.978 387.101 508.75 387.101 509.602C387.101 510.445 386.982 511.212 386.746 511.903C386.509 512.595 386.173 513.189 385.737 513.686C385.302 514.179 384.781 514.56 384.175 514.83C383.569 515.095 382.896 515.227 382.158 515.227ZM382.158 513.722C382.721 513.722 383.206 513.613 383.614 513.395C384.026 513.172 384.364 512.869 384.629 512.486C384.899 512.098 385.098 511.657 385.226 511.165C385.358 510.668 385.425 510.147 385.425 509.602C385.425 508.873 385.309 508.194 385.077 507.564C384.845 506.934 384.487 506.425 384.004 506.037C383.521 505.649 382.906 505.455 382.158 505.455H381.874V513.722H382.158ZM391.339 512.528L396.595 504.091H398.527V515H396.85V506.562L391.623 515H389.663V504.091H391.339V512.528ZM400.112 505.653V504.091H408.976V505.653H405.396V515H403.72V505.653H400.112ZM415.428 515.227C414.377 515.227 413.47 514.995 412.708 514.531C411.951 514.062 411.366 513.409 410.954 512.571C410.547 511.728 410.343 510.748 410.343 509.631C410.343 508.513 410.547 507.528 410.954 506.676C411.366 505.819 411.939 505.152 412.673 504.673C413.411 504.19 414.273 503.949 415.258 503.949C415.826 503.949 416.387 504.044 416.941 504.233C417.495 504.422 417.999 504.73 418.454 505.156C418.908 505.578 419.271 506.136 419.54 506.832C419.81 507.528 419.945 508.385 419.945 509.403V510.114H411.536V508.665H418.241C418.241 508.049 418.118 507.5 417.871 507.017C417.63 506.534 417.284 506.153 416.835 505.874C416.389 505.594 415.864 505.455 415.258 505.455C414.59 505.455 414.013 505.62 413.525 505.952C413.042 506.278 412.67 506.705 412.41 507.23C412.149 507.756 412.019 508.319 412.019 508.92V509.886C412.019 510.71 412.161 511.409 412.445 511.982C412.734 512.55 413.134 512.983 413.646 513.281C414.157 513.575 414.751 513.722 415.428 513.722C415.869 513.722 416.266 513.66 416.621 513.537C416.981 513.409 417.291 513.22 417.552 512.969C417.812 512.713 418.013 512.396 418.156 512.017L419.775 512.472C419.604 513.021 419.318 513.504 418.915 513.92C418.513 514.332 418.016 514.654 417.424 514.886C416.832 515.114 416.167 515.227 415.428 515.227ZM425.705 515.256C425.014 515.256 424.387 515.125 423.823 514.865C423.26 514.6 422.812 514.219 422.481 513.722C422.149 513.22 421.984 512.614 421.984 511.903C421.984 511.278 422.107 510.772 422.353 510.384C422.599 509.991 422.928 509.683 423.34 509.46C423.752 509.238 424.207 509.072 424.704 508.963C425.206 508.849 425.71 508.759 426.217 508.693C426.879 508.608 427.417 508.544 427.829 508.501C428.246 508.454 428.549 508.376 428.738 508.267C428.932 508.158 429.029 507.969 429.029 507.699V507.642C429.029 506.941 428.837 506.397 428.454 506.009C428.075 505.62 427.5 505.426 426.728 505.426C425.928 505.426 425.3 505.601 424.846 505.952C424.391 506.302 424.072 506.676 423.887 507.074L422.296 506.506C422.58 505.843 422.959 505.327 423.433 504.957C423.911 504.583 424.432 504.323 424.995 504.176C425.563 504.025 426.122 503.949 426.671 503.949C427.022 503.949 427.424 503.991 427.879 504.077C428.338 504.157 428.781 504.325 429.207 504.581C429.638 504.837 429.995 505.223 430.279 505.739C430.563 506.255 430.705 506.946 430.705 507.812V515H429.029V513.523H428.944C428.83 513.759 428.641 514.013 428.376 514.283C428.111 514.553 427.758 514.782 427.317 514.972C426.877 515.161 426.34 515.256 425.705 515.256ZM425.961 513.75C426.624 513.75 427.183 513.62 427.637 513.359C428.096 513.099 428.442 512.763 428.674 512.351C428.911 511.939 429.029 511.506 429.029 511.051V509.517C428.958 509.602 428.802 509.68 428.56 509.751C428.324 509.818 428.049 509.877 427.737 509.929C427.429 509.976 427.128 510.019 426.835 510.057C426.546 510.09 426.311 510.118 426.131 510.142C425.696 510.199 425.289 510.291 424.91 510.419C424.536 510.542 424.233 510.729 424.001 510.98C423.773 511.226 423.66 511.562 423.66 511.989C423.66 512.571 423.875 513.011 424.306 513.31C424.742 513.603 425.293 513.75 425.961 513.75ZM432.28 505.653V504.091H441.144V505.653H437.564V515H435.888V505.653H432.28ZM443.589 519.091V504.091H445.208V505.824H445.407C445.53 505.634 445.701 505.393 445.918 505.099C446.141 504.801 446.458 504.536 446.87 504.304C447.287 504.067 447.85 503.949 448.56 503.949C449.479 503.949 450.289 504.179 450.989 504.638C451.69 505.097 452.237 505.748 452.63 506.591C453.023 507.434 453.219 508.428 453.219 509.574C453.219 510.729 453.023 511.731 452.63 512.578C452.237 513.421 451.692 514.074 450.996 514.538C450.3 514.998 449.498 515.227 448.589 515.227C447.888 515.227 447.327 515.111 446.906 514.879C446.484 514.643 446.16 514.375 445.933 514.077C445.705 513.774 445.53 513.523 445.407 513.324H445.265V519.091H443.589ZM445.237 509.545C445.237 510.369 445.357 511.096 445.599 511.726C445.84 512.351 446.193 512.841 446.657 513.196C447.121 513.546 447.689 513.722 448.362 513.722C449.062 513.722 449.647 513.537 450.116 513.168C450.589 512.794 450.944 512.292 451.181 511.662C451.423 511.027 451.543 510.322 451.543 509.545C451.543 508.778 451.425 508.087 451.188 507.472C450.956 506.851 450.603 506.361 450.13 506.001C449.661 505.637 449.072 505.455 448.362 505.455C447.68 505.455 447.107 505.627 446.643 505.973C446.179 506.314 445.828 506.792 445.592 507.408C445.355 508.018 445.237 508.731 445.237 509.545Z" fill="black" />                     <path d="M376.642 130.455V145H374.881V132.017H367.551V145H365.79V130.455H376.642ZM383.178 145.256C382.487 145.256 381.859 145.125 381.296 144.865C380.732 144.6 380.285 144.219 379.953 143.722C379.622 143.22 379.456 142.614 379.456 141.903C379.456 141.278 379.579 140.772 379.826 140.384C380.072 139.991 380.401 139.683 380.813 139.46C381.225 139.238 381.679 139.072 382.176 138.963C382.678 138.849 383.183 138.759 383.689 138.693C384.352 138.608 384.89 138.544 385.301 138.501C385.718 138.454 386.021 138.376 386.211 138.267C386.405 138.158 386.502 137.969 386.502 137.699V137.642C386.502 136.941 386.31 136.397 385.926 136.009C385.548 135.62 384.972 135.426 384.201 135.426C383.4 135.426 382.773 135.601 382.319 135.952C381.864 136.302 381.544 136.676 381.36 137.074L379.769 136.506C380.053 135.843 380.432 135.327 380.905 134.957C381.383 134.583 381.904 134.323 382.468 134.176C383.036 134.025 383.595 133.949 384.144 133.949C384.494 133.949 384.897 133.991 385.351 134.077C385.81 134.157 386.253 134.325 386.679 134.581C387.11 134.837 387.468 135.223 387.752 135.739C388.036 136.255 388.178 136.946 388.178 137.812V145H386.502V143.523H386.417C386.303 143.759 386.114 144.013 385.848 144.283C385.583 144.553 385.23 144.782 384.79 144.972C384.35 145.161 383.812 145.256 383.178 145.256ZM383.434 143.75C384.096 143.75 384.655 143.62 385.11 143.359C385.569 143.099 385.915 142.763 386.147 142.351C386.383 141.939 386.502 141.506 386.502 141.051V139.517C386.431 139.602 386.275 139.68 386.033 139.751C385.796 139.818 385.522 139.877 385.209 139.929C384.901 139.976 384.601 140.019 384.307 140.057C384.018 140.09 383.784 140.118 383.604 140.142C383.168 140.199 382.761 140.291 382.382 140.419C382.008 140.542 381.705 140.729 381.473 140.98C381.246 141.226 381.132 141.562 381.132 141.989C381.132 142.571 381.348 143.011 381.779 143.31C382.214 143.603 382.766 143.75 383.434 143.75ZM391.237 149.091V134.091H392.857V135.824H393.055C393.179 135.634 393.349 135.393 393.567 135.099C393.789 134.801 394.107 134.536 394.518 134.304C394.935 134.067 395.499 133.949 396.209 133.949C397.127 133.949 397.937 134.179 398.638 134.638C399.339 135.097 399.885 135.748 400.278 136.591C400.671 137.434 400.868 138.428 400.868 139.574C400.868 140.729 400.671 141.731 400.278 142.578C399.885 143.421 399.341 144.074 398.645 144.538C397.949 144.998 397.146 145.227 396.237 145.227C395.536 145.227 394.975 145.111 394.554 144.879C394.133 144.643 393.808 144.375 393.581 144.077C393.354 143.774 393.179 143.523 393.055 143.324H392.913V149.091H391.237ZM392.885 139.545C392.885 140.369 393.006 141.096 393.247 141.726C393.489 142.351 393.841 142.841 394.305 143.196C394.769 143.546 395.338 143.722 396.01 143.722C396.711 143.722 397.295 143.537 397.764 143.168C398.238 142.794 398.593 142.292 398.83 141.662C399.071 141.027 399.192 140.322 399.192 139.545C399.192 138.778 399.073 138.087 398.837 137.472C398.605 136.851 398.252 136.361 397.778 136.001C397.31 135.637 396.72 135.455 396.01 135.455C395.328 135.455 394.755 135.627 394.291 135.973C393.827 136.314 393.477 136.792 393.24 137.408C393.003 138.018 392.885 138.731 392.885 139.545ZM401.999 135.653V134.091H410.863V135.653H407.283V145H405.607V135.653H401.999ZM417.315 145.227C416.264 145.227 415.357 144.995 414.595 144.531C413.837 144.062 413.252 143.409 412.841 142.571C412.433 141.728 412.23 140.748 412.23 139.631C412.23 138.513 412.433 137.528 412.841 136.676C413.252 135.819 413.825 135.152 414.559 134.673C415.298 134.19 416.16 133.949 417.145 133.949C417.713 133.949 418.274 134.044 418.828 134.233C419.382 134.422 419.886 134.73 420.341 135.156C420.795 135.578 421.157 136.136 421.427 136.832C421.697 137.528 421.832 138.385 421.832 139.403V140.114H413.423V138.665H420.127C420.127 138.049 420.004 137.5 419.758 137.017C419.517 136.534 419.171 136.153 418.721 135.874C418.276 135.594 417.751 135.455 417.145 135.455C416.477 135.455 415.899 135.62 415.412 135.952C414.929 136.278 414.557 136.705 414.297 137.23C414.036 137.756 413.906 138.319 413.906 138.92V139.886C413.906 140.71 414.048 141.409 414.332 141.982C414.621 142.55 415.021 142.983 415.532 143.281C416.044 143.575 416.638 143.722 417.315 143.722C417.755 143.722 418.153 143.66 418.508 143.537C418.868 143.409 419.178 143.22 419.439 142.969C419.699 142.713 419.9 142.396 420.042 142.017L421.662 142.472C421.491 143.021 421.205 143.504 420.802 143.92C420.4 144.332 419.903 144.654 419.311 144.886C418.719 145.114 418.054 145.227 417.315 145.227ZM424.382 149.091V134.091H426.001V135.824H426.2C426.323 135.634 426.493 135.393 426.711 135.099C426.934 134.801 427.251 134.536 427.663 134.304C428.08 134.067 428.643 133.949 429.353 133.949C430.272 133.949 431.082 134.179 431.782 134.638C432.483 135.097 433.03 135.748 433.423 136.591C433.816 137.434 434.012 138.428 434.012 139.574C434.012 140.729 433.816 141.731 433.423 142.578C433.03 143.421 432.485 144.074 431.789 144.538C431.093 144.998 430.291 145.227 429.382 145.227C428.681 145.227 428.12 145.111 427.699 144.879C427.277 144.643 426.953 144.375 426.725 144.077C426.498 143.774 426.323 143.523 426.2 143.324H426.058V149.091H424.382ZM426.029 139.545C426.029 140.369 426.15 141.096 426.392 141.726C426.633 142.351 426.986 142.841 427.45 143.196C427.914 143.546 428.482 143.722 429.154 143.722C429.855 143.722 430.44 143.537 430.909 143.168C431.382 142.794 431.737 142.292 431.974 141.662C432.216 141.027 432.336 140.322 432.336 139.545C432.336 138.778 432.218 138.087 431.981 137.472C431.749 136.851 431.396 136.361 430.923 136.001C430.454 135.637 429.865 135.455 429.154 135.455C428.473 135.455 427.9 135.627 427.436 135.973C426.972 136.314 426.621 136.792 426.385 137.408C426.148 138.018 426.029 138.731 426.029 139.545Z" fill="black" />
                        <path d="M356.932 37H353.409C353.201 35.9867 352.836 35.0966 352.315 34.3295C351.804 33.5625 351.179 32.9186 350.44 32.3977C349.711 31.8674 348.902 31.4697 348.011 31.2045C347.121 30.9394 346.193 30.8068 345.227 30.8068C343.466 30.8068 341.87 31.2519 340.44 32.142C339.02 33.0322 337.888 34.3438 337.045 36.0767C336.212 37.8097 335.795 39.9356 335.795 42.4545C335.795 44.9735 336.212 47.0994 337.045 48.8324C337.888 50.5653 339.02 51.8769 340.44 52.767C341.87 53.6572 343.466 54.1023 345.227 54.1023C346.193 54.1023 347.121 53.9697 348.011 53.7045C348.902 53.4394 349.711 53.0464 350.44 52.5256C351.179 51.9953 351.804 51.3466 352.315 50.5795C352.836 49.803 353.201 48.9129 353.409 47.9091H356.932C356.667 49.3958 356.184 50.7263 355.483 51.9006C354.782 53.0748 353.911 54.0739 352.869 54.8977C351.828 55.7121 350.658 56.3324 349.361 56.7585C348.073 57.1847 346.695 57.3977 345.227 57.3977C342.746 57.3977 340.54 56.7917 338.608 55.5795C336.676 54.3674 335.156 52.6439 334.048 50.4091C332.94 48.1742 332.386 45.5227 332.386 42.4545C332.386 39.3864 332.94 36.7348 334.048 34.5C335.156 32.2652 336.676 30.5417 338.608 29.3295C340.54 28.1174 342.746 27.5114 345.227 27.5114C346.695 27.5114 348.073 27.7244 349.361 28.1506C350.658 28.5767 351.828 29.2017 352.869 30.0256C353.911 30.84 354.782 31.8343 355.483 33.0085C356.184 34.1733 356.667 35.5038 356.932 37ZM387.34 53.6477L386.942 63.875H383.306V57H381.261V53.6477H387.34ZM362.624 57V27.9091H365.977V53.7614H380.977V27.9091H384.329V57H362.624ZM392.663 57V27.9091H410.22V31.0341H396.186V40.8636H409.311V43.9886H396.186V53.875H410.447V57H392.663ZM416.57 57V27.9091H420.092V40.8636H435.604V27.9091H439.126V57H435.604V43.9886H420.092V57H416.57ZM447.372 57H443.679L454.361 27.9091H457.997L468.679 57H464.986L456.293 32.5114H456.065L447.372 57ZM448.736 45.6364H463.622V48.7614H448.736V45.6364Z" fill="black" />
                    </g>
                    <defs>
                        <clipPath id="clip0_245_4">
                            <rect width="800" height="1000" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </div>

            <div className={styles.legend}>
                <div className={styles.legendTitle}>Секторы зала</div>
                {console.log(sectorPrices)}
                <div className={styles.legendGrid}>
                    <div className={styles.legendItem}>
                        <div className={styles.colorBox} style={{ background: '#2ecc71' }}></div>
                        <span>Партер</span>
                    </div>

                    <div className={styles.legendItem}>
                        <div className={styles.colorBox} style={{ background: '#3498db' }}></div>
                        <span>Амфитеатр</span>
                    </div>

                    <div className={styles.legendItem}>
                        <div className={styles.colorBox} style={{ background: '#e67e22' }}></div>
                        <span>Балкон</span>
                    </div>

                    <div className={styles.legendItem}>
                        <div className={styles.colorBox} style={{ background: '#f1c40f' }}></div>
                        <span>Выбрано вами</span>
                    </div>

                    <div className={styles.legendItem}>
                        <div className={styles.colorBox} style={{ background: '#666', opacity: 0.5 }}></div>
                        <span>Занято</span>
                    </div>
                </div>
            </div>

            <div className={styles.legend}>
                <div className={styles.legendTitle}>Цены секторов зала</div>

                <div className={styles.legendGrid}>
                    <div className={styles.legendItem}>
                        <div className={styles.colorBox} style={{ background: '#2ecc71' }}></div>
                        <span>Партер {sectorPrices.Партер && `— ${sectorPrices.Партер} ₽`}</span>                    </div>

                    <div className={styles.legendItem}>
                        <div className={styles.colorBox} style={{ background: '#3498db' }}></div>
                        <span>Амфитеатр {sectorPrices.Амфитеатр && `— ${sectorPrices.Амфитеатр} ₽`}</span>                    </div>

                    <div className={styles.legendItem}>
                        <div className={styles.colorBox} style={{ background: '#e67e22' }}></div>
                        <span>Балкон {sectorPrices.Балкон && `— ${sectorPrices.Балкон} ₽`}</span>                    </div>
                </div>
            </div>


            <div className={styles.infoPanel}>
                <button className={styles.buyButton} onClick={handleBooking} disabled={selectedSeats.length === 0}>
                    Купить
                </button>
            </div>

        </div>
    );
}