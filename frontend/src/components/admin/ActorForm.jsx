import { useState, useEffect } from 'react';
import { useGetActorById } from '../../hooks/useGetActorById';
import styles from './PlayForm.module.css';

export default function ActorForm({ Data, onSubmit, onClose }) {

    const { actor } = useGetActorById(Data?.actor_id);
    const isEdit = !!Data;

    const [formData, setFormData] = useState({
        actor_fio: '',
    });

    useEffect(() => {
        if (isEdit && actor) {
            setFormData({
                actor_fio: actor.actor_fio || '',
            });
        }
    }, [isEdit, actor]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3>{isEdit ? 'Редактирование актера' : 'Создание актера'}</h3>

            <input
                name="actor_fio"
                placeholder="ФИО актера"
                value={formData.actor_fio}
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