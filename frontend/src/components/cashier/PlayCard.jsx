import styles from './PlayCard.module.css';
import time from '../../assets/icon/time.svg';
import date from '../../assets/icon/date.svg';
import { useSessions } from '../../hooks/useSessions';

export default function PlayCard({ play, selectedSession, onChangeSession, onChangePlayId }) {

  const hours = Math.floor(play.duration / 60);
  let minutes = play.duration % 60;

  if (minutes == 0) {
    minutes = "00";
  }

  let price = Number(play.price);

  const { sessions, loading } = useSessions();
  let neededSessions = sessions?.filter(session => session.play_title.toLowerCase().includes(play.title.toLowerCase())) || [];

  let formattedDate = null;
  if (neededSessions.length > 0 && neededSessions[0].date) {
    const dateObj = new Date(neededSessions[0].date);
    formattedDate = dateObj.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).replace(/^(\w+)(\s)/, '$1 - ');
  }



  if (loading) return <div>Загрузка сеансов...</div>;


  return (

    <>
      <article className={styles.playCard}>
        <div className={styles.infoContainer}>
          <div className={styles.title}>{play.title}</div>
          <div className={styles.timedate}>
            {neededSessions.length > 0 ? (
              <>
                <div className={styles.infoRow}>
                  <img src={date} alt="Дата" className={styles.icon} />
                  <span>{formattedDate}</span>
                </div>
                <div className={styles.infoRow}>
                  <img src={time} alt="Время" className={styles.icon} />
                  <span>{neededSessions[0].time} ({hours}ч {minutes}мин)</span>
                </div>
              </>
            ) : (
              <div>Нет доступных сеансов</div>
            )}
          </div>

          <div className={styles.seatsInfo}>
            <select
              className={styles.select}
              value={selectedSession || ''}
              onChange={(e) => {
                const value = e.target.value;
                onChangeSession(value === '' ? null : Number(value));
                onChangePlayId(play.play_id);
              }}
            >
              <option value="">
                {neededSessions.length == 0 ? (
                  <>Сеансы отсутствуют</>
                ) : (
                  <>Выберите дату и время сеанса</>
                )}
              </option>
              {neededSessions?.map(session => (
                <option key={session.session_id} value={session.session_id}>
                  {session.date} {session.time}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.price}>{price}₽</div>

        </div>
      </article>
    </>

  )
};