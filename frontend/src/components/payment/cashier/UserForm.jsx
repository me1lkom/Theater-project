import { useState } from 'react';
import styles from './UserForm.module.css';

export default function UserForm({ onSubmit, OnCashier }) {
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleByOnCashier = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);

        try {
            await OnCashier({
                user_data: {}
            });
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    const isFormValid = () => {
        return phone.trim() !== '';
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            alert('Заполните все поля и примите условия оферты');
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                user_data: {
                    phone,
                }
            });
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={styles.userForm}>
            <button onClick={handleByOnCashier} className={styles.fillButton}>Купить на себя</button>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input type='tel' placeholder='Телефон *' value={phone} onChange={(e) => setPhone(e.target.value)} required />

                <button type="submit" disabled={!isFormValid() || isSubmitting}>
                    {isSubmitting ? 'Обработка...' : 'Оплатить'}
                </button>
            </form>
        </div>
    )
}
