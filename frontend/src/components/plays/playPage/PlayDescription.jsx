import { useSessions } from "../../../hooks/useSessions";

export default function PlayDescription({ play, selectedSession, onChangeSession }) {
    const { sessions } = useSessions();

    if (!sessions) return null;

    let neededSessions = sessions.filter(session => session.play_title.toLowerCase().includes(play.title.toLowerCase()));

    return (
        <div className="PlayPage">

            <div className="playInfo">
                <img src={play.poster_url} alt={play.title} />
                <div className="playDetails">
                    <div className="play...">
                        <div className="title">{play.title}</div>
                        <div className="description">{play.description}</div>
                        <div className="duration">{play.duration}</div>
                        <div className="price">{play.price}</div>
                    </div>
                    <div className="actorsInfo">
                        {play.actors?.map(actor => (
                            <div className="actor" key={actor.actor_id}>{actor.actor_fio}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="seatsInfo">
                <select
                    value={selectedSession || ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        onChangeSession(value === '' ? null : Number(value));
                    }}
                >
                    <option value="">Выберите дату и время сеанса</option>
                    {neededSessions?.map(session => (
                        <option key={session.session_id} value={session.session_id}>{session.date} {session.time}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}