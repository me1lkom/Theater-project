import styles from './ChangingUserModal.module.css';
import { useState } from 'react';

export default function ChangingUserModal({ userData, changeData, onSubmit, onClose }) {

    const [first_name, setFirstName] = useState(userData.first_name);
    const [last_name, setLastName] = useState(userData.last_name);
    const [phone, setPhone] = useState(userData.phone);
    const [email, setEmail] = useState(userData.email);


    function handleSubmit() = async (e) => {

    }



    return (
        <form onSubmit={handleSubmit} className={styles.changeForm}>
            <input type='text' placeholder='Имя *' value={first_name} onChange={(e) => setFirstName(e.target.value)} required />
            <input type='text' placeholder='Фамилия *' value={last_name} onChange={(e) => setLastName(e.target.value)} required />
            <input type='tel' placeholder='Телефон *' value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <input type='email' placeholder='Email *' value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className={styles.modalButtons}>
                <button type="button" onClick={onCancel}>Отмена</button>
                <button type="submit" disabled={isSubmitting}>Подтвердить</button>
            </div>
        </form>
    );
}