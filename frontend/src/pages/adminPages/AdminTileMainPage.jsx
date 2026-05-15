import DataManagementPage from './DataManagementPage';
import StatisticsPage from './StatisticsPage';
import LoggingPage from '../../components/admin/logging/LoggingPage';

import styles from './AdminTileMainPage.module.css';
import { useState } from 'react';
import { useBackup } from '../../hooks/useBackup';

export default function AdminMainPage() {

    const { downloadBackup, loading, error } = useBackup();

    const [activeTab, setActiveTab] = useState(null);


    const handleSelectTile = (data) => {
        if (activeTab === data) setActiveTab(null)
        else setActiveTab(data)
    }

    const renderContent = () => {
        if (activeTab === null) return null
        if (activeTab === 'data-manage') return <DataManagementPage />
        if (activeTab === 'statistics') return <StatisticsPage />
        if (activeTab === 'logging') return <LoggingPage />
    }

    return (
        <div className={styles.container}>
            {loading && <div className="loading loadingCenter">Загрузка...</div>}
            {error && <div className="error errorCenter">Ошибка: {error}</div>}
            <h1>Админ панель</h1>
            <div className={styles.buttonsContainer}>
                <button className={styles.actionButton} onClick={() => handleSelectTile('data-manage')}>Управление данными</button>
                <button className={styles.actionButton} onClick={() => handleSelectTile('statistics')}>Статистика</button>
                <button className={styles.actionButton} onClick={() => handleSelectTile('logging')}>Логи</button>

                <button
                    className={styles.actionButton}
                    onClick={downloadBackup}
                    disabled={loading}
                >
                    {loading ? 'Скачивание...' : 'Скачать бэкап'}
                </button>
            </div>

            <div className={styles.loggingContainer}>
                {renderContent()}
            </div>
        </div>
    )
}