import { useState, useEffect } from 'react';
import { useSession } from '../../hooks/useSession';
import styles from './PlayForm.module.css';

export default function PlayForm({ Data, plays, onSubmit, onClose }) {

    const { session } = useSession(Data?.session_id);
    const isEdit = !!Data;


    const [formData, setFormData] = useState({
        play_id: '',
        hall: 1,
        date: '',
        time: '',
    });

    useEffect(() => {
        if (isEdit && session) {
            setFormData({
                play_id: session.play || '',
                date: session.date || '',
                time: session.time || '',
            });
        }
    }, [isEdit, session]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedTime = formData.time.length === 5 
        ? `${formData.time}:00` 
        : formData.time;


        console.log(formData)

        onSubmit({
            ...formData,
            time: formattedTime
        });
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlayChange = (e) => {
        setFormData(prev => ({ ...prev, play_id: Number(e.target.value) }));
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3>{isEdit ? 'Редактирование сеанса' : 'Создание сеанса'}</h3>

            <select
                value={formData.play_id}
                onChange={handlePlayChange}
                className={styles.playSelect}
                required
            >
                <option value="">Выберите спектакль</option>
                {plays?.map(play => (
                    <option key={play.play_id} value={play.play_id}>
                        {play.title}
                    </option>
                ))}
            </select>

            <input
                name="date"
                type="date"
                placeholder="Дата (YYYY-MM-DD)"
                value={formData.date}
                onChange={handleChange}
                required
            />

            <input
                name="time"
                type="time"
                placeholder="Время (HH:MM:SS)"
                value={formData.time}
                onChange={handleChange}
                required
            />

            <div className={styles.buttons}>
                <button type="submit">Сохранить</button>
                <button type="button" onClick={onClose}>Отмена</button>
            </div>
        </form>
    )
}