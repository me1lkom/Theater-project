import { useState } from 'react';
import { useLogin } from '../../hooks/useLogin';
import { useRegister } from '../../hooks/useRegister';
import styles from './AuthPage.module.css';
export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [password2, setPassword2] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');

    const { loginUser, loading, error } = useLogin();
    const { registerUser } = useRegister();

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        await loginUser(username, password);
    };

    const handleSubmitRegister = async (e) => {
        e.preventDefault();
        await registerUser(username, password, password2, email, first_name, last_name, phone);
    }





    return (
        <div className={styles.container}>
            {loading && <div className={styles.loading}>Загрузка...</div>}
            {error && <div className={styles.error}>Ошибка: {error}</div>}

            <div className={styles.header}>
                <h1>{isLogin ? 'Вход' : 'Регистрация'}</h1>
                <p>Войдите или создайте учетную запись, чтобы управлять своими бронированиями</p>
            </div>


            <div className={styles.tabs}>
                <button className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`} onClick={() => setIsLogin(true)} >
                    Вход
                </button>
                <button className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`} onClick={() => setIsLogin(false)} >
                    Регистрация
                </button>
            </div>

            {isLogin ? (
                <>
                    <form onSubmit={handleSubmitLogin} className={styles.authForm}>
                        <input type='text' placeholder='Логин' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type='submit' disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <form onSubmit={handleSubmitRegister} className={styles.authForm}>
                        <input type='text' placeholder='Логин' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} />
                        <input type='password' placeholder='Подтверждение пароля' value={password2} onChange={(e) => setPassword2(e.target.value)} />
                        <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type='text' placeholder='Номер телефона' value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <input type='text' placeholder='Имя' value={first_name} onChange={(e) => setFirstName(e.target.value)} />
                        <input type='text' placeholder='Фамилия' value={last_name} onChange={(e) => setLastName(e.target.value)} />
                        <button type='submit' disabled={loading}>
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}