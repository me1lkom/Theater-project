import { useGetMe } from '../../hooks/useGetMe';
import { useState } from 'react';

export default function UserForm({ onSubmit }) {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { me, loading, error } = useGetMe();

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    function handleFillMe() {
        if (!me) return <div>Ошибка получения данных.</div>;
        setFirstName(me.first_name || '');
        setLastName(me.last_name || '');
        setPhone(me.phone || '');
        setEmail(me.email || '');
    }

    const isFormValid = () => {
        return first_name.trim() !== '' &&
                last_name.trim() !== '' &&
                phone.trim() !== '' &&
                email.trim() !== '' &&
                agreed === true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            alert('Заполните все поля и примите условия оферты');
            return;
        }

        if (!me) {
            alert('Данные пользователя не загружены');
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                user_id: me.id,
                user_data: {
                    first_name,
                    last_name,
                    phone,
                    email
                }
            });
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (


        <div>
            <button onClick={handleFillMe}>Взять данные из кабинета</button>
            <form onSubmit={handleSubmit}>
                <input type='text' placeholder='Имя *' value={first_name} onChange={(e) => setFirstName(e.target.value)} required/>
                <input type='text' placeholder='Фамилия *' value={last_name} onChange={(e) => setLastName(e.target.value)} required/>
                <input type='tel' placeholder='Телефон *' value={phone} onChange={(e) => setPhone(e.target.value)} required/>
                <input type='email' placeholder='Email *' value={email} onChange={(e) => setEmail(e.target.value)} required/>
            
                <label>
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                    Принимаю условия публичной оферты *
                </label>
                
                <button type="submit" disabled={!isFormValid() || isSubmitting}>
                    {isSubmitting ? 'Обработка...' : 'Оплатить'}
                </button>
            </form>
        </div>
    )
}
