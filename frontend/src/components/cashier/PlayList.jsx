import PlayCard from './PlayCard';
import styles from './PlayList.module.css';
import PlayAvailableSeats from './playPage/PlayAvailableSeats';
import PlayAvailableSeatsV2 from './PlayAvailableSeatsV2/PlayAvailableSeatsV2';


export default function PlayList({ plays, selectedSession, selectedPlayId, onChangeSession, onChangePlayId }) {
  if (!plays || plays.length === 0) {
    return <div>Спектакли не найдены</div>;
  }

  return (
    <div className={styles.grid}>
      {plays.map(play => (
        <>
          <PlayCard
            key={play.play_id}
            play={play}
            selectedSession={selectedSession}
            onChangeSession={onChangeSession}
            onChangePlayId={onChangePlayId}
          />
          {selectedSession && selectedPlayId == play.play_id && (
            <PlayAvailableSeatsV2 sessionId={selectedSession} />
          )}
        </>
      ))}
    </div>
  );
}