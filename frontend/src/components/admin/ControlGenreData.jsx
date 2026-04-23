import { useState } from 'react';
import { useGenres } from '../../hooks/useGenres';
import { createGenre, changeGenre, deleteGenre } from '../../api/index';
import GenreForm from './GenreForm';
import styles from './ControlGenreData.module.css';
import DataFilter from './DataFilter';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function ControlPlayData() {
    const { genres, loading, error, refetch } = useGenres();

    const [searchQuery, setSearchQuery] = useState('');


    const [selectedGenre, setSelectedGenre] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const MySwal = withReactContent(Swal);

    const handlePlayDelete = async () => {
        MySwal.fire({
            icon: "error",
            title: <p>Вы хотите удалить этот жанр?</p>,
            showConfirmButton: true,
            showDenyButton: true,
            denyButtonText: `Отмена`,
            confirmButtonText: `Да, удалить`,
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteGenre(selectedGenre.genre_id);
                await refetch();
                setSelectedGenre(null);
                setIsFormOpen(false);

                MySwal.fire({
                    title: 'Жанр успешно удалён!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: 'top-right',
                })
            } else {
                setSelectedGenre(null);
                console.log('Отмена действия');
            }
        })

    }

    const handlePlayChange = async (formData) => {
        await changeGenre(selectedGenre.genre_id, formData);
        await refetch();
        setSelectedGenre(null);
        setIsFormOpen(false);
        MySwal.fire({
            title: 'Жанр успешно изменён!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
        })
    }

    const handlePlayCreate = async (formData) => {
        await createGenre(formData);
        await refetch();
        setIsFormOpen(false);
         MySwal.fire({
            title: 'Жанр успешно создан!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
        })
    }

    const filteredData = genres?.filter(genre => {
        const matchByTitle = genre.name.toLowerCase().includes(searchQuery.toLowerCase());
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
                <div className={styles.genresList}>
                    {filteredData?.map(genre => (
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