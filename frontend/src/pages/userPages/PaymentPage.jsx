import DataInfo from '../../components/payment/DataInfo';
import { useLocation } from 'react-router-dom';
import styles from './PaymentPage.module.css';

export default function PaymentPage() {

    const location = useLocation();
    const { sessionId, selectedSeats } = location.state || {};

    return(
        <div className={styles.container}>
            <DataInfo sessionId={sessionId} selectedSeats={selectedSeats} />
        </div>
    )
}