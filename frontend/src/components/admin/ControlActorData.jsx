import { useState } from 'react';
import { useGetActors } from '../../hooks/useGetActors';
import { createActor, changeActor, deleteActor } from '../../api/index';
import ActorForm from './ActorForm';
import styles from './ControlActorData.module.css';


export default function ControlPlayData() {
    const { actors, loading, error, refetch } = useGetActors();

    const [selectedActor, setSelectedActor] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handlePlayDelete = async () => {
        let question = confirm('Вы хотите удалить этого актера?');
        if (question) {
            await deleteActor(selectedActor.actor_id);
            await refetch();
            setSelectedActor(null);
            setIsFormOpen(false);
            alert('Спектакль успешно удален.')
        } else {
            setSelectedActor(null);
            console.log('Отмена действия');
        }

    }

    const handlePlayChange = async (formData) => {
        await changeActor(selectedActor.actor_id, formData);
        await refetch();
        setSelectedActor(null);
        setIsFormOpen(false);
        alert('Спектакль успешно изменен.')
    }

    const handlePlayCreate = async (formData) => {
        await createActor(formData);
        await refetch();
        setIsFormOpen(false);
        alert('Актер успешно создан.')
    }

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <div className={styles.actorsList}>
                    {actors?.map(actor => (
                        <div
                            key={actor.actor_id}
                            className={`${styles.actorCard} ${selectedActor?.actor_id === actor.actor_id ? styles.selected : ''}`}
                            onClick={() => setSelectedActor(actor)}
                        >
                            <div className={styles.actorId}>{actor.actor_id}</div>
                            <div className={styles.actorFIO}>{actor.actor_fio}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.actionList}>
                    <button
                        onClick={() => {
                            if (isFormOpen) {
                                setIsFormOpen(false);
                                setSelectedActor(null);
                            } else {
                                setSelectedActor(null);
                                setIsFormOpen(true);
                            }
                        }}
                        className={styles.createButton}>Создать</button>

                    {selectedActor ? (
                        <>
                            <button onClick={() => setIsFormOpen(true)} className={styles.changeButton}>Изменить</button>
                            <button onClick={handlePlayDelete} className={styles.deleteButton}>Удалить</button>
                        </>
                    ) : (
                        <>

                        </>
                    )}
                </div>
            </div>


            <div className={styles.rightColumn}>
                {isFormOpen ? (
                    <ActorForm
                        Data={selectedActor}
                        onSubmit={selectedActor ? handlePlayChange : handlePlayCreate}
                        onClose={() => {
                            setIsFormOpen(false);
                            setSelectedActor(null);
                        }}

                    />
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
}