import { useState } from 'react';
import { useGetActors } from '../../hooks/useGetActors';
import { createActor, changeActor, deleteActor } from '../../api/index';
import ActorForm from './ActorForm';
import styles from './ControlActorData.module.css';
import DataFilter from './DataFilter';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function ControlPlayData() {
    const { actors, loading, error, refetch } = useGetActors();

    const [searchQuery, setSearchQuery] = useState('');


    const [selectedActor, setSelectedActor] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const MySwal = withReactContent(Swal);

    const handlePlayDelete = async () => {
        MySwal.fire({
            icon: "error",
            title: <p>Вы хотите удалить этого актера?</p>,
            showConfirmButton: true,
            showDenyButton: true,
            denyButtonText: `Отмена`,
            confirmButtonText: `Да, удалить`,
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteActor(selectedActor.actor_id);
                await refetch();
                setSelectedActor(null);
                setIsFormOpen(false);

                MySwal.fire({
                    title: 'Актёр успешно удалён!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: 'top-right',
                })
            } else {
                setSelectedActor(null);
                console.log('Отмена действия');
            }
        })
    }

    const handlePlayChange = async (formData) => {
        await changeActor(selectedActor.actor_id, formData);
        await refetch();
        setSelectedActor(null);
        setIsFormOpen(false);
        MySwal.fire({
            title: 'Актёр успешно изменён!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
        })
    }

    const handlePlayCreate = async (formData) => {
        await createActor(formData);
        await refetch();
        setIsFormOpen(false);
        MySwal.fire({
            title: 'Актёр успешно создан!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
        })
    }

    const filteredData = actors?.filter(actor => {
        const matchByTitle = actor.actor_fio.toLowerCase().includes(searchQuery.toLowerCase());
        return matchByTitle;
    });


    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <DataFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery} />
                <div className={styles.actorsList}>
                    {filteredData?.map(actor => (
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
                    {!selectedActor ? (
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

                    ) : (

                        <button
                            onClick={() => {
                                setIsFormOpen(false);
                                setSelectedActor(null);
                            }}
                            className={styles.createButton}>Отмена</button>

                    )}
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