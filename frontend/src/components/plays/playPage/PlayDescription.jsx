import { useSessions } from "../../../hooks/useSessions";
import styles from './PlayDescription.module.css';
import time from '../../../assets/icon/time.svg';
import PlayActor from "./PlayActor";

export default function PlayDescription({ play, selectedSession, onChangeSession }) {


    const hours = Math.floor(play.duration / 60);
    let minutes = play.duration % 60;

    if (minutes == 0) {
        minutes = "00";
    }

    let price = Number(play.price);


    const { sessions } = useSessions();

    let neededSessions = sessions?.filter(session => session.play_title.toLowerCase().includes(play.title.toLowerCase()));



    if (!sessions) return null;

    return (
        <div className={styles.playDescription}>
            <div className={styles.playInfo}>
                <div className={styles.poster}>
                    <img src={play.poster_url} alt={play.title} />
                </div>

                <div className={styles.playDetails}>
                    <div className={styles.infoMain}>
                        <h2 className={styles.title}>{play.title}</h2>
                        <p className={styles.description}>{play.description}</p>

                        <div className={styles.meta}>
                            <div className={styles.duration}><img src={time} alt="Продолжиьтельность" /> {hours}ч {minutes}мин</div>
                            <div className={styles.price}>Стоимость билета: {price}₽</div>
                        </div>
                    </div>

                    <div className={styles.actorsInfo}>
                        <h3 className={styles.actorsTitle}>Актёры</h3>
                            {selectedSession ? (
                                <PlayActor selectedSession={selectedSession} />

                            ) : (
                                <div className={styles.actors}>Выберите дату и время, чтобы отобразить актеров</div>
                            )}
                    </div>
                </div>
            </div>

            <div className={styles.seatsInfo}>
                <select
                    className={styles.select}
                    value={selectedSession || ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        onChangeSession(value === '' ? null : Number(value));
                    }}
                >
                    <option value="">Выберите дату и время сеанса</option>
                    {neededSessions?.map(session => (
                        <option key={session.session_id} value={session.session_id}>
                            {session.date} {session.time}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}