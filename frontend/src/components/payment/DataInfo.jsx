// import { useState } from 'react';
import { useSession } from '../../hooks/useSession';
import { usePlay } from '../../hooks/usePlay';

export default function DataInfo({sessionId, selectedSeats}){
    const { session, loading, error } = useSession(sessionId);
    const { play, loading: playLoading, error: playError } = usePlay(session?.play);

    if (loading || playLoading) return <div>Загрузка...</div>;
    if (error || playError) return <div>Ошибка: {error}</div>;
    if (!session || !play) return <div>Данные о спектакле не найдены</div>;
    
    

    return (
        <div>
                <div>{session.play_title}</div>
                <div>{session.date}</div>
                <div>{session.time} + {play.duration}</div>

                <div>{selectedSeats.map((seat) => (
                    <p key={seat}>{seat}</p>
                ))}</div>

                <div></div>
        </div>
    )
}