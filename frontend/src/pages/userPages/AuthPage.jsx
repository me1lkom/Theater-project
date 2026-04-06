import { useState } from 'react';
import { useLogin } from '../../hooks/useLogin';
import { useRegister } from '../../hooks/useRegister';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [password2, setPassword2] = useState('');
    const [email, setEmail] = useState('');
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
        await registerUser( username, password, password2, email, first_name, last_name );
    }


    const toggleAuthMode = () => {
        setIsLogin(prev => !prev);
        if (!isLogin) {
            ;
        }
    }



    return (
        <div className="container">
            {loading && <div>Загрузка...</div>}
            {error && <div>Ошибка: {error}</div>}
            {isLogin ? (
                <>
                    <form onSubmit={handleSubmitLogin} className='authForm'>
                        <input type='text' placeholder='Логин' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type='submit'>Войти</button>
                    </form>
                    <button onClick={toggleAuthMode}>Ещё не зарегистрированы?</button>
                </>
            ) : (
                <>
                    <form onSubmit={handleSubmitRegister} className='authForm'>
                        <input type='text' placeholder='Логин' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} />
                        <input type='password' placeholder='Подтверждение пароля' value={password2} onChange={(e) => setPassword2(e.target.value)} />
                        <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type='text' placeholder='Имя' value={first_name} onChange={(e) => setFirstName(e.target.value)} />
                        <input type='text' placeholder='Фамилия' value={last_name} onChange={(e) => setLastName(e.target.value)} />
                        <button type='submit'>Зарегистироваться</button>
                    </form>
                    <button onClick={toggleAuthMode}>Уже зарегистрированы?</button>
                </>


            )}
        </div>
    );
}