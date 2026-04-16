import { useGetMe } from '../../hooks/useGetMe';
import styles from './UserInfo.module.css';

export default function UserInfo() {
    const { me, loading, error } = useGetMe();

    return (
        <div className={styles.userInfo}>
            {loading ? (
                <p>Загрузка...</p>
            ) : error ? (
                <p className={styles.error}>Ошибка: {error}</p>
            ) : me && (
                <div className={styles.userData}>
                    <span><strong>Никнейм:</strong> {me.username}</span>
                    <span><strong>Почта:</strong> {me.email}</span>
                    <span><strong>Имя:</strong> {me.first_name}</span>
                    <span><strong>Фамилия:</strong> {me.last_name}</span>
                    <span><strong>Телефон:</strong> {me.phone || 'Не указан'}</span>
                    {me.role === "admin" && <span><strong>Роль:</strong> {me.role}</span>}
                </div>
            )}
        </div>
    )
}