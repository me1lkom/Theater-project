import PlayCard from './PlayCard';
import styles from './PlayList.module.css';
export default function PlayList({ plays, onPlayClick }) {
  if (!plays || plays.length === 0) {
    return <div>Спектакли не найдены</div>;
  }

  return (
    <div className={styles.grid}>
      {plays.map(play => (
        <PlayCard
          key={play.play_id}
          play={play}
          onClick={onPlayClick}
        />
      ))}
    </div>
  );
}