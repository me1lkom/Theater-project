import { useState } from "react";
import { usePlay } from "../../hooks/usePlay";
import { useParams } from "react-router-dom";
import PlayDescription from "../../components/plays/playPage/PlayDescription";
import PlayAvailableSeatsV2 from '../../components/plays/playPage/PlayAvailableSeatsV2/PlayAvailableSeatsV2';

export default function PlayPage() {
    const { id } = useParams();
    const { play, loading, error } = usePlay(id);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Когда выбран сеанс — открываем модалку
    const handleSessionSelect = (sessionId) => {
        setSelectedSession(sessionId);
        setIsModalOpen(true);
    };

    // Закрытие модалки и сброс выбранного сеанса
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!play) return <div>Спектакль не найден</div>;

    return (
        <div className="container">
            <PlayDescription
                play={play}
                selectedSession={selectedSession}
                onChangeSession={handleSessionSelect}
            />

            {/* <PlayAvailableSeats sessionId={selectedSession} /> */}


                <PlayAvailableSeatsV2 sessionId={selectedSession} />
        </div>
    );
}