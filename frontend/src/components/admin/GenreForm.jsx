import { useState, useEffect } from 'react';
import { useGetGenreById } from '../../hooks/useGetGenreById';
import styles from './PlayForm.module.css';

export default function GenreForm({ Data, onSubmit, onClose }) {

    const { genre } = useGetGenreById(Data?.genre_id);
    const isEdit = !!Data;

    const [formData, setFormData] = useState({
        name: '',
        description: '' 
    });

    useEffect(() => {
        if (isEdit && genre) {
            setFormData({
                name: genre.name || '',
                description: genre.description || ''
            });
        }
    }, [isEdit, genre]);

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
                name="name"
                placeholder="Название"
                value={formData.name}
                onChange={handleChange}
                required
            />

            <textarea
                name="description"
                placeholder="Описание"
                value={formData.description}
                onChange={handleChange}
            />


            <div className={styles.buttons}>
                <button type="submit">Сохранить</button>
                <button type="button" onClick={onClose}>Отмена</button>
            </div>
        </form>
    )
}