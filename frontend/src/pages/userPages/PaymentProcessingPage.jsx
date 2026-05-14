import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
// import styles from './PaymentProcessingPage.module.css';
import { useGetPaymentStatus } from '../../hooks/useGetPaymentStatus';
import useAuthStore from '../../store/useAuthStore';

export default function PaymentProcessingPage() {
    const navigate = useNavigate();
    const paymentId = useAuthStore(state => state.paymentId);
    const { clearPaymentId } = useAuthStore();
    const { status, error } = useGetPaymentStatus(paymentId);


    console.log('paymentId:', paymentId);


    useEffect(() => {
        if (status === 'succeeded') {
            navigate('/profile', {
                replace: true,
                state: { text: 'Оплата прошла успешно!', icon: 'success' }
            });
            clearPaymentId();
        } else if (status === 'fail') {
            navigate('/profile', {
                replace: true,
                state: { text: 'Оплата не прошла!', icon: 'error' }
            });
            clearPaymentId();
        }
    }, [status, navigate]);

    if (!paymentId) return <h1>Нет данных об оплате</h1>;

    return (
        <h1>Подождите, идёт подтверждение оплаты...</h1>
    );
}