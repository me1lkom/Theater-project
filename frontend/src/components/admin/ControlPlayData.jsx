import { useState } from 'react';
import { usePlays } from '../../hooks/usePlays';
import { useGenres } from '../../hooks/useGenres';
import { createPlay, changePlay, deletePlay } from '../../api/index';
import PlayForm from './PlayForm';
import styles from './ControlPlayData.module.css';
import DataFilter from './DataFilter';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function ControlPlayData() {
    const { plays, loading, error, refetch } = usePlays();
    const { genres } = useGenres();

    const [searchQuery, setSearchQuery] = useState('');

    const [selectedPlay, setSelectedPlay] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const MySwal = withReactContent(Swal);

    const handlePlayDelete = async () => {
        MySwal.fire({
            icon: "error",
            title: <p>Вы хотите удалить этот спектакль?</p>,
            showConfirmButton: true,
            showDenyButton: true,
            denyButtonText: `Отмена`,
            confirmButtonText: `Да, удалить`,
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deletePlay(selectedPlay.play_id);
                await refetch();
                setSelectedPlay(null);
                setIsFormOpen(false);
                MySwal.fire({
                    title: 'Спектакль успешно удалён!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: 'top-right',
                })
            } else {
                setSelectedPlay(null);
                console.log('Отмена действия');
            }
        })
    }

    const handlePlayChange = async (formData) => {
        await changePlay(selectedPlay.play_id, formData);
        await refetch();
        setSelectedPlay(null);
        setIsFormOpen(false);
        MySwal.fire({
            title: 'Спектакль успешно изменён!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
        })
    }

    const handlePlayCreate = async (formData) => {
        await createPlay(formData);
        await refetch();
        setIsFormOpen(false);
        MySwal.fire({
            title: 'Спектакль успешно создан!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
        })
    }


    const filteredData = plays?.filter(play => {
        const matchByTitle = play.title.toLowerCase().includes(searchQuery.toLowerCase());
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
                <div className={styles.playsList}>
                    {filteredData?.map(play => (
                        <div
                            key={play.play_id}
                            className={`${styles.playCard} ${selectedPlay?.play_id === play.play_id ? styles.selected : ''}`}
                            onClick={() => setSelectedPlay(play)}
                        >
                            <div className={styles.playId}>{play.play_id}</div>
                            <div className={styles.playTitle}>{play.title}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.actionList}>
                    {!selectedPlay ? (
                        <button
                            onClick={() => {
                                if (isFormOpen) {
                                    setIsFormOpen(false);
                                    setSelectedPlay(null);
                                } else {
                                    setSelectedPlay(null);
                                    setIsFormOpen(true);
                                }
                            }}
                            className={styles.createButton}>Создать</button>

                    ) : (

                        <button
                            onClick={() => {
                                setIsFormOpen(false);
                                setSelectedPlay(null);
                            }}
                            className={styles.createButton}>Отмена</button>

                    )}
                    {selectedPlay ? (
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
                    <PlayForm
                        Data={selectedPlay}
                        genres={genres}
                        onSubmit={selectedPlay ? handlePlayChange : handlePlayCreate}
                        onClose={() => {
                            setIsFormOpen(false);
                            setSelectedPlay(null);
                        }}

                    />
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
}