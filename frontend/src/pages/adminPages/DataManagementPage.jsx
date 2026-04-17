import styles from './DataManagementPage.module.css';
import ControlPlayData from '../../components/admin/ControlPlayData';
import ControlSessionData from '../../components/admin/ControlSessionData';
export default function DataManagementPage() {
    return (
        <div className={styles.container}>
            <h1>Управление данными</h1>
            <h2>Управление данными о спектаклях</h2>
            <ControlPlayData />

            <h2>Управление данными о сеансах</h2>
            <ControlSessionData />
        </div>
    )
}