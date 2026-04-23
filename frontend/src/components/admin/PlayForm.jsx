import { useState, useEffect } from 'react';
import { usePlay } from '../../hooks/usePlay';
import styles from './PlayForm.module.css';

export default function PlayForm({ Data, genres, onSubmit, onClose }) {

    const { play } = usePlay(Data?.play_id);
    const isEdit = !!Data;


    const [formData, setFormData] = useState({
        title: '',
        duration: '',
        description: '',
        price: '',
        poster_url: '',
        genre: ''
    });

    useEffect(() => {
        if (isEdit && play) {
            setFormData({
                title: play.title || '',
                duration: play.duration || '',
                description: play.description || '',
                price: play.price || '',
                poster_url: play.poster_url || '',
                genre: play.genre || ''
            });
        }
    }, [isEdit, play]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenreChange = (e) => {
        setFormData(prev => ({ ...prev, genre: Number(e.target.value) }));
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3>{isEdit ? 'Редактирование спектакля' : 'Создание спектакля'}</h3>

            <input
                name="title"
                placeholder="Название"
                value={formData.title}
                onChange={handleChange}
                required
            />

            <input
                name="duration"
                type="number"
                placeholder="Длительность (мин)"
                value={formData.duration}
                onChange={handleChange}
                required
            />

            <textarea
                name="description"
                placeholder="Описание"
                value={formData.description}
                onChange={handleChange}
            />


            <input
                name="price"
                type="number"
                step="0.01"
                placeholder="Цена"
                value={formData.price}
                onChange={handleChange}
                required
            />

            <input
                name="poster_url"
                placeholder="Ссылка на афишу"
                value={formData.poster_url}
                onChange={handleChange}
                required
            />

            <select
                value={formData.genre || ''}
                onChange={handleGenreChange}
                className={styles.genreSelect}
            >
                <option value="">Выберите жанр</option>
                {genres?.map(genre => (
                    <option key={genre.genre_id} value={genre.genre_id}>
                        {genre.name}
                    </option>
                ))}
            </select>


            <div className={styles.buttons}>
                <button type="submit">Сохранить</button>
                <button type="button" onClick={onClose}>Отмена</button>
            </div>
        </form>
    )
}