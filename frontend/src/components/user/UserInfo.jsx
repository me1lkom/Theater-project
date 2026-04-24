import { useGetMe } from '../../hooks/useGetMe';
import styles from './UserInfo.module.css';
import { useState, useEffect } from 'react';
import { changingMyInfo } from '../../api/index';
import { getErrorMessage } from '../../utils/getErrorMessage';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function UserInfo() {
    const { me, loading, error, refetch } = useGetMe();
    const [changeData, setChangeData] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
    });

    const MySwal = withReactContent(Swal);


    useEffect(() => {
        if (me) {
            setFormData({
                username: me.username,
                email: me.email,
                first_name: me.first_name,
                last_name: me.last_name,
                phone: me.phone,
            })
        }
    }, [me]);

    const handleUpdateMe = async () => {
        try {
            await changingMyInfo({
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
            })
            await refetch();
            MySwal.fire({
                title: 'Данные успешно изменяны!',
                icon: 'success',
                showConfirmButton: false,
                timer: 2000,
                toast: true,
                position: 'top-right',
            });
        } catch (err) {
            const message = getErrorMessage(err);
            alert(message);
        }

    };



    return (
        <div className={styles.userInfo}>
            {loading ? (
                <p>Загрузка...</p>
            ) : error ? (
                <p className={styles.error}>Ошибка: {error}</p>
            ) : me && (
                !changeData ? (
                    <>
                        <h2>Информация о пользователе</h2>
                        <div className={styles.userData}>
                            <span><strong>Никнейм:</strong> {me.username}</span>
                            <span><strong>Почта:</strong> {me.email}</span>
                            <span><strong>Имя:</strong> {me.first_name}</span>
                            <span><strong>Фамилия:</strong> {me.last_name}</span>
                            <span><strong>Телефон:</strong> {me.phone}</span>
                            {me.role === "admin" && <span><strong>Роль:</strong> {me.role}</span>}
                        </div>
                        <button
                            className={styles.changeButton}
                            onClick={() => setChangeData(true)}
                        >
                            Изменить данные</button>
                    </>
                ) : (
                    <>
                        <h2>Информация о пользователе</h2>
                        <div className={styles.userData}>
                            <span><strong>Никнейм:</strong><input name="username" placeholder="Никнейм" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required /></span>
                            <span><strong>Почта:</strong><input name="email" placeholder="Почта" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></span>
                            <span><strong>Имя:</strong><input name="first_name" placeholder="Имя" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required /></span>
                            <span><strong>Фамилия:</strong><input name="last_name" placeholder="Фамилия" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required /></span>
                            <span><strong>Телефон:</strong><input name="phone" placeholder="Телефон" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></span>
                            {me.role === "admin" && <span><strong>Роль:</strong> {me.role}</span>}
                        </div>
                        <button
                            className={styles.changeButton}
                            onClick={() => {
                                handleUpdateMe()
                                setChangeData(false)
                            }}
                        >
                            Подтвердить</button>
                    </>
                )

            )}
        </div >
    )
}