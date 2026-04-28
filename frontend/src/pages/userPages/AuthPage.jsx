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

    const { loginUser, loading: loginLoading, error: loginError } = useLogin();
    const { registerUser, loading: registerLoading, error: registerError } = useRegister();
    const loading = isLogin ? loginLoading : registerLoading;
    const error = isLogin ? loginError : registerError;

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        await loginUser(username, password);
    };

    const handleSubmitRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setValidError('');

        const cleanedPhone = cleanPhone(phone);

        await registerUser(username, password, password2, email, first_name, last_name, cleanedPhone);
    };

    const [validError, setValidError] = useState('');

    const cleanPhone = (phoneRaw) => {
        let cleaned = phoneRaw.replace(/\D/g, '');

        if (cleaned.startsWith('7') && cleaned.length === 11) {
            cleaned = '8' + cleaned.slice(1);
        }
        else if (cleaned.length === 10 && !cleaned.startsWith('8')) {
            cleaned = '8' + cleaned;
        }

        return cleaned;
    };

    const validateForm = () => {
        if (!username.trim()) {
            setValidError('Логин обязателен');
            return false;
        }
        if (username.length < 3) {
            setValidError('Логин должен быть не менее 3 символов');
            return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setValidError('Логин может содержать только буквы, цифры и подчёркивание');
            return false;
        }

        if (!password) {
            setValidError('Пароль обязателен');
            return false;
        }
        if (password.length < 6) {
            setValidError('Пароль должен быть не менее 6 символов');
            return false;
        }

        if (email.trim() && !/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) {
            setValidError('Некорректный email');
            return false;
        }

        const cleanedPhone = cleanPhone(phone);
        if (!cleanedPhone) {
            setValidError('Телефон обязателен');
            return false;
        }
        if (cleanedPhone.length !== 11) {
            setValidError('Номер телефона должен содержать 11 цифр');
            return false;
        }
        if (!cleanedPhone.startsWith('8')) {
            setValidError('Номер телефона должен начинаться с 8');
            return false;
        }

        return true;
    };



    return (
        <div className={styles.container}>
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
                        <input type='text' placeholder='Логин' value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type='submit' disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <form onSubmit={handleSubmitRegister} className={styles.authForm}>
                        <input type='text' placeholder='Логин' value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <input type='password' placeholder='Подтверждение пароля' value={password2} onChange={(e) => setPassword2(e.target.value)} />
                        <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type='text' placeholder='Номер телефона' value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        <input type='text' placeholder='Имя' value={first_name} onChange={(e) => setFirstName(e.target.value)} required />
                        <input type='text' placeholder='Фамилия' value={last_name} onChange={(e) => setLastName(e.target.value)} required />
                        <button type='submit' disabled={loading}>
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </form>
                </>
            )}

            {loading && <div className="loading loadingCenter">Загрузка...</div>}
            {(error || validError) && (
                <div className="error errorCenter">
                    Ошибка: {validError || error}
                </div>
            )}
        </div>
    );
}