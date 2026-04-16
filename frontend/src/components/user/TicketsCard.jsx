import styles from './TicketsCard.module.css'

export default function TicketsCard({ ticket, onReturnClick }) {
    const reversed = ticket.date?.split('-').reverse().join('-');


    return (
        <div className={styles.ticketCard}>
            {ticket.status === "продан" && (
                <>
                    <div className={styles.title}>{ticket.play_title}</div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Дата:</span>
                            <span className={styles.value}>{reversed}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Время:</span>
                            <span className={styles.value}>{ticket.time}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ряд / Место:</span>
                            <span className={styles.value}>{ticket.row} / {ticket.seat}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Цена:</span>
                            <span className={styles.value}>{ticket.price} ₽</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onReturnClick(ticket.ticket_id)}
                        className={styles.returnButton}
                    >
                        Вернуть билет
                    </button>
                </>
            )}
        </div>
    )
}