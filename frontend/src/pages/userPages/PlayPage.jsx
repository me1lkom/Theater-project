// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
{/* Небходимо добавить вывод мест и перекидывание и перекидывание на оплату */}

import { usePlay } from "../../hooks/usePlay";
import { useParams } from "react-router-dom";

export default function PlayPage() {
    const { id } = useParams();
    const { play, loading, error } = usePlay(id);
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!play) return <div>Спектакль не найден</div>;

    return (
        <div className="PlayPage">
            <div className="playInfo">
                <img src={play.poster} alt={play.title} />
                <div className="playDetails">
                    <div className="play...">
                        <div className="title">{play.title}</div>
                        <div className="description">{play.description}</div>
                        <div className="duration">{play.duration}</div>
                        <div className="selectDate">
                                {/* в будущем добавить выбор даты и времени */}
                        </div>
                        <div className="price">{play.price}</div>
                    </div>
                    <div className="actorsInfo">
                        {play.actors?.map(actor => (
                            <div className="actor" key={actor.actor_id}>{actor.actor_fio}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="seatsInfo"></div>
        </div>
    );
}