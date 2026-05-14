import styles from './TicketsCard.module.css'

export default function TicketsCard({ ticket, handleReturnClick }) {
    const purchase_date_reverse = ticket?.purchase_date.slice(0, 10).split('-').reverse().join('-');
    const play_date = ticket?.session.date.split('-').reverse().join('-');

    return (
        <div className={styles.ticketCard}>
            <div className={styles.infoGrid}>
                <div className={styles.ticketInfo}>
                    <span className={styles.label}>ID билета: </span>
                    <span className={styles.value}>{ticket.ticket_id}</span>
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.name}>
                        <span className={styles.label}>Имя:</span>
                        <span className={styles.value}>{ticket.user.name}</span>
                    </div>
                    <div className={styles.email}>
                        <span className={styles.label}>Email:</span>
                        <span className={styles.value}>{ticket.user.email}</span>
                    </div>

                    <div className={styles.phone}>
                        <span className={styles.label}>Телефон:</span>
                        <span className={styles.value}>{ticket.user.phone}</span>
                    </div>
                </div>
                <div className={styles.playInfo}>
                    <div className={styles.title}>
                        <span className={styles.label}>Название: </span>
                        <span className={styles.value}>{ticket.session.play}</span>
                    </div>
                    <div className={styles.seat}>
                        <span className={styles.label}>Ряд / Место:</span>
                        <span className={styles.value}>{ticket.seat.row} / {ticket.seat.number}</span>
                    </div>
                    <div className={styles.date}>
                        <span className={styles.label}>Дата: </span>
                        <span className={styles.value}>{play_date}</span>
                    </div>

                </div>
                <div className={styles.paymentInfo}>
                    <div className={styles.purchaseDate}>
                        <span className={styles.label}>Дата покупки:</span>
                        <span className={styles.value}>{purchase_date_reverse}</span>
                    </div>

                    <div className={styles.price}>
                        <span className={styles.label}>Цена:</span>
                        <span className={styles.value}>{ticket.price}₽</span>
                    </div>
                </div>
            </div>
            <button
                className={styles.returnButton}
                onClick={() => handleReturnClick(ticket.ticket_id)}
            >
                Возврат
            </button>
        </div>
    )
}