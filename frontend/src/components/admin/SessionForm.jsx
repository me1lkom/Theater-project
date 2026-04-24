import { useState, useEffect } from 'react';
import { useSession } from '../../hooks/useSession';
import { useGetActors } from '../../hooks/useGetActors';
import styles from './PlayForm.module.css';

export default function PlayForm({ Data, plays, onSubmit, onClose  }) {

    const { session, error } = useSession(Data?.session_id);
    const { actors } = useGetActors();
    const isEdit = !!Data;  

    const [formData, setFormData] = useState({
        play_id: '',
        hall: 1,
        date: '',
        time: '',
        actors: [],
    });

    useEffect(() => {
        if (isEdit && session) {
            setFormData({
                play_id: session.play || '',
                date: session.date || '',
                time: session.time || '',
                actors: session?.actors.map(a => ({
                    actor_id: a.actor_id,
                    role: a.actor_role_name
                })) || [],
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

    const handleActorChange = (index, e) => {
        const newActors = [...formData.actors];
        newActors[index].actor_id = Number(e.target.value)
        setFormData(prev => ({ ...prev, actors: newActors }));
    };

    const handleRoleChange = (index, e) => {
        const newActors = [...formData.actors];
        newActors[index].role = e.target.value
        setFormData(prev => ({ ...prev, actors: newActors }));
    };

    const handleRemoveActor = (index) => {
        const newActors = formData.actors.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, actors: newActors }));
    };

    const handleAddActor = () => {
        setFormData(prev => ({
            ...prev,
            actors: [...prev.actors, {
                actor_id: '',
                role: ''
            }],
        }));
    }

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

            <div className={styles.actors}>
                <h4>Актеры:</h4>
                {formData.actors.length != 0 ? (
                    formData.actors.map((actor, index) => (
                        <li key={index}>
                            <select
                                value={actor.actor_id}
                                onChange={(e) => handleActorChange(index, e)}
                                className={styles.playSelect}
                                required
                            >
                                <option value="">Выберите актёра</option>
                                {actors?.map(actor => (
                                    <option key={actor.actor_id} value={actor.actor_id}>
                                        {actor.actor_fio}
                                    </option>
                                ))}
                            </select>
                            -
                            <input
                                name="role"
                                placeholder="Роль"
                                value={actor.role}
                                onChange={(e) => handleRoleChange(index, e)}
                                required
                            />
                            <button onClick={() => handleRemoveActor(index)}>Удалить</button>

                        </li>
                    ))

                ) : (
                    <div>Нет актёровк</div>
                )}

                <button onClick={handleAddActor}>Добавить актёра</button>
            </div>

            <div className={styles.buttons}>
                <button type="submit">Сохранить</button>
                <button type="button" onClick={onClose}>Отмена</button>
            </div>
        </form>
    )
}