import { useState } from 'react';
import { useSessions } from '../../hooks/useSessions';
import { usePlays } from '../../hooks/usePlays';
import { createSession, changeSession, deleteSession } from '../../api/index';
import SessionForm from './SessionForm';
import styles from './ControlSessionData.module.css';
import DateFilter from './DateFilter';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function ControlSessionData() {
    const { sessions, loading, error, refetch } = useSessions();
    const { plays } = usePlays();

    const [searchQuery, setSearchQuery] = useState('');


    const [selectedSession, setSelectedSession] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const MySwal = withReactContent(Swal);

    const handleSessionDelete = async () => {
        MySwal.fire({
            icon: "error",
            title: <p>Вы хотите удалить этот сеанс?</p>,
            showConfirmButton: true,
            showDenyButton: true,
            denyButtonText: `Отмена`,
            confirmButtonText: `Да, удалить`,
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteSession(selectedSession.session_id);
                await refetch();
                setSelectedSession(null);
                setIsFormOpen(false);

                MySwal.fire({
                    title: 'Сеанс успешно удалён!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: 'top-right',
                })
            } else {
                setSelectedSession(null);
                console.log('Отмена действия');
            }
        })
    }

    const handleSessionChange = async (formData) => {
        await changeSession(selectedSession.session_id, formData);
        await refetch();
        setSelectedSession(null);
        setIsFormOpen(false);
        MySwal.fire({
            title: 'Сеанс успешно изменён!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
        })
    }

    const handleSessionCreate = async (formData) => {
        await createSession(formData);
        await refetch();
        setIsFormOpen(false);
        MySwal.fire({
            title: 'Сеанс успешно создан!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
        })
    }


    const filteredData = sessions?.filter(session => {
        const matchByTitle = session.date.includes(searchQuery);
        return matchByTitle;
    });

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <DateFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery} />
                <div className={styles.sessionList}>
                    {filteredData?.map(session => (
                        <div
                            key={session.session_id}
                            className={`${styles.sessionCard} ${selectedSession?.session_id === session.session_id ? styles.selected : ''}`}
                            onClick={() => setSelectedSession(session)}
                        >
                            <div className={styles.sessionId}>{session.session_id}</div>
                            <div className={styles.playTitle}>{session.play_title}</div>
                            <div className={styles.playDateTime}>{session.time} / {session.date}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.actionList}>
                    {!selectedSession ? (
                        <button
                            onClick={() => {
                                if (isFormOpen) {
                                    setIsFormOpen(false);
                                    setSelectedSession(null);
                                } else {
                                    setSelectedSession(null);
                                    setIsFormOpen(true);
                                }
                            }}
                            className={styles.createButton}>Создать</button>

                    ) : (

                        <button
                            onClick={() => {
                                setIsFormOpen(false);
                                setSelectedSession(null);
                            }}
                            className={styles.createButton}>Отмена</button>

                    )}
                    {selectedSession ? (
                        <>
                            <button onClick={() => setIsFormOpen(true)} className={styles.changeButton}>Изменить</button>
                            <button onClick={handleSessionDelete} className={styles.deleteButton}>Удалить</button>
                        </>
                    ) : (
                        <>

                        </>
                    )}
                </div>
            </div>


            <div className={styles.rightColumn}>
                {isFormOpen ? (
                    <SessionForm
                        Data={selectedSession}
                        plays={plays}
                        onSubmit={selectedSession ? handleSessionChange : handleSessionCreate}
                        onClose={() => {
                            setIsFormOpen(false);
                            setSelectedSession(null);
                        }}

                    />
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
}