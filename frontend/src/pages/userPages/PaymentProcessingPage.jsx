import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './PaymentProcessingPage.module.css';
import { useGetPaymentStatus } from '../../hooks/useGetPaymentStatus';
import { useGetBulkTicketPDF } from '../../hooks/useGetBulkTicketPDF';
import useAuthStore from '../../store/useAuthStore';

export default function PaymentProcessingPage() {
    const navigate = useNavigate();
    const paymentId = useAuthStore(state => state.paymentId);
    const { clearPaymentId } = useAuthStore();
    const { status, error } = useGetPaymentStatus(paymentId);

    const [ticketStatus, setTicketStatus] = useState(null);

    const { downloadTickets, loading } = useGetBulkTicketPDF();

    console.log('paymentId:', paymentId);


    useEffect(() => {
        if (status === 'succeeded') {
            setTicketStatus('succeeded');
        } else if (status === 'expired') {
            setTicketStatus('expired');
        }
    }, [status]);

    const handleRerurnToProfile = () => {
        navigate('/profile', {replace: true});
        clearPaymentId();
    };

    if (!paymentId) return <h1>Нет данных об оплате</h1>;

    return (
        <>
            {ticketStatus === 'succeeded' &&
                <>
                    <h1>Оплата прошла успешно!</h1>
                    <div className={styles.actionButton}>
                        <button
                            onClick={() => downloadTickets(paymentId)}
                            className={styles.button}
                            disabled={loading}
                        >
                            Скачать билет(ы)
                        </button>

                        <button
                            onClick={handleRerurnToProfile}
                            className={styles.button}
                            disabled={loading}
                        >
                            Перейти в профиль
                        </button>
                    </div>

                </>
            }
            {ticketStatus === 'expired' &&
                <>
                    <h1>Оплата не прошла!</h1>
                    <button
                        onClick={handleRerurnToProfile}
                        className={styles.button}
                        disabled={loading}
                    >
                        Перейти в профиль
                    </button>
                </>
            }

            {ticketStatus === null && <h1>Подождите, идёт подтверждение оплаты...</h1>}


        </>
    );
}