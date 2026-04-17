import DataManagementPage from './DataManagementPage';
import StatisticsPage from './StatisticsPage';
import LoggingPage from '../../components/admin/LoggingPage';
import styles from './AdminMainPage.module.css';
import { useNavigate } from 'react-router-dom';

export default function AdminMainPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <h1>Админ панель</h1>
            <div className={styles.buttonsContainer}>
                <button className={styles.actionButton} onClick={() => navigate('/admin/data-management')}>Управление данными</button>
                <button className={styles.actionButton} onClick={() => navigate('/admin/statistics')}>Статистика</button>
            </div>

            <div className={styles.loggingContainer}>
                <LoggingPage />
            </div>
        </div>
    )
}