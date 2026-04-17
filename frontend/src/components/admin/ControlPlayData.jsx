import { useState } from 'react';
import { usePlays } from '../../hooks/usePlays';
import { useGenres } from '../../hooks/useGenres';
import { createPlay, changePlay, deletePlay } from '../../api/index';
import PlayForm from './PlayForm';
import styles from './ControlPlayData.module.css';


export default function ControlPlayData() {
    const { plays, loading, error, refetch } = usePlays();
    const { genres } = useGenres();

    const [selectedPlay, setSelectedPlay] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handlePlayDelete = async () => {
        let question = confirm('Вы хотите удалить этот спектакль?');
        if (question) {
            await deletePlay(selectedPlay.play_id);
            await refetch();
            setSelectedPlay(null);
            setIsFormOpen(false);
            alert('Спектакль успешно удален.')
        } else {
            setSelectedPlay(null);
            console.log('Отмена действия');
        }

    }

    const handlePlayChange = async (formData) => {
        await changePlay(selectedPlay.play_id, formData);
        await refetch();
        setSelectedPlay(null);
        setIsFormOpen(false);
        alert('Спектакль успешно изменен.')
    }

    const handlePlayCreate = async (formData) => {
        await createPlay(formData);
        await refetch();
        setIsFormOpen(false);
        alert('Спектакль успешно создан.')
    }

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <div className={styles.playsList}>
                    {plays?.map(play => (
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