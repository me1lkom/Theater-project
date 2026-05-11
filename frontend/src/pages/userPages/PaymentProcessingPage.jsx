import { useNavigate } from 'react-router-dom';
import styles from './PaymentProcessingPage.module.css';

export default function PaymentProcessingPage() {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate(`/profile`);
    }

    return (
        <div className={styles.container}>
            <h1>Проверка оплаты в разработке</h1>
            <button
                onClick={handleProfileClick}
                className={styles.button}
            >
                Вернуться в профиль
            </button>
        </div>
    )
}