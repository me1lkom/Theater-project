import { useState } from 'react';
import { useGenres } from '../../hooks/useGenres';
import { createGenre, changeGenre, deleteGenre } from '../../api/index';
import GenreForm from './GenreForm';
import styles from './ControlGenreData.module.css';


export default function ControlPlayData() {
    const { genres, loading, error, refetch } = useGenres();

    const [selectedGenre, setSelectedGenre] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handlePlayDelete = async () => {
        let question = confirm('Вы хотите удалить этот жанр?');
        if (question) {
            await deleteGenre(selectedGenre.genre_id);
            await refetch();
            setSelectedGenre(null);
            setIsFormOpen(false);
            alert('Жанр успешно удален.')
        } else {
            setSelectedGenre(null);
            console.log('Отмена действия');
        }

    }

    const handlePlayChange = async (formData) => {
        await changeGenre(selectedGenre.genre_id, formData);
        await refetch();
        setSelectedGenre(null);
        setIsFormOpen(false);
        alert('Жанр успешно изменен.')
    }

    const handlePlayCreate = async (formData) => {
        await createGenre(formData);
        await refetch();
        setIsFormOpen(false);
        alert('Актер успешно создан.')
    }

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <div className={styles.genresList}>
                    {genres?.map(genre => (
                        <div
                            key={genre.genre_id}
                            className={`${styles.genreCard} ${selectedGenre?.genre_id === genre.genre_id ? styles.selected : ''}`}
                            onClick={() => setSelectedGenre(genre)}
                        >
                            <div className={styles.genreId}>{genre.genre_id}</div>
                            <div className={styles.genreName}>{genre.name}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.actionList}>
                    {!selectedGenre ? (
                        <button
                            onClick={() => {
                                if (isFormOpen) {
                                    setIsFormOpen(false);
                                    setSelectedGenre(null);
                                } else {
                                    setSelectedGenre(null);
                                    setIsFormOpen(true);
                                }
                            }}
                            className={styles.createButton}>Создать</button>

                    ) : (

                        <button
                            onClick={() => {
                                setIsFormOpen(false);
                                setSelectedGenre(null);
                            }}
                            className={styles.createButton}>Отмена</button>

                    )}
                    {selectedGenre ? (
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
                    <GenreForm
                        Data={selectedGenre}
                        onSubmit={selectedGenre ? handlePlayChange : handlePlayCreate}
                        onClose={() => {
                            setIsFormOpen(false);
                            setSelectedGenre(null);
                        }}

                    />
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
}