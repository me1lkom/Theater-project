import { useState } from 'react';
import { useSessions } from '../../hooks/useSessions';
import { usePlays } from '../../hooks/usePlays';
import { createSession, changeSession, deleteSession } from '../../api/index';
import SessionForm from './SessionForm';
import styles from './ControlSessionData.module.css';


export default function ControlSessionData() {
    const { sessions, loading, error, refetch } = useSessions();
    const { plays } = usePlays();

    const [selectedSession, setSelectedSession] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleSessionDelete = async () => {
        let question = confirm('Вы хотите удалить этот сеанс?');
        if (question) {
            await deleteSession(selectedSession.session_id);
            await refetch();
            setSelectedSession(null);
            setIsFormOpen(false);
            alert('Спектакль успешно удален.')
        } else {
            setSelectedSession(null);
            console.log('Отмена действия');
        }

    }

    const handleSessionChange = async (formData) => {
        await changeSession(selectedSession.session_id, formData);
        await refetch();
        setSelectedSession(null);
        setIsFormOpen(false);
        alert('Спектакль успешно изменен.')
    }

    const handleSessionCreate = async (formData) => {
        await createSession(formData);
        await refetch();
        setIsFormOpen(false);
        alert('Спектакль успешно создан.')
    }

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <div className={styles.sessionList}>
                    {sessions?.map(session => (
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