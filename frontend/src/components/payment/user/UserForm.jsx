import { useState } from 'react';
import styles from './UserForm.module.css';

export default function UserForm({ onSubmit }) {
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();


        try {
            await onSubmit()

        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={styles.userForm}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label>
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                    Принимаю условия публичной оферты *
                </label>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Обработка...' : 'Оплатить'}
                </button>
            </form>
        </div>
    )
}
