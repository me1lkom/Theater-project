import styles from './BookingPanel.module.css';

export default function BookingPanel({ selectedSeatsCount, onBooking, price }) {
    return (
        <div className={styles.infoPanel}>
            <div>Выбрано мест: <strong>{selectedSeatsCount}</strong></div>
            <div>Сумма: <strong>{price} ₽</strong></div>
            <button 
                className={styles.buyButton} 
                onClick={onBooking} 
                disabled={selectedSeatsCount === 0}
            >
                Купить
            </button>
        </div>
    );
}