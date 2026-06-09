import { useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import styles from './SeatMap.module.css';

export default function SeatMap({ seats, availableSeats, selectedSeats, onSeatToggle, sessionId, sectorPrices }) {
    const svgRef = useRef(null);
    const transformRef = useRef(null);
    const initialized = useRef(false);
    const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

    console.log(sectorPrices);

    useEffect(() => {
        setLocalSelectedSeats(selectedSeats);
    }, [selectedSeats]);

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

    const updateSeatColor = (rect, seatId, isSelected) => {
        const sector = rect.getAttribute('data-sector');

        if (isSelected) {
            rect.classList.add('selected');
            rect.setAttribute('fill', '#f1c40f');
        } else {
            rect.classList.remove('selected');
            if (sector === 'Партер') rect.setAttribute('fill', '#2ecc71');
            else if (sector === 'Амфитеатр') rect.setAttribute('fill', '#3498db');
            else if (sector === 'Балкон') rect.setAttribute('fill', '#e67e22');
        }
    };

    const initSeatMap = () => {
        if (!seats || !availableSeats) return;
        if (!svgRef.current) return;

        const svg = svgRef.current;
        const rectangles = svg.querySelectorAll('rect');

        const seatRects = Array.from(rectangles).filter(rect => {
            const y = parseFloat(rect.getAttribute('y'));
            return y >= 94 && y <= 682 && rect.getAttribute('width') === '15';
        });

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
                rect.setAttribute('cursor', 'default');
            } else {
                if (seatData.sector_name === 'Партер') rect.setAttribute('fill', '#2ecc71');
                else if (seatData.sector_name === 'Амфитеатр') rect.setAttribute('fill', '#3498db');
                else if (seatData.sector_name === 'Балкон') rect.setAttribute('fill', '#e67e22');
                rect.setAttribute('cursor', 'pointer');
                rect.removeAttribute('opacity');
            }

            rect.onclick = (e) => {
                e.stopPropagation();
                const seatId = parseInt(rect.getAttribute('data-seat-id'));
                const isTaken = rect.classList.contains('taken');
                const priceSelectedSeat = availableSeats.seats?.find(seat => seat.seat_id === seatId)?.price || 0;
                const isSelected = rect.classList.contains('selected');

                if (isTaken) return;

                if (isSelected) {
                    rect.classList.remove('selected');
                    const sector = rect.getAttribute('data-sector');
                    if (sector === 'Партер') rect.setAttribute('fill', '#2ecc71');
                    else if (sector === 'Амфитеатр') rect.setAttribute('fill', '#3498db');
                    else if (sector === 'Балкон') rect.setAttribute('fill', '#e67e22');
                } else {
                    rect.classList.add('selected');
                    rect.setAttribute('fill', '#f1c40f');
                }

                onSeatToggle(seatId, priceSelectedSeat);
            };

            rect.onmouseenter = (e) => {
                const price = availableSeats.seats?.find(seat => seat.seat_id === seatData.seat_id)?.price || 0;
                const text = `${seatData.sector_name}, ряд ${seatData.row_number}, место ${seatData.seat_number}, цена: ${price} ₽`;


                setTooltip({
                    visible: true,
                    x: e.clientX + 10,
                    y: e.clientY - 20,
                    text: text
                });
            };

            rect.onmouseleave = () => {
                setTooltip({ visible: false, x: 0, y: 0, text: '' });
            };
        });

        localSelectedSeats.forEach(seatId => {
            const rect = svg.querySelector(`[data-seat-id="${seatId}"]`);
            if (rect && !rect.classList.contains('taken')) {
                rect.classList.add('selected');
                rect.setAttribute('fill', '#f1c40f');
            }
        });
    };

    useEffect(() => {
        resetSeats();
        setLocalSelectedSeats([]);
        initialized.current = false;
    }, [sessionId]);

    useEffect(() => {
        if (!seats || !availableSeats) return;
        if (!svgRef.current) return;
        if (initialized.current) return;

        initSeatMap();
        initialized.current = true;
    }, [seats, availableSeats]);

    return (

        <div className={styles.svgContainer}>
            <div className={styles.controls}>
                <button className={styles.zoomBtn} onClick={() => transformRef.current?.zoomIn()}>+</button>
                <button className={styles.zoomBtn} onClick={() => transformRef.current?.zoomOut()}>-</button>
                <button className={styles.zoomBtn} onClick={() => transformRef.current?.resetTransform()}>⟳</button>
            </div>

            {tooltip.visible && (
                <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
                    {tooltip.text}
                </div>
            )}

            <TransformWrapper
                ref={transformRef}
                initialScale={1}
                minScale={0.8}
                maxScale={3}
                limitToBounds={true}
                centerOnInit={true}
                wheel={{ step: 0.01 }}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <TransformComponent>
                        <svg ref={svgRef} viewBox="0 0 623 710" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <svg ref={svgRef} viewBox="0 0 623 710" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_405_617)">
                                    <rect width="623" height="710" fill="white" />
                                    <path d="M623 -17.5C623 1.72819 590.181 20.1689 531.764 33.7652C473.346 47.3616 394.115 55 311.5 55C228.885 55 149.654 47.3616 91.2363 33.7652C32.8187 20.1689 1.24745e-05 1.72821 0 -17.5L311.5 -17.5H623Z" fill="#D9D9D9" />
                                    <rect x="2" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="94" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="126" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="158" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="190" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="222" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="254" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="286" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="318" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="385" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="417" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="449" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="2" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="32" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="62" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="92" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="516" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="546" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="576" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="606" y="481" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="554" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="586" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="618" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="650" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="122" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="152" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="182" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="212" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="242" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="272" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="336" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="366" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="396" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="426" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="456" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <rect x="486" y="682" width="15" height="15" fill="#D9D9D9" />
                                    <path d="M277.761 532V517.455H286.54V519.017H279.523V523.562H283.216C284.258 523.562 285.136 523.733 285.851 524.074C286.571 524.415 287.115 524.895 287.484 525.516C287.858 526.136 288.045 526.867 288.045 527.71C288.045 528.553 287.858 529.296 287.484 529.94C287.115 530.584 286.571 531.089 285.851 531.453C285.136 531.818 284.258 532 283.216 532H277.761ZM279.523 530.466H283.216C283.879 530.466 284.44 530.333 284.899 530.068C285.363 529.798 285.714 529.453 285.95 529.031C286.192 528.605 286.312 528.155 286.312 527.682C286.312 526.986 286.045 526.387 285.51 525.885C284.975 525.378 284.21 525.125 283.216 525.125H279.523V530.466ZM293.928 532.256C293.237 532.256 292.609 532.125 292.046 531.865C291.482 531.6 291.035 531.219 290.703 530.722C290.372 530.22 290.206 529.614 290.206 528.903C290.206 528.278 290.329 527.772 290.576 527.384C290.822 526.991 291.151 526.683 291.563 526.46C291.975 526.238 292.429 526.072 292.926 525.963C293.428 525.849 293.933 525.759 294.439 525.693C295.102 525.608 295.64 525.544 296.051 525.501C296.468 525.454 296.771 525.376 296.961 525.267C297.155 525.158 297.252 524.969 297.252 524.699V524.642C297.252 523.941 297.06 523.397 296.676 523.009C296.298 522.62 295.722 522.426 294.951 522.426C294.15 522.426 293.523 522.601 293.069 522.952C292.614 523.302 292.294 523.676 292.11 524.074L290.519 523.506C290.803 522.843 291.182 522.327 291.655 521.957C292.133 521.583 292.654 521.323 293.218 521.176C293.786 521.025 294.345 520.949 294.894 520.949C295.244 520.949 295.647 520.991 296.101 521.077C296.56 521.157 297.003 521.325 297.429 521.581C297.86 521.837 298.218 522.223 298.502 522.739C298.786 523.255 298.928 523.946 298.928 524.812V532H297.252V530.523H297.167C297.053 530.759 296.864 531.013 296.598 531.283C296.333 531.553 295.98 531.782 295.54 531.972C295.1 532.161 294.562 532.256 293.928 532.256ZM294.184 530.75C294.846 530.75 295.405 530.62 295.86 530.359C296.319 530.099 296.665 529.763 296.897 529.351C297.133 528.939 297.252 528.506 297.252 528.051V526.517C297.181 526.602 297.025 526.68 296.783 526.751C296.546 526.818 296.272 526.877 295.959 526.929C295.651 526.976 295.351 527.019 295.057 527.057C294.768 527.09 294.534 527.118 294.354 527.142C293.918 527.199 293.511 527.291 293.132 527.419C292.758 527.542 292.455 527.729 292.223 527.98C291.996 528.226 291.882 528.562 291.882 528.989C291.882 529.571 292.098 530.011 292.529 530.31C292.964 530.603 293.516 530.75 294.184 530.75ZM301.021 532V530.438H301.419C301.746 530.438 302.018 530.374 302.236 530.246C302.454 530.113 302.629 529.884 302.761 529.557C302.899 529.225 303.003 528.766 303.074 528.179C303.15 527.587 303.204 526.834 303.237 525.92L303.436 521.091H310.709V532H309.033V522.653H305.027L304.857 526.545C304.819 527.44 304.738 528.229 304.615 528.911C304.497 529.588 304.314 530.156 304.068 530.615C303.827 531.074 303.505 531.42 303.102 531.652C302.7 531.884 302.196 532 301.589 532H301.021ZM313.784 532V521.091H315.46V525.835H316.568L320.489 521.091H322.648L318.244 526.347L322.705 532H320.545L316.966 527.398H315.46V532H313.784ZM328.509 532.227C327.524 532.227 326.66 531.993 325.917 531.524C325.178 531.055 324.6 530.4 324.184 529.557C323.772 528.714 323.566 527.729 323.566 526.602C323.566 525.466 323.772 524.474 324.184 523.626C324.6 522.779 325.178 522.121 325.917 521.652C326.66 521.183 327.524 520.949 328.509 520.949C329.494 520.949 330.355 521.183 331.094 521.652C331.837 522.121 332.415 522.779 332.827 523.626C333.244 524.474 333.452 525.466 333.452 526.602C333.452 527.729 333.244 528.714 332.827 529.557C332.415 530.4 331.837 531.055 331.094 531.524C330.355 531.993 329.494 532.227 328.509 532.227ZM328.509 530.722C329.257 530.722 329.873 530.53 330.355 530.146C330.838 529.763 331.196 529.259 331.428 528.634C331.66 528.009 331.776 527.331 331.776 526.602C331.776 525.873 331.66 525.194 331.428 524.564C331.196 523.934 330.838 523.425 330.355 523.037C329.873 522.649 329.257 522.455 328.509 522.455C327.761 522.455 327.145 522.649 326.662 523.037C326.179 523.425 325.822 523.934 325.59 524.564C325.358 525.194 325.242 525.873 325.242 526.602C325.242 527.331 325.358 528.009 325.59 528.634C325.822 529.259 326.179 529.763 326.662 530.146C327.145 530.53 327.761 530.722 328.509 530.722ZM343.312 525.778V527.341H337.289V525.778H343.312ZM337.687 521.091V532H336.011V521.091H337.687ZM344.59 521.091V532H342.914V521.091H344.59Z" fill="black" />
                                    <path d="M259.358 363H257.511L262.852 348.455H264.67L270.011 363H268.165L263.818 350.756H263.705L259.358 363ZM260.04 357.318H267.483V358.881H260.04V357.318ZM278.016 360.727L281.822 352.091H283.413L278.697 363H277.334L272.703 352.091H274.266L278.016 360.727ZM273.726 352.091V363H272.05V352.091H273.726ZM282.305 363V352.091H283.982V363H282.305ZM291.482 366.722V348.455H293.158V366.722H291.482ZM291.482 363.227C290.743 363.227 290.071 363.095 289.464 362.83C288.858 362.56 288.338 362.179 287.902 361.686C287.466 361.189 287.13 360.595 286.893 359.903C286.657 359.212 286.538 358.445 286.538 357.602C286.538 356.75 286.657 355.978 286.893 355.287C287.13 354.591 287.466 353.994 287.902 353.497C288.338 353 288.858 352.619 289.464 352.354C290.071 352.084 290.743 351.949 291.482 351.949H291.993V363.227H291.482ZM291.482 361.722H291.766V353.455H291.482C290.923 353.455 290.438 353.568 290.026 353.795C289.614 354.018 289.273 354.323 289.003 354.712C288.738 355.095 288.539 355.536 288.406 356.033C288.278 356.53 288.214 357.053 288.214 357.602C288.214 358.331 288.33 359.009 288.562 359.634C288.795 360.259 289.152 360.763 289.635 361.146C290.118 361.53 290.733 361.722 291.482 361.722ZM293.158 363.227H292.646V351.949H293.158C293.896 351.949 294.569 352.084 295.175 352.354C295.781 352.619 296.302 353 296.737 353.497C297.173 353.994 297.509 354.591 297.746 355.287C297.982 355.978 298.101 356.75 298.101 357.602C298.101 358.445 297.982 359.212 297.746 359.903C297.509 360.595 297.173 361.189 296.737 361.686C296.302 362.179 295.781 362.56 295.175 362.83C294.569 363.095 293.896 363.227 293.158 363.227ZM293.158 361.722C293.721 361.722 294.206 361.613 294.614 361.395C295.026 361.172 295.364 360.869 295.629 360.486C295.899 360.098 296.098 359.657 296.226 359.165C296.358 358.668 296.425 358.147 296.425 357.602C296.425 356.873 296.309 356.194 296.077 355.564C295.845 354.934 295.487 354.425 295.004 354.037C294.521 353.649 293.906 353.455 293.158 353.455H292.874V361.722H293.158ZM302.339 360.528L307.595 352.091H309.527V363H307.85V354.562L302.623 363H300.663V352.091H302.339V360.528ZM311.112 353.653V352.091H319.976V353.653H316.396V363H314.72V353.653H311.112ZM326.428 363.227C325.377 363.227 324.47 362.995 323.708 362.531C322.951 362.062 322.366 361.409 321.954 360.571C321.547 359.728 321.343 358.748 321.343 357.631C321.343 356.513 321.547 355.528 321.954 354.676C322.366 353.819 322.939 353.152 323.673 352.673C324.411 352.19 325.273 351.949 326.258 351.949C326.826 351.949 327.387 352.044 327.941 352.233C328.495 352.422 328.999 352.73 329.454 353.156C329.908 353.578 330.271 354.136 330.54 354.832C330.81 355.528 330.945 356.385 330.945 357.403V358.114H322.536V356.665H329.241C329.241 356.049 329.118 355.5 328.871 355.017C328.63 354.534 328.284 354.153 327.835 353.874C327.389 353.594 326.864 353.455 326.258 353.455C325.59 353.455 325.013 353.62 324.525 353.952C324.042 354.278 323.67 354.705 323.41 355.23C323.149 355.756 323.019 356.319 323.019 356.92V357.886C323.019 358.71 323.161 359.409 323.445 359.982C323.734 360.55 324.134 360.983 324.646 361.281C325.157 361.575 325.751 361.722 326.428 361.722C326.869 361.722 327.266 361.66 327.621 361.537C327.981 361.409 328.291 361.22 328.552 360.969C328.812 360.713 329.013 360.396 329.156 360.017L330.775 360.472C330.604 361.021 330.318 361.504 329.915 361.92C329.513 362.332 329.016 362.654 328.424 362.886C327.832 363.114 327.167 363.227 326.428 363.227ZM336.705 363.256C336.014 363.256 335.387 363.125 334.823 362.865C334.26 362.6 333.812 362.219 333.481 361.722C333.149 361.22 332.984 360.614 332.984 359.903C332.984 359.278 333.107 358.772 333.353 358.384C333.599 357.991 333.928 357.683 334.34 357.46C334.752 357.238 335.207 357.072 335.704 356.963C336.206 356.849 336.71 356.759 337.217 356.693C337.879 356.608 338.417 356.544 338.829 356.501C339.246 356.454 339.549 356.376 339.738 356.267C339.932 356.158 340.029 355.969 340.029 355.699V355.642C340.029 354.941 339.837 354.397 339.454 354.009C339.075 353.62 338.5 353.426 337.728 353.426C336.928 353.426 336.3 353.601 335.846 353.952C335.391 354.302 335.072 354.676 334.887 355.074L333.296 354.506C333.58 353.843 333.959 353.327 334.433 352.957C334.911 352.583 335.432 352.323 335.995 352.176C336.563 352.025 337.122 351.949 337.671 351.949C338.022 351.949 338.424 351.991 338.879 352.077C339.338 352.157 339.781 352.325 340.207 352.581C340.638 352.837 340.995 353.223 341.279 353.739C341.563 354.255 341.705 354.946 341.705 355.812V363H340.029V361.523H339.944C339.83 361.759 339.641 362.013 339.376 362.283C339.111 362.553 338.758 362.782 338.317 362.972C337.877 363.161 337.34 363.256 336.705 363.256ZM336.961 361.75C337.624 361.75 338.183 361.62 338.637 361.359C339.096 361.099 339.442 360.763 339.674 360.351C339.911 359.939 340.029 359.506 340.029 359.051V357.517C339.958 357.602 339.802 357.68 339.56 357.751C339.324 357.818 339.049 357.877 338.737 357.929C338.429 357.976 338.128 358.019 337.835 358.057C337.546 358.09 337.311 358.118 337.131 358.142C336.696 358.199 336.289 358.291 335.91 358.419C335.536 358.542 335.233 358.729 335.001 358.98C334.773 359.226 334.66 359.562 334.66 359.989C334.66 360.571 334.875 361.011 335.306 361.31C335.742 361.603 336.293 361.75 336.961 361.75ZM343.28 353.653V352.091H352.144V353.653H348.564V363H346.888V353.653H343.28ZM354.589 367.091V352.091H356.208V353.824H356.407C356.53 353.634 356.701 353.393 356.918 353.099C357.141 352.801 357.458 352.536 357.87 352.304C358.287 352.067 358.85 351.949 359.56 351.949C360.479 351.949 361.289 352.179 361.989 352.638C362.69 353.097 363.237 353.748 363.63 354.591C364.023 355.434 364.219 356.428 364.219 357.574C364.219 358.729 364.023 359.731 363.63 360.578C363.237 361.421 362.692 362.074 361.996 362.538C361.3 362.998 360.498 363.227 359.589 363.227C358.888 363.227 358.327 363.111 357.906 362.879C357.484 362.643 357.16 362.375 356.933 362.077C356.705 361.774 356.53 361.523 356.407 361.324H356.265V367.091H354.589ZM356.237 357.545C356.237 358.369 356.357 359.096 356.599 359.726C356.84 360.351 357.193 360.841 357.657 361.196C358.121 361.546 358.689 361.722 359.362 361.722C360.062 361.722 360.647 361.537 361.116 361.168C361.589 360.794 361.944 360.292 362.181 359.662C362.423 359.027 362.543 358.322 362.543 357.545C362.543 356.778 362.425 356.087 362.188 355.472C361.956 354.851 361.603 354.361 361.13 354.001C360.661 353.637 360.072 353.455 359.362 353.455C358.68 353.455 358.107 353.627 357.643 353.973C357.179 354.314 356.828 354.792 356.592 355.408C356.355 356.018 356.237 356.731 356.237 357.545Z" fill="black" />
                                    <path d="M284.642 67.4545V82H282.881V69.017H275.551V82H273.79V67.4545H284.642ZM291.178 82.2557C290.487 82.2557 289.859 82.1255 289.296 81.8651C288.732 81.5999 288.285 81.2188 287.953 80.7216C287.622 80.2197 287.456 79.6136 287.456 78.9034C287.456 78.2784 287.579 77.7718 287.826 77.3835C288.072 76.9905 288.401 76.6828 288.813 76.4602C289.225 76.2377 289.679 76.072 290.176 75.9631C290.678 75.8494 291.183 75.7595 291.689 75.6932C292.352 75.608 292.89 75.544 293.301 75.5014C293.718 75.4541 294.021 75.3759 294.211 75.267C294.405 75.1581 294.502 74.9687 294.502 74.6989V74.642C294.502 73.9413 294.31 73.3968 293.926 73.0085C293.548 72.6203 292.972 72.4261 292.201 72.4261C291.4 72.4261 290.773 72.6013 290.319 72.9517C289.864 73.3021 289.544 73.6761 289.36 74.0739L287.769 73.5057C288.053 72.8428 288.432 72.3267 288.905 71.9574C289.383 71.5833 289.904 71.3229 290.468 71.1761C291.036 71.0246 291.595 70.9489 292.144 70.9489C292.494 70.9489 292.897 70.9915 293.351 71.0767C293.81 71.1572 294.253 71.3253 294.679 71.581C295.11 71.8366 295.468 72.2225 295.752 72.7386C296.036 73.2547 296.178 73.946 296.178 74.8125V82H294.502V80.5227H294.417C294.303 80.7595 294.114 81.0128 293.848 81.2827C293.583 81.5526 293.23 81.7822 292.79 81.9716C292.35 82.161 291.812 82.2557 291.178 82.2557ZM291.434 80.75C292.096 80.75 292.655 80.6198 293.11 80.3594C293.569 80.099 293.915 79.7628 294.147 79.3509C294.383 78.9389 294.502 78.5057 294.502 78.0511V76.517C294.431 76.6023 294.275 76.6804 294.033 76.7514C293.796 76.8177 293.522 76.8769 293.209 76.929C292.901 76.9763 292.601 77.0189 292.307 77.0568C292.018 77.09 291.784 77.1184 291.604 77.142C291.168 77.1989 290.761 77.2912 290.382 77.419C290.008 77.5421 289.705 77.7292 289.473 77.9801C289.246 78.2263 289.132 78.5625 289.132 78.9886C289.132 79.571 289.348 80.0114 289.779 80.3097C290.214 80.6032 290.766 80.75 291.434 80.75ZM299.237 86.0909V71.0909H300.857V72.8239H301.055C301.179 72.6345 301.349 72.393 301.567 72.0994C301.789 71.8011 302.107 71.536 302.518 71.304C302.935 71.0672 303.499 70.9489 304.209 70.9489C305.127 70.9489 305.937 71.1785 306.638 71.6378C307.339 72.0971 307.885 72.7481 308.278 73.5909C308.671 74.4337 308.868 75.428 308.868 76.5739C308.868 77.7292 308.671 78.7306 308.278 79.5781C307.885 80.4209 307.341 81.0743 306.645 81.5384C305.949 81.9976 305.146 82.2273 304.237 82.2273C303.536 82.2273 302.975 82.1113 302.554 81.8793C302.133 81.6425 301.808 81.375 301.581 81.0767C301.354 80.7737 301.179 80.5227 301.055 80.3239H300.913V86.0909H299.237ZM300.885 76.5455C300.885 77.3693 301.006 78.0961 301.247 78.7259C301.489 79.3509 301.841 79.8409 302.305 80.196C302.769 80.5464 303.338 80.7216 304.01 80.7216C304.711 80.7216 305.295 80.5369 305.764 80.1676C306.238 79.7936 306.593 79.2917 306.83 78.6619C307.071 78.0275 307.192 77.322 307.192 76.5455C307.192 75.7784 307.073 75.0871 306.837 74.4716C306.605 73.8513 306.252 73.3613 305.778 73.0014C305.31 72.6368 304.72 72.4545 304.01 72.4545C303.328 72.4545 302.755 72.6274 302.291 72.973C301.827 73.3139 301.477 73.7921 301.24 74.4077C301.003 75.0185 300.885 75.7311 300.885 76.5455ZM309.999 72.6534V71.0909H318.863V72.6534H315.283V82H313.607V72.6534H309.999ZM325.315 82.2273C324.264 82.2273 323.357 81.9953 322.595 81.5312C321.837 81.0625 321.252 80.4091 320.841 79.571C320.433 78.7282 320.23 77.7481 320.23 76.6307C320.23 75.5133 320.433 74.5284 320.841 73.6761C321.252 72.8191 321.825 72.1515 322.559 71.6733C323.298 71.1903 324.16 70.9489 325.145 70.9489C325.713 70.9489 326.274 71.0436 326.828 71.233C327.382 71.4223 327.886 71.7301 328.341 72.1562C328.795 72.5777 329.157 73.1364 329.427 73.8324C329.697 74.5284 329.832 75.3854 329.832 76.4034V77.1136H321.423V75.6648H328.127C328.127 75.0492 328.004 74.5 327.758 74.017C327.517 73.5341 327.171 73.1529 326.721 72.8736C326.276 72.5942 325.751 72.4545 325.145 72.4545C324.477 72.4545 323.899 72.6203 323.412 72.9517C322.929 73.2784 322.557 73.7045 322.297 74.2301C322.036 74.7557 321.906 75.3191 321.906 75.9205V76.8864C321.906 77.7102 322.048 78.4086 322.332 78.9815C322.621 79.5497 323.021 79.983 323.532 80.2812C324.044 80.5748 324.638 80.7216 325.315 80.7216C325.755 80.7216 326.153 80.66 326.508 80.5369C326.868 80.4091 327.178 80.2197 327.439 79.9688C327.699 79.7131 327.9 79.3958 328.042 79.017L329.662 79.4716C329.491 80.0208 329.205 80.5038 328.802 80.9205C328.4 81.3324 327.903 81.6544 327.311 81.8864C326.719 82.1136 326.054 82.2273 325.315 82.2273ZM332.382 86.0909V71.0909H334.001V72.8239H334.2C334.323 72.6345 334.493 72.393 334.711 72.0994C334.934 71.8011 335.251 71.536 335.663 71.304C336.08 71.0672 336.643 70.9489 337.353 70.9489C338.272 70.9489 339.082 71.1785 339.782 71.6378C340.483 72.0971 341.03 72.7481 341.423 73.5909C341.816 74.4337 342.012 75.428 342.012 76.5739C342.012 77.7292 341.816 78.7306 341.423 79.5781C341.03 80.4209 340.485 81.0743 339.789 81.5384C339.093 81.9976 338.291 82.2273 337.382 82.2273C336.681 82.2273 336.12 82.1113 335.699 81.8793C335.277 81.6425 334.953 81.375 334.725 81.0767C334.498 80.7737 334.323 80.5227 334.2 80.3239H334.058V86.0909H332.382ZM334.029 76.5455C334.029 77.3693 334.15 78.0961 334.392 78.7259C334.633 79.3509 334.986 79.8409 335.45 80.196C335.914 80.5464 336.482 80.7216 337.154 80.7216C337.855 80.7216 338.44 80.5369 338.909 80.1676C339.382 79.7936 339.737 79.2917 339.974 78.6619C340.216 78.0275 340.336 77.322 340.336 76.5455C340.336 75.7784 340.218 75.0871 339.981 74.4716C339.749 73.8513 339.396 73.3613 338.923 73.0014C338.454 72.6368 337.865 72.4545 337.154 72.4545C336.473 72.4545 335.9 72.6274 335.436 72.973C334.972 73.3139 334.621 73.7921 334.385 74.4077C334.148 75.0185 334.029 75.7311 334.029 76.5455Z" fill="black" />
                                    <path d="M288.832 17.5H286.631C286.5 16.8667 286.273 16.3104 285.947 15.831C285.627 15.3516 285.237 14.9491 284.775 14.6236C284.319 14.2921 283.813 14.0436 283.257 13.8778C282.701 13.7121 282.121 13.6293 281.517 13.6293C280.416 13.6293 279.419 13.9074 278.525 14.4638C277.637 15.0201 276.93 15.8398 276.403 16.9229C275.883 18.006 275.622 19.3348 275.622 20.9091C275.622 22.4834 275.883 23.8121 276.403 24.8952C276.93 25.9783 277.637 26.7981 278.525 27.3544C279.419 27.9107 280.416 28.1889 281.517 28.1889C282.121 28.1889 282.701 28.1061 283.257 27.9403C283.813 27.7746 284.319 27.529 284.775 27.2035C285.237 26.872 285.627 26.4666 285.947 25.9872C286.273 25.5019 286.5 24.9455 286.631 24.3182H288.832C288.667 25.2474 288.365 26.079 287.927 26.8129C287.489 27.5468 286.944 28.1712 286.293 28.6861C285.642 29.1951 284.911 29.5827 284.1 29.8491C283.296 30.1154 282.434 30.2486 281.517 30.2486C279.966 30.2486 278.587 29.8698 277.38 29.1122C276.173 28.3546 275.223 27.2775 274.53 25.8807C273.838 24.4839 273.491 22.8267 273.491 20.9091C273.491 18.9915 273.838 17.3343 274.53 15.9375C275.223 14.5407 276.173 13.4635 277.38 12.706C278.587 11.9484 279.966 11.5696 281.517 11.5696C282.434 11.5696 283.296 11.7028 284.1 11.9691C284.911 12.2354 285.642 12.6261 286.293 13.141C286.944 13.65 287.489 14.2714 287.927 15.0053C288.365 15.7333 288.667 16.5649 288.832 17.5ZM307.838 27.9048L307.589 34.2969H305.316V30H304.038V27.9048H307.838ZM292.39 30V11.8182H294.485V27.9759H303.86V11.8182H305.956V30H292.39ZM311.165 30V11.8182H322.138V13.7713H313.366V19.9148H321.569V21.8679H313.366V28.0469H322.28V30H311.165ZM326.106 30V11.8182H328.308V19.9148H338.002V11.8182H340.204V30H338.002V21.8679H328.308V30H326.106ZM345.358 30H343.049L349.725 11.8182H351.998L358.674 30H356.366L350.933 14.6946H350.791L345.358 30ZM346.21 22.8977H355.514V24.8509H346.21V22.8977Z" fill="black" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_405_617">
                                        <rect width="623" height="710" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </svg>
                    </TransformComponent>
                )}
            </TransformWrapper>
        </div>



    );
}