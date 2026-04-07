import { useGetMe } from '../../hooks/useGetMe';

export default function UserInfo() {
    const { me, loading, error } = useGetMe();

    return (
        <div className="user-info">
            {loading ? <p>Загрузка...</p> : error ? <p>Ошибка: {error}</p> : me && (
                <div className="user-data">
                    <span>Никнейм: {me.username}</span>
                    <span>Почта: {me.email}</span>
                    <span>Имя: {me.first_name}</span>
                    <span>Фамилия: {me.last_name}</span>
                    <span>Телефон: {me.phone}</span>
                    {me.role == "admin" && <span>Роль: {me.role}</span>}
                </div>
            )}
        </div>
    )
}