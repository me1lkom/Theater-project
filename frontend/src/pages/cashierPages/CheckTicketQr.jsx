import { useParams } from 'react-router-dom';
import { useQRverification } from '../../hooks/useQRverification';
import { useMarkTicketQR } from '../../hooks/useMarkTicketQR';
import styles from './CheckTicketQr.module.css';

export default function CheckTicketQr() {
    const { id } = useParams();
    const { status, loading, error } = useQRverification(id);
    const { response } = useMarkTicketQR();

    const handleMarkTicket = async() => {
        response(id)
    }

    console.log(status);

    if (loading) return <div className="loading loadingCenter">Загрузка...</div>;
    if (error) return <div className="error errorCenter">Ошибка: {error}</div>;
    if (!id) return <div className="loading loadingCenter">Отсканируйте билет</div>;
    if (!status) return <div className="loading loadingCenter">Нет данных</div>;

    return (
        <div className={styles.container}>
            <h1>Проверка билета</h1>

            <div className={status.valid === true ? styles.statusValid : styles.statusInvalid}>
                {status.valid === true ? 'Билет действителен' : 'Билет недействителен'}
            </div>

            <div className={styles.infoBlock}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>ID билета:</span>
                    <span className={styles.value}>{status.ticket_id}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Статус:</span>
                    <span className={styles.value}>{status.status}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Можно войти:</span>
                    <span className={styles.value}>{status.can_enter === true ? 'Да' : 'Нет'}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Сообщение:</span>
                    <span className={styles.value}>{status.message}</span>
                </div>
            </div>

            {status.ticket_info && (
                <div className={styles.infoBlock}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Спектакль:</span>
                        <span className={styles.value}>{status.ticket_info.play}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Дата:</span>
                        <span className={styles.value}>{status.ticket_info.date}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Время:</span>
                        <span className={styles.value}>{status.ticket_info.time}</span>
                    </div>
                </div>
            )}

            <button 
                onClick={handleMarkTicket}
                className={styles.markTicket}
            >
                Отметить
            </button>
        </div>
    );
}