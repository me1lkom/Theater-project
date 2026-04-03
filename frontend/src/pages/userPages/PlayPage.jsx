
// import { useNavigate } from "react-router-dom";
{/* Небходимо добавить вывод мест и перекидывание и перекидывание на оплату */ }

import { useState } from "react";
import { usePlay } from "../../hooks/usePlay";
import { useParams } from "react-router-dom";
import PlayDescription from "../../components/plays/playPage/PlayDescription";
import PlayAvailableSeats from "../../components/plays/playPage/PlayAvailableSeats";

export default function PlayPage() {
    const { id } = useParams();
    const { play, loading, error } = usePlay(id);

    const [selectedSession, setSelectedSession] = useState(null);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!play) return <div>Спектакль не найден</div>;



    return (
        <div className="container">
            <PlayDescription
                play={play}
                selectedSession={selectedSession}
                onChangeSession={setSelectedSession}
            />

            
            <PlayAvailableSeats 
                sessionId={selectedSession} 
            />
            
        </div>
    )
}